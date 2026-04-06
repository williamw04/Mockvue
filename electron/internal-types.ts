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

// Coaching Workspace Types

export type CoachingGoalType = 'score_improvement' | 'weakness_elimination' | 'section_overhaul' | 'role_tailoring' | 'custom';
export type CoachingGoalStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';
export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type StagedChangeStatus = 'pending' | 'accepted' | 'rejected' | 'modified';

export interface CoachingGoal {
  id: string;
  sessionId: string;
  type: CoachingGoalType;
  title: string;
  description: string;
  targetMetric?: string;
  targetValue?: number;
  currentValue?: number;
  status: CoachingGoalStatus;
  progress: number;
  createdAt: string;
  completedAt?: string;
}

export interface CoachingTodo {
  id: string;
  sessionId: string;
  goalId?: string;
  title: string;
  description?: string;
  targetType?: 'bullet' | 'section' | 'story' | 'general';
  targetId?: string;
  status: TodoStatus;
  proposedBy: 'user' | 'agent';
  createdAt: string;
  completedAt?: string;
}

export interface ChangeAlternative {
  id: string;
  value: string;
  label: string;
  predictedScore?: number;
}

export interface StagedChange {
  id: string;
  sessionId: string;
  todoId?: string;
  targetPath: string;
  targetType: 'bullet' | 'summary' | 'skill' | 'section';
  operation: 'replace' | 'insert' | 'delete';
  beforeValue: string;
  proposedValue: string;
  rationale: string;
  alternatives?: ChangeAlternative[];
  selectedAlternativeId?: string;
  status: StagedChangeStatus;
  createdAt: string;
  decidedAt?: string;
}

export interface AcceptedChange {
  id: string;
  sessionId: string;
  stagedChangeId: string;
  targetPath: string;
  beforeValue: string;
  afterValue: string;
  scoreBefore?: number;
  scoreAfter?: number;
  decision: 'accepted' | 'modified';
  userModification?: string;
  createdAt: string;
}

export interface ResumeVersion {
  id: string;
  sessionId: string;
  label: string;
  trigger: 'manual' | 'session-start' | 'pre-change';
  resumeData: unknown;
  analysisData: unknown;
  score: number;
  createdAt: string;
}

export interface CoachingUserProfile {
  targetRole?: string;
  targetIndustry?: string;
  targetCompanies?: string[];
  personalBrand?: string;
  presentationStyle?: string;
  writingPreferences: {
    tone?: string;
    bulletStyle?: 'concise' | 'detailed' | 'balanced';
    avoidPhrases?: string[];
  };
  knownStrengths: string[];
  knownWeaknesses: string[];
}

export interface CoachingSessionData {
  sessionId: string;
  goals: CoachingGoal[];
  todos: CoachingTodo[];
  stagedChanges: StagedChange[];
  changeLog: AcceptedChange[];
  versions: ResumeVersion[];
  userProfile: CoachingUserProfile;
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
