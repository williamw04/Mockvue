import type { VoiceInterviewSession } from '../internal-types';
import type { VoiceInterviewProviderAdapter } from './provider';
import type { InterviewConfig, InterviewState } from './interview-config';
import { DeepgramSTTProvider, STTResult, STTEventHandler, DEFAULT_STT_CONFIG } from './deepgram-stt';
import { DeepgramTTSProvider, TTSEventHandler, DEFAULT_TTS_CONFIG, audioBufferToBase64 } from './deepgram-tts';
import { InterviewerAgent, InterviewTurnInput, InterviewTurnOutput } from './interviewer-agent';

export interface STTLLMTTSConfig {
  deepgramApiKey: string;
  geminiApiKey: string;
  interviewConfig: InterviewConfig;
  sttConfig?: Partial<typeof DEFAULT_STT_CONFIG>;
  ttsConfig?: Partial<typeof DEFAULT_TTS_CONFIG>;
}

export interface STTLLMTTSEventHandler {
  onCandidateTranscript: (text: string, isFinal: boolean) => void;
  onInterviewerResponse: (text: string) => void;
  onAudioOutput: (audioBase64: string) => void;
  onStateChange: (state: InterviewState) => void;
  onPhaseChange: (from: string, to: string) => void;
  onSpeechStarted: () => void;
  onSpeechEnded: () => void;
  onError: (error: Error) => void;
  onSessionReady: () => void;
  onSessionEnded: () => void;
}

type VoicePipelineState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'ended';

export class STTLLMTTSVoiceProvider implements VoiceInterviewProviderAdapter {
  readonly mode = 'stt-llm-tts' as const;

  private sttProvider: DeepgramSTTProvider | null = null;
  private ttsProvider: DeepgramTTSProvider | null = null;
  private interviewerAgent: InterviewerAgent | null = null;
  private handlers: STTLLMTTSEventHandler;
  private config: STTLLMTTSConfig;
  private pipelineState: VoicePipelineState = 'idle';
  private pendingTranscript: string = '';
  private silenceTimeout: NodeJS.Timeout | null = null;
  private isSpeaking: boolean = false;
  private audioQueue: Buffer[] = [];
  private keepAliveInterval: NodeJS.Timeout | null = null;

  constructor(config: STTLLMTTSConfig, handlers: STTLLMTTSEventHandler) {
    this.config = config;
    this.handlers = handlers;
  }

  async connect(session: VoiceInterviewSession): Promise<void> {
    this.pipelineState = 'idle';

    const sttHandlers: STTEventHandler = {
      onTranscript: (result: STTResult) => this.handleSTTResult(result),
      onError: (error: Error) => this.handlers.onError(error),
      onOpen: () => console.log('[STTLLMTTS] STT connected'),
      onClose: () => console.log('[STTLLMTTS] STT disconnected'),
      onSpeechStarted: () => {
        this.isSpeaking = true;
        this.clearSilenceTimeout();
        this.handlers.onSpeechStarted();
      },
      onSpeechEnded: () => {
        this.isSpeaking = false;
        this.startSilenceTimeout();
        this.handlers.onSpeechEnded();
      },
    };

    const ttsHandlers: TTSEventHandler = {
      onAudioChunk: (audio: Buffer) => {
        this.audioQueue.push(audio);
        this.handlers.onAudioOutput(audioBufferToBase64(audio));
      },
      onComplete: () => {
        this.pipelineState = 'listening';
        this.audioQueue = [];
      },
      onError: (error: Error) => this.handlers.onError(error),
      onOpen: () => console.log('[STTLLMTTS] TTS connected'),
      onClose: () => console.log('[STTLLMTTS] TTS disconnected'),
      onFlushed: () => console.log('[STTLLMTTS] TTS flushed'),
    };

    const interviewerHandlers = {
      onResponse: (text: string) => {
        this.handlers.onInterviewerResponse(text);
        this.speakResponse(text);
      },
      onPhaseChange: (from: string, to: string) => this.handlers.onPhaseChange(from, to),
      onStateUpdate: (state: InterviewState) => this.handlers.onStateChange(state),
      onError: (error: Error) => this.handlers.onError(error),
    };

    this.sttProvider = new DeepgramSTTProvider(this.config.deepgramApiKey, sttHandlers, this.config.sttConfig);
    this.ttsProvider = new DeepgramTTSProvider(this.config.deepgramApiKey, ttsHandlers, this.config.ttsConfig);
    this.interviewerAgent = new InterviewerAgent(
      { geminiApiKey: this.config.geminiApiKey, interviewConfig: this.config.interviewConfig },
      interviewerHandlers
    );

    await this.sttProvider.connect();
    await this.ttsProvider.connect();

    const openingMessage = await this.interviewerAgent.initialize();
    await this.speakResponse(openingMessage);

    this.startKeepAlive();
    this.handlers.onSessionReady();
    this.pipelineState = 'listening';
  }

  private handleSTTResult(result: STTResult): void {
    if (this.pipelineState !== 'listening') {
      return;
    }

    if (result.transcript) {
      this.handlers.onCandidateTranscript(result.transcript, result.isFinal);
      
      if (result.isFinal) {
        this.pendingTranscript += result.transcript + ' ';
      }
    }

    if (result.speechFinal && this.pendingTranscript.trim()) {
      this.processCompleteTranscript();
    }
  }

  private processCompleteTranscript(): void {
    const candidateText = this.pendingTranscript.trim();
    this.pendingTranscript = '';

    if (!candidateText || this.pipelineState !== 'listening') {
      return;
    }

    this.pipelineState = 'thinking';
    this.clearSilenceTimeout();

    if (!this.interviewerAgent) {
      this.handlers.onError(new Error('Interviewer agent not initialized'));
      this.pipelineState = 'listening';
      return;
    }

    const turnInput: InterviewTurnInput = { candidateSpeech: candidateText };
    this.interviewerAgent.processCandidateInput(turnInput)
      .then((output: InterviewTurnOutput) => {
        if (output.shouldEnd) {
          this.endGracefully();
        }
      })
      .catch((error: unknown) => {
        this.handlers.onError(error instanceof Error ? error : new Error(String(error)));
        this.pipelineState = 'listening';
      });
  }

  private speakResponse(text: string): void {
    if (!this.ttsProvider || !text) {
      return;
    }

    this.pipelineState = 'speaking';
    this.ttsProvider.speak(text);
    this.ttsProvider.flush();
  }

  private startSilenceTimeout(): void {
    this.clearSilenceTimeout();
    
    const threshold = this.config.interviewConfig.conversationRules.silenceThresholdMs || 3000;
    
    this.silenceTimeout = setTimeout(() => {
      if (this.pendingTranscript.trim() && this.pipelineState === 'listening') {
        this.processCompleteTranscript();
      }
    }, threshold);
  }

  private clearSilenceTimeout(): void {
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
  }

  private startKeepAlive(): void {
    this.keepAliveInterval = setInterval(() => {
      this.sttProvider?.keepAlive();
      this.ttsProvider?.keepAlive();
    }, 15000);
  }

  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  async pause(sessionId: string): Promise<void> {
    this.pipelineState = 'idle';
    this.clearSilenceTimeout();
    
    if (this.ttsProvider) {
      this.ttsProvider.clear();
    }
  }

  async resume(sessionId: string): Promise<void> {
    this.pipelineState = 'listening';
  }

  async interrupt(sessionId: string): Promise<void> {
    if (this.ttsProvider) {
      this.ttsProvider.clear();
    }
    this.pipelineState = 'listening';
    this.audioQueue = [];
  }

  async disconnect(sessionId: string): Promise<void> {
    this.stopKeepAlive();
    this.clearSilenceTimeout();
    this.pipelineState = 'ended';

    if (this.sttProvider) {
      await this.sttProvider.disconnect();
      this.sttProvider = null;
    }

    if (this.ttsProvider) {
      await this.ttsProvider.disconnect();
      this.ttsProvider = null;
    }

    this.interviewerAgent = null;
    this.handlers.onSessionEnded();
  }

  async endGracefully(): Promise<void> {
    if (this.interviewerAgent) {
      const closing = await this.interviewerAgent.generateClosing();
      await this.speakResponse(closing);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    this.handlers.onSessionEnded();
  }

  sendAudioInput(audioBase64: string): void {
    if (this.sttProvider && this.pipelineState === 'listening') {
      const buffer = Buffer.from(audioBase64, 'base64');
      this.sttProvider.sendAudio(buffer);
    }
  }

  getPipelineState(): VoicePipelineState {
    return this.pipelineState;
  }

  isReady(): boolean {
    return Boolean(this.sttProvider?.isActive()) && Boolean(this.ttsProvider?.isActive());
  }
}

export function createSTTLLMTTSProvider(
  config: STTLLMTTSConfig,
  handlers: STTLLMTTSEventHandler
): STTLLMTTSVoiceProvider {
  return new STTLLMTTSVoiceProvider(config, handlers);
}