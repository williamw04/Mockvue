import type { AppendVoiceTranscriptEventInput, CreateVoiceInterviewSessionInput, VoiceInterviewSession } from '../internal-types';
import type { VoiceInterviewProviderAdapter } from './provider';
import { VoiceInterviewSessionStore } from './session-store';

export class VoiceInterviewController {
  constructor(
    private readonly store: VoiceInterviewSessionStore,
    private readonly provider: VoiceInterviewProviderAdapter,
  ) {}

  createSession(input: CreateVoiceInterviewSessionInput) {
    return this.store.createSession(input);
  }

  getSession(sessionId: string) {
    return this.store.getSession(sessionId);
  }

  listSessions() {
    return this.store.listSessions();
  }

  async startSession(sessionId: string): Promise<VoiceInterviewSession> {
    const session = this.requireSession(sessionId);
    const updated = { ...session, status: 'active' as const, startedAt: session.startedAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.store.saveSession(updated);
    this.store.appendEvent(sessionId, 'session-started');
    await this.provider.connect(updated);
    return updated;
  }

  async pauseSession(sessionId: string): Promise<VoiceInterviewSession> {
    const updated = this.updateStatus(sessionId, 'paused', 'session-paused');
    await this.provider.pause(sessionId);
    return updated;
  }

  async resumeSession(sessionId: string): Promise<VoiceInterviewSession> {
    const updated = this.updateStatus(sessionId, 'active', 'session-resumed');
    await this.provider.resume(sessionId);
    return updated;
  }

  async interruptSession(sessionId: string): Promise<VoiceInterviewSession> {
    const session = this.requireSession(sessionId);
    this.store.appendEvent(sessionId, 'session-interrupted');
    await this.provider.interrupt(sessionId);
    return session;
  }

  async endSession(sessionId: string): Promise<VoiceInterviewSession> {
    const session = this.requireSession(sessionId);
    const updated = {
      ...session,
      status: 'ended' as const,
      endedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.saveSession(updated);
    this.store.appendEvent(sessionId, 'session-ended');
    await this.provider.disconnect(sessionId);
    return updated;
  }

  getTranscript(sessionId: string) {
    return this.store.getTranscript(sessionId);
  }

  appendTranscriptEvent(sessionId: string, input: AppendVoiceTranscriptEventInput) {
    this.requireSession(sessionId);
    return this.store.appendTranscriptEvent(sessionId, input);
  }

  getEvents(sessionId: string) {
    return this.store.getEvents(sessionId);
  }

  private requireSession(sessionId: string): VoiceInterviewSession {
    const session = this.store.getSession(sessionId);
    if (!session) {
      throw new Error(`Voice interview session not found: ${sessionId}`);
    }
    return session;
  }

  private updateStatus(sessionId: string, status: VoiceInterviewSession['status'], eventType: 'session-paused' | 'session-resumed'): VoiceInterviewSession {
    const session = this.requireSession(sessionId);
    const updated = { ...session, status, updatedAt: new Date().toISOString() };
    this.store.saveSession(updated);
    this.store.appendEvent(sessionId, eventType);
    return updated;
  }
}
