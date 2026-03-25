/* eslint-disable @typescript-eslint/no-explicit-any */
export type AgentAssistantId = 'resume-assistant' | 'behavioral-assistant';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  targetRole?: string;
  targetCompany?: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  role: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface Resume {
  id: string;
  userId: string;
  workExperiences: WorkExperience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  summary?: string;
  rawText?: string;
  resumePdfPath?: string;
  coreStoryMatches?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: string;
  userId: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  tags: string[];
  relatedExperienceId?: string;
  coreCategory?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewResponse {
  id: string;
  userId: string;
  question: string;
  response: string;
  storyIds: string[];
  tags: string[];
  isPracticed: boolean;
  lastPracticedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentQuestion {
  id: string;
  text: string;
  response: string;
  isExpanded: boolean;
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  description?: string;
  questions: DocumentQuestion[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastModified: string;
}

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
  messageCount: number;
  resumeAnalysisSnapshot?: unknown;
  resumeSnapshot?: unknown;
  forkedFrom?: string;
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type AgentStepKind = 'thinking' | 'tool_call' | 'tool_result' | 'response';

export interface AgentStep {
  id: string;
  kind: AgentStepKind;
  timestamp: string;
  thinking?: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: unknown;
  toolError?: string;
  content?: string;
}

export interface AgentTurnTrace {
  steps: AgentStep[];
  totalToolCalls: number;
  totalTokens?: number;
}

export interface CreateAgentSessionInput {
  assistantId: AgentAssistantId;
  title?: string;
  initialContext?: string;
  resumeAnalysisSnapshot?: unknown;
  resumeSnapshot?: unknown;
  forkFromSessionId?: string;
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
  trace: AgentTurnTrace;
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
