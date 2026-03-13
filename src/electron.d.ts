import type {
  AgentAssistantId,
  AgentSession,
  AgentTurnInput,
  AgentTurnResult,
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
  VoiceTranscriptEvent
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

  // Agent foundation operations
  agentCreateSession: (input: CreateAgentSessionInput) => Promise<AgentSession>;
  agentGetSession: (sessionId: string) => Promise<AgentSession | null>;
  agentListSessions: (assistantId?: AgentAssistantId) => Promise<AgentSession[]>;
  agentRunTurn: (input: AgentTurnInput) => Promise<AgentTurnResult>;
  agentClearSessionMemory: (sessionId: string) => Promise<void>;

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
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export { };
