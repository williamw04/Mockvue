import type { VoiceInterviewSession } from '../internal-types';
import type { VoiceInterviewProviderAdapter } from './provider';

export class TextOnlyVoiceInterviewProvider implements VoiceInterviewProviderAdapter {
  readonly mode = 'text-only' as const;

  async connect(_session: VoiceInterviewSession): Promise<void> {}
  async pause(_sessionId: string): Promise<void> {}
  async resume(_sessionId: string): Promise<void> {}
  async interrupt(_sessionId: string): Promise<void> {}
  async disconnect(_sessionId: string): Promise<void> {}
}
