/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  AgentAssistantId,
  AgentSession,
  AgentTurnInput,
  AgentTurnResult,
  AgentChatMessage,
  AgentStep,
  AppendVoiceTranscriptEventInput,
  CreateAgentSessionInput,
  CreateVoiceInterviewSessionInput,
  ResumeAnalysis,
  UserProfile,
  Resume,
  Story,
  InterviewResponse,
  CandidateProfile,
  Document,
  DocumentQuestion,
  VoiceInterviewEvent,
  VoiceInterviewSession,
  VoiceTranscriptEvent,
  ATSAnalysisResult,
  CoachingSessionData,
  CoachingGoal,
  CoachingGoalType,
  CoachingTodo,
  ChangeAlternative,
  StagedChange,
  AcceptedChange,
  ResumeVersion,
  CoachingUserProfile,
} from './types';

export interface FileDialogResult {
  canceled: boolean;
  filePath?: string;
  fileName?: string;
  content?: string;
}

export interface ElectronAPI {
  // User profile operations
  getUserProfile: () => Promise<UserProfile | null>;
  saveUserProfile: (profile: Partial<UserProfile>) => Promise<UserProfile>;
  completeOnboarding: () => Promise<void>;

  // Resume operations
  getResume: () => Promise<Resume | null>;
  saveResume: (resume: Partial<Resume>) => Promise<Resume>;
  parseResume: (filePath: string, apiKey: string) => Promise<{ success: boolean; data?: any; error?: string; rawText?: string; pdfPath?: string }>;
  replaceResumePdf: (filePath: string) => Promise<{ success: boolean; pdfPath?: string; error?: string }>;
  analyzeResumeBullets: (resumeData: any, apiKey: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  analyzeAtsCompatibility: (filePath: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  openResumePdf: (pdfPath: string) => Promise<void>;

  // Story operations
  getStories: () => Promise<Story[]>;
  getStory: (id: string) => Promise<Story | null>;
  createStory: (story: Omit<Story, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Story>;
  updateStory: (id: string, story: Partial<Story>) => Promise<Story>;
  deleteStory: (id: string) => Promise<void>;

  // Interview response operations
  getInterviewResponses: () => Promise<InterviewResponse[]>;
  createInterviewResponse: (response: Omit<InterviewResponse, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<InterviewResponse>;
  updateInterviewResponse: (id: string, response: Partial<InterviewResponse>) => Promise<InterviewResponse>;
  deleteInterviewResponse: (id: string) => Promise<void>;

  // Candidate profile operations (Resume Architect)
  getCandidateProfile: () => Promise<CandidateProfile | null>;
  saveCandidateProfile: (profile: CandidateProfile) => Promise<CandidateProfile>;

  // Resume chat
  resumeChat: (messages: Array<{ role: string; content: string }>, analysisContext: any, apiKey: string) => Promise<{ success: boolean; reply?: string; error?: string }>;

  // Resume analysis cache
  getResumeAnalysis: () => Promise<ResumeAnalysis | null>;
  saveResumeAnalysis: (analysis: ResumeAnalysis) => Promise<ResumeAnalysis>;

  // ATS analysis cache
  getAtsAnalysis: () => Promise<ATSAnalysisResult | null>;
  saveAtsAnalysis: (analysis: ATSAnalysisResult) => Promise<ATSAnalysisResult>;

  // Agent foundation operations
  agentCreateSession: (input: CreateAgentSessionInput) => Promise<AgentSession>;
  agentGetSession: (sessionId: string) => Promise<AgentSession | null>;
  agentListSessions: (assistantId?: AgentAssistantId) => Promise<AgentSession[]>;
  agentRunTurn: (input: AgentTurnInput) => Promise<AgentTurnResult>;
  agentClearSessionMemory: (sessionId: string) => Promise<void>;
  agentGetSessionMessages: (sessionId: string) => Promise<AgentChatMessage[]>;
  agentSetApiKey: (apiKey: string) => void;
  agentRenameSession: (sessionId: string, newTitle: string) => Promise<AgentSession | null>;
  agentDeleteSession: (sessionId: string) => Promise<boolean>;

  // Agent streaming events
  onAgentChunk: (callback: (sessionId: string, text: string) => void) => () => void;
  onAgentStep: (callback: (sessionId: string, step: AgentStep) => void) => () => void;

  // Agent logging operations
  agentLoggingStatus: () => Promise<{ enabled: boolean; logsDir: string }>;
  agentListLogs: (maxCount?: number) => Promise<Array<{ path: string; name: string; size: number; modified: Date }>>;
  agentGetLog: (logPath: string) => Promise<unknown>;
  agentDeleteLog: (logPath: string) => Promise<boolean>;
  agentOpenLogsDir: () => Promise<void>;

  // Voice interview operations
  voiceInterviewCreateSession: (input: CreateVoiceInterviewSessionInput) => Promise<VoiceInterviewSession>;
  voiceInterviewGetSession: (sessionId: string) => Promise<VoiceInterviewSession | null>;
  voiceInterviewListSessions: () => Promise<VoiceInterviewSession[]>;
  voiceInterviewStartSession: (sessionId: string) => Promise<VoiceInterviewSession>;
  voiceInterviewPauseSession: (sessionId: string) => Promise<VoiceInterviewSession>;
  voiceInterviewResumeSession: (sessionId: string) => Promise<VoiceInterviewSession>;
  voiceInterviewInterruptSession: (sessionId: string) => Promise<VoiceInterviewSession>;
  voiceInterviewEndSession: (sessionId: string) => Promise<VoiceInterviewSession>;
  voiceInterviewGetTranscript: (sessionId: string) => Promise<VoiceTranscriptEvent[]>;
  voiceInterviewAppendTranscriptEvent: (sessionId: string, input: AppendVoiceTranscriptEventInput) => Promise<VoiceTranscriptEvent>;
  voiceInterviewGetEvents: (sessionId: string) => Promise<VoiceInterviewEvent[]>;

  // Document operations
  getDocuments: () => Promise<Document[]>;
  getDocument: (id: string) => Promise<Document | null>;
  createDocument: (data: { title: string; description?: string; questions?: DocumentQuestion[]; tags?: string[] }) => Promise<Document>;
  updateDocument: (id: string, data: Partial<Document>) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  searchDocuments: (query: string) => Promise<Document[]>;

  // File dialogs
  showOpenDialog: (options?: {
    filters?: Array<{ name: string; extensions: string[] }>;
    defaultPath?: string;
  }) => Promise<FileDialogResult>;
  showSaveDialog: (content: string, options?: {
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }) => Promise<FileDialogResult>;

  // Platform info
  platform: string;

  // Coaching workspace operations
  coaching: {
    getSessionData: (sessionId: string) => Promise<CoachingSessionData>;
    addGoal: (sessionId: string, input: { type: CoachingGoalType; title: string; description: string; targetMetric?: string; targetValue?: number }) => Promise<CoachingGoal>;
    updateGoal: (sessionId: string, goalId: string, updates: Partial<Pick<CoachingGoal, 'status' | 'progress' | 'currentValue' | 'completedAt'>>) => Promise<CoachingGoal | null>;
    addTodo: (sessionId: string, input: { title: string; goalId?: string; description?: string; targetType?: string; targetId?: string; proposedBy: 'user' | 'agent' }) => Promise<CoachingTodo>;
    updateTodo: (sessionId: string, todoId: string, updates: Partial<Pick<CoachingTodo, 'status' | 'completedAt'>>) => Promise<CoachingTodo | null>;
    proposeChange: (sessionId: string, input: { todoId?: string; targetPath: string; targetType: string; operation: string; beforeValue: string; proposedValue: string; rationale: string; alternatives?: ChangeAlternative[] }) => Promise<StagedChange>;
    acceptChange: (sessionId: string, changeId: string, modification?: string) => Promise<AcceptedChange | null>;
    rejectChange: (sessionId: string, changeId: string) => Promise<StagedChange | null>;
    getPendingChanges: (sessionId: string) => Promise<StagedChange[]>;
    getChangeLog: (sessionId: string) => Promise<AcceptedChange[]>;
    createVersion: (sessionId: string, input: { label: string; trigger: string; resumeData: Resume; analysisData: ResumeAnalysis | null; score: number }) => Promise<ResumeVersion>;
    listVersions: (sessionId: string) => Promise<ResumeVersion[]>;
    getUserProfile: () => Promise<CoachingUserProfile>;
    updateUserProfile: (updates: Partial<CoachingUserProfile>) => Promise<CoachingUserProfile>;
    clearSessionData: (sessionId: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export { };
