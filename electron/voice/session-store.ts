import type {
  AppendVoiceTranscriptEventInput,
  CreateVoiceInterviewSessionInput,
  VoiceInterviewEvent,
  VoiceInterviewSession,
  VoiceTranscriptEvent,
} from '../internal-types';

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export class VoiceInterviewSessionStore {
  private sessions = new Map<string, VoiceInterviewSession>();
  private transcripts = new Map<string, VoiceTranscriptEvent[]>();
  private events = new Map<string, VoiceInterviewEvent[]>();

  createSession(input: CreateVoiceInterviewSessionInput): VoiceInterviewSession {
    const now = new Date().toISOString();
    const session: VoiceInterviewSession = {
      id: createId('voice-session'),
      mode: input.mode,
      status: 'draft',
      context: input.context || {},
      createdAt: now,
      updatedAt: now,
    };
    this.sessions.set(session.id, session);
    this.transcripts.set(session.id, []);
    this.appendEvent(session.id, 'session-created');
    return session;
  }

  getSession(sessionId: string): VoiceInterviewSession | null {
    return this.sessions.get(sessionId) || null;
  }

  listSessions(): VoiceInterviewSession[] {
    return Array.from(this.sessions.values());
  }

  saveSession(session: VoiceInterviewSession): VoiceInterviewSession {
    this.sessions.set(session.id, session);
    return session;
  }

  appendTranscriptEvent(sessionId: string, input: AppendVoiceTranscriptEventInput): VoiceTranscriptEvent {
    const event: VoiceTranscriptEvent = {
      id: createId('voice-transcript'),
      sessionId,
      speaker: input.speaker,
      text: input.text,
      createdAt: new Date().toISOString(),
    };
    const existing = this.transcripts.get(sessionId) || [];
    existing.push(event);
    this.transcripts.set(sessionId, existing);
    this.appendEvent(sessionId, 'transcript-appended', { speaker: input.speaker });
    return event;
  }

  getTranscript(sessionId: string): VoiceTranscriptEvent[] {
    return this.transcripts.get(sessionId) || [];
  }

  appendEvent(sessionId: string, type: VoiceInterviewEvent['type'], payload?: Record<string, unknown>): VoiceInterviewEvent {
    const event: VoiceInterviewEvent = {
      id: createId('voice-event'),
      sessionId,
      type,
      createdAt: new Date().toISOString(),
      payload,
    };
    const existing = this.events.get(sessionId) || [];
    existing.push(event);
    this.events.set(sessionId, existing);
    return event;
  }

  getEvents(sessionId: string): VoiceInterviewEvent[] {
    return this.events.get(sessionId) || [];
  }
}
