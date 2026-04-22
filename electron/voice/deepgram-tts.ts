import WebSocket from 'ws';

export interface TTSConfig {
  apiKey: string;
  model: string;
  encoding?: string;
  sampleRate?: number;
  container?: string;
  bitrate?: number;
}

export interface TTSResult {
  audio: Buffer;
  contentType: string;
  isComplete: boolean;
}

export interface TTSEventHandler {
  onAudioChunk: (audio: Buffer) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onFlushed?: () => void;
}

export const DEFAULT_TTS_CONFIG: TTSConfig = {
  apiKey: '',
  model: 'aura-2-asteria-en',
  encoding: 'linear16',
  sampleRate: 24000,
  container: 'none',
  bitrate: 128000,
};

export class DeepgramTTSProvider {
  private ws: WebSocket | null = null;
  private connected = false;
  private handlers: TTSEventHandler;
  private config: TTSConfig;
  private currentRequestId: string | null = null;
  private audioChunks: Buffer[] = [];

  constructor(apiKey: string, handlers: TTSEventHandler, config?: Partial<TTSConfig>) {
    this.config = { ...DEFAULT_TTS_CONFIG, ...config, apiKey };
    this.handlers = handlers;
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    const params = new URLSearchParams({
      model: this.config.model,
      encoding: this.config.encoding || 'linear16',
      sample_rate: String(this.config.sampleRate || 24000),
      container: this.config.container || 'none',
    });

    const url = `wss://api.deepgram.com/v1/speak?${params.toString()}`;

    try {
      this.ws = new WebSocket(url, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });

      this.ws.on('open', () => {
        this.connected = true;
        this.handlers.onOpen?.();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        if (typeof data === 'string') {
          this.handleControlMessage(data);
        } else {
          this.handleAudioData(data as Buffer);
        }
      });

      this.ws.on('error', (error: Error) => {
        this.handlers.onError(error);
      });

      this.ws.on('close', () => {
        this.connected = false;
        this.handlers.onClose?.();
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

  private handleControlMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'Flushed') {
        this.handlers.onFlushed?.();
        this.handlers.onComplete();
      } else if (message.type === 'Cleared') {
        this.audioChunks = [];
      } else if (message.type === 'Warning') {
        this.handlers.onError(new Error(`TTS Warning: ${message.message}`));
      } else if (message.type === 'Error') {
        this.handlers.onError(new Error(`TTS Error: ${message.description || message.message}`));
      }
    } catch (error: unknown) {
      this.handlers.onError(new Error(`Failed to parse control message: ${error}`));
    }
  }

  private handleAudioData(data: Buffer): void {
    this.audioChunks.push(data);
    this.handlers.onAudioChunk(data);
  }

  speak(text: string): void {
    if (!this.connected || !this.ws) {
      this.handlers.onError(new Error('TTS not connected'));
      return;
    }

    if (this.ws.readyState !== WebSocket.OPEN) {
      this.handlers.onError(new Error('WebSocket not open'));
      return;
    }

    this.currentRequestId = `tts-${Date.now()}`;
    this.audioChunks = [];

    const speakMessage = {
      type: 'Speak',
      text: text,
    };

    this.ws.send(JSON.stringify(speakMessage));
  }

  flush(): void {
    if (!this.connected || !this.ws) {
      return;
    }

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'Flush' }));
    }
  }

  clear(): void {
    if (!this.connected || !this.ws) {
      return;
    }

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'Clear' }));
      this.audioChunks = [];
    }
  }

  async speakAndWait(text: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const timeout = setTimeout(() => {
        reject(new Error('TTS timeout'));
      }, 30000);

      const originalOnAudioChunk = this.handlers.onAudioChunk;
      const originalOnComplete = this.handlers.onComplete;
      const originalOnError = this.handlers.onError;

      this.handlers.onAudioChunk = (audio: Buffer) => {
        chunks.push(audio);
        originalOnAudioChunk(audio);
      };

      this.handlers.onComplete = () => {
        clearTimeout(timeout);
        this.handlers.onAudioChunk = originalOnAudioChunk;
        this.handlers.onComplete = originalOnComplete;
        this.handlers.onError = originalOnError;
        resolve(Buffer.concat(chunks));
        originalOnComplete();
      };

      this.handlers.onError = (error: Error) => {
        clearTimeout(timeout);
        this.handlers.onAudioChunk = originalOnAudioChunk;
        this.handlers.onComplete = originalOnComplete;
        this.handlers.onError = originalOnError;
        reject(error);
        originalOnError(error);
      };

      this.speak(text);
      this.flush();
    });
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
      this.ws = null;
    }
    this.connected = false;
    this.currentRequestId = null;
    this.audioChunks = [];
  }

  isActive(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  getAudioFormat(): { encoding: string; sampleRate: number } {
    return {
      encoding: this.config.encoding || 'linear16',
      sampleRate: this.config.sampleRate || 24000,
    };
  }

  keepAlive(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'KeepAlive' }));
    }
  }
}

export function createTTSProvider(apiKey: string, handlers: TTSEventHandler, config?: Partial<TTSConfig>): DeepgramTTSProvider {
  return new DeepgramTTSProvider(apiKey, handlers, config);
}

export function audioBufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}

export function combineAudioChunks(chunks: Buffer[]): Buffer {
  return Buffer.concat(chunks);
}