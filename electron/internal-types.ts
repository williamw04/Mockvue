export type AgentAssistantId = 'resume-assistant' | 'behavioral-assistant';

export interface AgentEvidenceRef {
  source: string;
  sourceId: string;
  label?: string;
  snippet?: string;
}

export interface ResumeFact {
  id: string;
  kind: string;
  text: string;
  sourceId: string;
  tags: string[];
}

export interface ResumeDoc {
  resume: unknown | null;
  resumeAnalysis: unknown | null;
  candidateProfile: unknown | null;
  stories: unknown[];
  interviewResponses: unknown[];
  facts: ResumeFact[];
}

export type MemoryEntryKind = 'preference' | 'goal' | 'fact' | 'summary';

export interface MemoryEntry {
  id: string;
  sessionId: string;
  assistantId: AgentAssistantId;
  content: string;
  kind: MemoryEntryKind;
  createdAt: string;
  updatedAt: string;
}

export interface ContextSummary {
  sessionId: string;
  summary: string;
  updatedAt: string;
}

export interface AgentSession {
  id: string;
  assistantId: AgentAssistantId;
  title: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  lastTurnAt?: string;
  summary?: string;
}

export interface CreateAgentSessionInput {
  assistantId: AgentAssistantId;
  title?: string;
  initialContext?: string;
}

export interface AgentTurnInput {
  sessionId: string;
  message: string;
  includeMemory?: boolean;
}

export interface AgentTurnResult {
  session: AgentSession;
  reply: string;
  evidence: AgentEvidenceRef[];
  memoryUpdated: boolean;
}

export type VoiceInterviewMode = 'text-only' | 'stt-llm-tts' | 'realtime-s2s';

export type VoiceInterviewSessionStatus = 'draft' | 'active' | 'paused' | 'ended' | 'error';

export type VoiceInterviewSpeaker = 'system' | 'interviewer' | 'candidate';

export type VoiceInterviewEventType =
  | 'session-created'
  | 'session-started'
  | 'session-paused'
  | 'session-resumed'
  | 'session-interrupted'
  | 'session-ended'
  | 'transcript-appended';

export interface VoiceInterviewContext {
  targetRole?: string;
  targetCompany?: string;
  candidateSummary?: string;
  questionPlanId?: string;
}

export interface CreateVoiceInterviewSessionInput {
  mode: VoiceInterviewMode;
  context?: VoiceInterviewContext;
}

export interface AppendVoiceTranscriptEventInput {
  speaker: VoiceInterviewSpeaker;
  text: string;
}

export interface VoiceInterviewSession {
  id: string;
  mode: VoiceInterviewMode;
  status: VoiceInterviewSessionStatus;
  context: VoiceInterviewContext;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  endedAt?: string;
}

export interface VoiceTranscriptEvent {
  id: string;
  sessionId: string;
  speaker: VoiceInterviewSpeaker;
  text: string;
  createdAt: string;
}

export interface VoiceInterviewEvent {
  id: string;
  sessionId: string;
  type: VoiceInterviewEventType;
  createdAt: string;
  payload?: Record<string, unknown>;
}
