import type { VoiceInterviewSession } from '../internal-types';
import type { VoiceInterviewProviderAdapter } from './provider';

export class TextOnlyVoiceInterviewProvider implements VoiceInterviewProviderAdapter {
  readonly mode = 'text-only' as const;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async connect(_session: VoiceInterviewSession): Promise<void> {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async pause(_sessionId: string): Promise<void> {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async resume(_sessionId: string): Promise<void> {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async interrupt(_sessionId: string): Promise<void> {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async disconnect(_sessionId: string): Promise<void> {}
}
