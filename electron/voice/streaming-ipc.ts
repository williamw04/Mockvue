import type { IpcMain, BrowserWindow } from 'electron';
import type { InterviewConfig } from './interview-config';
import { STTLLMTTSVoiceProvider, STTLLMTTSEventHandler } from './stt-llm-tts-provider';

interface ActiveVoiceSession {
  sessionId: string;
  provider: STTLLMTTSVoiceProvider;
  mainWindow: BrowserWindow;
}

const activeSessions = new Map<string, ActiveVoiceSession>();

export interface CreateVoiceInterviewWithConfigInput {
  sessionId: string;
  deepgramApiKey: string;
  geminiApiKey: string;
  interviewConfig: InterviewConfig;
}

export interface SendAudioInput {
  sessionId: string;
  audioBase64: string;
}

export function registerVoiceInterviewStreamingIpcHandlers(
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null
): void {
  ipcMain.handle(
    'voice-interview-streaming:create',
    async (_event, input: CreateVoiceInterviewWithConfigInput) => {
      const mainWindow = getMainWindow();
      if (!mainWindow) {
        throw new Error('Main window not available');
      }

      // Resolve API keys from input or environment
      const deepgramApiKey = input.deepgramApiKey || process.env.VITE_DEEPGRAM_API_KEY || '';
      const geminiApiKey = input.geminiApiKey || process.env.VITE_GEMINI_API_KEY || '';

      if (!deepgramApiKey) {
        throw new Error(
          'Deepgram API key not configured. Set VITE_DEEPGRAM_API_KEY in your .env file.'
        );
      }
      if (!geminiApiKey) {
        throw new Error(
          'Gemini API key not configured. Set VITE_GEMINI_API_KEY in your .env file.'
        );
      }

      const handlers: STTLLMTTSEventHandler = {
        onCandidateTranscript: (text: string, isFinal: boolean) => {
          mainWindow.webContents.send('voice-interview:candidate-transcript', {
            sessionId: input.sessionId,
            text,
            isFinal,
          });
        },
        onInterviewerResponse: (text: string) => {
          mainWindow.webContents.send('voice-interview:interviewer-response', {
            sessionId: input.sessionId,
            text,
          });
        },
        onAudioOutput: (audioBase64: string) => {
          mainWindow.webContents.send('voice-interview:audio-output', {
            sessionId: input.sessionId,
            audioBase64,
          });
        },
        onStateChange: (state) => {
          mainWindow.webContents.send('voice-interview:state-change', {
            sessionId: input.sessionId,
            state,
          });
        },
        onPhaseChange: (from: string, to: string) => {
          mainWindow.webContents.send('voice-interview:phase-change', {
            sessionId: input.sessionId,
            from,
            to,
          });
        },
        onSpeechStarted: () => {
          mainWindow.webContents.send('voice-interview:speech-started', {
            sessionId: input.sessionId,
          });
        },
        onSpeechEnded: () => {
          mainWindow.webContents.send('voice-interview:speech-ended', {
            sessionId: input.sessionId,
          });
        },
        onError: (error: Error) => {
          mainWindow.webContents.send('voice-interview:error', {
            sessionId: input.sessionId,
            error: error.message,
          });
        },
        onSessionReady: () => {
          mainWindow.webContents.send('voice-interview:session-ready', {
            sessionId: input.sessionId,
          });
        },
        onSessionEnded: () => {
          mainWindow.webContents.send('voice-interview:session-ended', {
            sessionId: input.sessionId,
          });
          activeSessions.delete(input.sessionId);
        },
      };

      const provider = new STTLLMTTSVoiceProvider(
        {
          deepgramApiKey,
          geminiApiKey,
          interviewConfig: input.interviewConfig,
        },
        handlers
      );

      activeSessions.set(input.sessionId, {
        sessionId: input.sessionId,
        provider,
        mainWindow,
      });

      return { success: true, sessionId: input.sessionId };
    }
  );

  ipcMain.handle('voice-interview-streaming:start', async (_event, sessionId: string) => {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    await session.provider.connect({
      id: sessionId,
      mode: 'stt-llm-tts',
      status: 'active',
      context: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  });

  ipcMain.handle('voice-interview-streaming:send-audio', async (_event, input: SendAudioInput) => {
    const session = activeSessions.get(input.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${input.sessionId}`);
    }

    session.provider.sendAudioInput(input.audioBase64);
    return { success: true };
  });

  ipcMain.handle('voice-interview-streaming:pause', async (_event, sessionId: string) => {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    await session.provider.pause(sessionId);
    return { success: true };
  });

  ipcMain.handle('voice-interview-streaming:resume', async (_event, sessionId: string) => {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    await session.provider.resume(sessionId);
    return { success: true };
  });

  ipcMain.handle('voice-interview-streaming:interrupt', async (_event, sessionId: string) => {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    await session.provider.interrupt(sessionId);
    return { success: true };
  });

  ipcMain.handle('voice-interview-streaming:end', async (_event, sessionId: string) => {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    await session.provider.disconnect(sessionId);
    activeSessions.delete(sessionId);
    return { success: true };
  });

  ipcMain.handle('voice-interview-streaming:get-state', async (_event, sessionId: string) => {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    return {
      pipelineState: session.provider.getPipelineState(),
      isReady: session.provider.isReady(),
    };
  });

  ipcMain.handle('voice-interview-streaming:list-active', async () => {
    return Array.from(activeSessions.keys());
  });
}

export function cleanupAllVoiceSessions(): void {
  for (const [sessionId, session] of activeSessions) {
    session.provider.disconnect(sessionId).catch((error) => {
      console.error(`Error cleaning up session ${sessionId}:`, error);
    });
  }
  activeSessions.clear();
}
