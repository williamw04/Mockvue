import type { IVoiceInterviewService } from '../interfaces';
import type {
  AppendVoiceTranscriptEventInput,
  CreateVoiceInterviewSessionInput,
  VoiceInterviewEvent,
  VoiceInterviewSession,
  VoiceTranscriptEvent,
} from '../../types';

export class ElectronVoiceInterviewService implements IVoiceInterviewService {
  private get api() {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI;
  }

  createSession(input: CreateVoiceInterviewSessionInput): Promise<VoiceInterviewSession> {
    return this.api.voiceInterviewCreateSession(input);
  }

  getSession(sessionId: string): Promise<VoiceInterviewSession | null> {
    return this.api.voiceInterviewGetSession(sessionId);
  }

  listSessions(): Promise<VoiceInterviewSession[]> {
    return this.api.voiceInterviewListSessions();
  }

  startSession(sessionId: string): Promise<VoiceInterviewSession> {
    return this.api.voiceInterviewStartSession(sessionId);
  }

  pauseSession(sessionId: string): Promise<VoiceInterviewSession> {
    return this.api.voiceInterviewPauseSession(sessionId);
  }

  resumeSession(sessionId: string): Promise<VoiceInterviewSession> {
    return this.api.voiceInterviewResumeSession(sessionId);
  }

  interruptSession(sessionId: string): Promise<VoiceInterviewSession> {
    return this.api.voiceInterviewInterruptSession(sessionId);
  }

  endSession(sessionId: string): Promise<VoiceInterviewSession> {
    return this.api.voiceInterviewEndSession(sessionId);
  }

  getTranscript(sessionId: string): Promise<VoiceTranscriptEvent[]> {
    return this.api.voiceInterviewGetTranscript(sessionId);
  }

  appendTranscriptEvent(sessionId: string, input: AppendVoiceTranscriptEventInput): Promise<VoiceTranscriptEvent> {
    return this.api.voiceInterviewAppendTranscriptEvent(sessionId, input);
  }

  getEvents(sessionId: string): Promise<VoiceInterviewEvent[]> {
    return this.api.voiceInterviewGetEvents(sessionId);
  }
}
