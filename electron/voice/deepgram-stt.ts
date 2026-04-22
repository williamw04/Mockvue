import WebSocket from 'ws';

export interface STTConfig {
  apiKey: string;
  model: string;
  language?: string;
  encoding?: string;
  sampleRate?: number;
  channels?: number;
  interimResults?: boolean;
  endpointing?: number;
  vadEvents?: boolean;
}

export interface STTResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  speechFinal?: boolean;
}

export interface STTEventHandler {
  onTranscript: (result: STTResult) => void;
  onError: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onSpeechStarted?: () => void;
  onSpeechEnded?: () => void;
}

export const DEFAULT_STT_CONFIG: STTConfig = {
  apiKey: '',
  model: 'nova-3',
  language: 'en-US',
  encoding: 'linear16',
  sampleRate: 16000,
  channels: 1,
  interimResults: true,
  endpointing: 300,
  vadEvents: true,
};

export class DeepgramSTTProvider {
  private ws: WebSocket | null = null;
  private connected = false;
  private handlers: STTEventHandler;
  private config: STTConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private audioBuffer: Buffer[] = [];
  private isProcessing = false;

  constructor(apiKey: string, handlers: STTEventHandler, config?: Partial<STTConfig>) {
    this.config = { ...DEFAULT_STT_CONFIG, ...config, apiKey };
    this.handlers = handlers;
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    const params = new URLSearchParams({
      model: this.config.model,
      language: this.config.language || 'en-US',
      encoding: this.config.encoding || 'linear16',
      sample_rate: String(this.config.sampleRate || 16000),
      channels: String(this.config.channels || 1),
      interim_results: String(this.config.interimResults ?? true),
      endpointing: String(this.config.endpointing || 300),
      vad_events: String(this.config.vadEvents ?? true),
    });

    const url = `wss://api.deepgram.com/v1/listen?${params.toString()}`;

    try {
      this.ws = new WebSocket(url, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });

      this.ws.on('open', () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        this.handlers.onOpen?.();
        this.flushAudioBuffer();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        this.handleMessage(data);
      });

      this.ws.on('error', (error: Error) => {
        this.handlers.onError(error);
      });

      this.ws.on('close', () => {
        this.connected = false;
        this.handlers.onClose?.();
        this.attemptReconnect();
      });

      await this.waitForConnection();
    } catch (error) {
      this.handlers.onError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('WebSocket not initialized'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      this.ws.once('open', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.ws.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  private handleMessage(data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'Results') {
        const channel = message.channel?.alternatives?.[0];
        if (channel) {
          const result: STTResult = {
            transcript: channel.transcript || '',
            isFinal: message.is_final === true,
            confidence: channel.confidence || 0,
            words: channel.words?.map((w: { word: string; start: number; end: number; confidence: number }) => ({
              word: w.word,
              start: w.start,
              end: w.end,
              confidence: w.confidence,
            })),
            speechFinal: message.speech_final === true,
          };
          this.handlers.onTranscript(result);
        }
      } else if (message.type === 'SpeechStarted') {
        this.handlers.onSpeechStarted?.();
      } else if (message.type === 'SpeechStopped') {
        this.handlers.onSpeechEnded?.();
      }
    } catch (error: unknown) {
      this.handlers.onError(new Error(`Failed to parse message: ${error}`));
    }
  }

  sendAudio(audioData: Buffer): void {
    if (!this.connected || !this.ws) {
      this.audioBuffer.push(audioData);
      return;
    }

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(audioData);
    }
  }

  sendAudioFromBase64(base64Audio: string): void {
    const buffer = Buffer.from(base64Audio, 'base64');
    this.sendAudio(buffer);
  }

  private flushAudioBuffer(): void {
    while (this.audioBuffer.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const chunk = this.audioBuffer.shift();
      if (chunk) {
        this.ws.send(chunk);
      }
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.handlers.onError(new Error('Max reconnect attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000;

    setTimeout(() => {
      this.connect().catch(() => {
        this.handlers.onError(new Error('Reconnect failed'));
      });
    }, delay);
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'CloseStream' }));
        this.ws.close();
      }
      this.ws = null;
    }
    this.connected = false;
    this.audioBuffer = [];
  }

  isActive(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  keepAlive(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'KeepAlive' }));
    }
  }
}

export function createSTTProvider(apiKey: string, handlers: STTEventHandler, config?: Partial<STTConfig>): DeepgramSTTProvider {
  return new DeepgramSTTProvider(apiKey, handlers, config);
}