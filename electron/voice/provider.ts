import type { VoiceInterviewMode, VoiceInterviewSession } from '../internal-types';

export interface VoiceInterviewProviderAdapter {
  readonly mode: VoiceInterviewMode;
  connect(session: VoiceInterviewSession): Promise<void>;
  pause(sessionId: string): Promise<void>;
  resume(sessionId: string): Promise<void>;
  interrupt(sessionId: string): Promise<void>;
  disconnect(sessionId: string): Promise<void>;
}
