/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from 'electron';
import type {
  AgentAssistantId,
  AgentSession,
  AgentTurnInput,
  AgentTurnResult,
  AppendVoiceTranscriptEventInput,
  CoachingGoal,
  CoachingSessionData,
  CoachingTodo,
  CoachingUserProfile,
  CreateAgentSessionInput,
  CreateVoiceInterviewSessionInput,
  AcceptedChange,
  ResumeVersion,
  StagedChange,
  VoiceInterviewEvent,
  VoiceInterviewSession,
  VoiceTranscriptEvent,
} from './internal-types';

// Type definitions for the exposed API
export interface FileDialogResult {
  canceled: boolean;
  filePath?: string;
  fileName?: string;
  content?: string;
}

// User data types
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

export interface Resume {
  id: string;
  userId: string;
  workExperiences: WorkExperience[];
  education: Education[];
  skills: string[];
  summary?: string;
  rawText?: string;
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

export interface ElectronAPI {
  // User profile operations
  getUserProfile: () => Promise<UserProfile | null>;
  saveUserProfile: (profile: Partial<UserProfile>) => Promise<UserProfile>;
  completeOnboarding: () => Promise<void>;

  // Resume operations
  getResume: () => Promise<Resume | null>;
  saveResume: (resume: Partial<Resume>) => Promise<Resume>;

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

  // AI/Agent operations
  parseResume: (filePath: string, apiKey: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  analyzeResumeBullets: (resumeData: any, apiKey: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  analyzeAtsCompatibility: (filePath: string) => Promise<{ success: boolean; data?: any; error?: string }>;

  // Resume Architect operations
  getCandidateProfile: () => Promise<any | null>;
  saveCandidateProfile: (profile: any) => Promise<any>;

  // PDF operations
  openResumePdf: (pdfPath: string) => Promise<void>;

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

  // Voice interview streaming operations (STT-LLM-TTS pipeline)
  voiceInterviewStreamingCreate: (input: any) => Promise<{ success: boolean; sessionId: string }>;
  voiceInterviewStreamingStart: (sessionId: string) => Promise<{ success: boolean }>;
  voiceInterviewStreamingSendAudio: (sessionId: string, audioBase64: string) => Promise<{ success: boolean }>;
  voiceInterviewStreamingPause: (sessionId: string) => Promise<{ success: boolean }>;
  voiceInterviewStreamingResume: (sessionId: string) => Promise<{ success: boolean }>;
  voiceInterviewStreamingInterrupt: (sessionId: string) => Promise<{ success: boolean }>;
  voiceInterviewStreamingEnd: (sessionId: string) => Promise<{ success: boolean }>;
  voiceInterviewStreamingGetState: (sessionId: string) => Promise<{ pipelineState: string; isReady: boolean }>;
  voiceInterviewStreamingListActive: () => Promise<string[]>;

  // Voice interview streaming event listeners
  onVoiceInterviewCandidateTranscript: (callback: (sessionId: string, text: string, isFinal: boolean) => void) => () => void;
  onVoiceInterviewInterviewerResponse: (callback: (sessionId: string, text: string) => void) => () => void;
  onVoiceInterviewAudioOutput: (callback: (sessionId: string, audioBase64: string) => void) => () => void;
  onVoiceInterviewStateChange: (callback: (sessionId: string, state: any) => void) => () => void;
  onVoiceInterviewPhaseChange: (callback: (sessionId: string, from: string, to: string) => void) => () => void;
  onVoiceInterviewSpeechStarted: (callback: (sessionId: string) => void) => () => void;
  onVoiceInterviewSpeechEnded: (callback: (sessionId: string) => void) => () => void;
  onVoiceInterviewError: (callback: (sessionId: string, error: string) => void) => () => void;
  onVoiceInterviewSessionReady: (callback: (sessionId: string) => void) => () => void;
  onVoiceInterviewSessionEnded: (callback: (sessionId: string) => void) => () => void;

  coaching: {
    getSessionData: (sessionId: string) => Promise<CoachingSessionData>;
    addGoal: (sessionId: string, input: any) => Promise<CoachingGoal>;
    updateGoal: (sessionId: string, goalId: string, updates: any) => Promise<CoachingGoal | null>;
    addTodo: (sessionId: string, input: any) => Promise<CoachingTodo>;
    updateTodo: (sessionId: string, todoId: string, updates: any) => Promise<CoachingTodo | null>;
    proposeChange: (sessionId: string, input: any) => Promise<StagedChange>;
    acceptChange: (sessionId: string, changeId: string, modification?: string) => Promise<AcceptedChange | null>;
    rejectChange: (sessionId: string, changeId: string) => Promise<StagedChange | null>;
    getPendingChanges: (sessionId: string) => Promise<StagedChange[]>;
    getChangeLog: (sessionId: string) => Promise<AcceptedChange[]>;
    createVersion: (sessionId: string, input: any) => Promise<ResumeVersion>;
    listVersions: (sessionId: string) => Promise<ResumeVersion[]>;
    getUserProfile: () => Promise<CoachingUserProfile>;
    updateUserProfile: (updates: any) => Promise<CoachingUserProfile>;
    clearSessionData: (sessionId: string) => Promise<void>;
  };
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // User profile operations
  getUserProfile: () => ipcRenderer.invoke('get-user-profile'),
  saveUserProfile: (profile: any) => ipcRenderer.invoke('save-user-profile', profile),
  completeOnboarding: () => ipcRenderer.invoke('complete-onboarding'),

  // Resume operations
  getResume: () => ipcRenderer.invoke('get-resume'),
  saveResume: (resume: any) => ipcRenderer.invoke('save-resume', resume),

  // Story operations
  getStories: () => ipcRenderer.invoke('get-stories'),
  getStory: (id: string) => ipcRenderer.invoke('get-story', id),
  createStory: (story: any) => ipcRenderer.invoke('create-story', story),
  updateStory: (id: string, story: any) => ipcRenderer.invoke('update-story', id, story),
  deleteStory: (id: string) => ipcRenderer.invoke('delete-story', id),

  // Interview response operations
  getInterviewResponses: () => ipcRenderer.invoke('get-interview-responses'),
  createInterviewResponse: (response: any) => ipcRenderer.invoke('create-interview-response', response),
  updateInterviewResponse: (id: string, response: any) => ipcRenderer.invoke('update-interview-response', id, response),
  deleteInterviewResponse: (id: string) => ipcRenderer.invoke('delete-interview-response', id),

  // Document operations
  getDocuments: () => ipcRenderer.invoke('get-documents'),
  getDocument: (id: string) => ipcRenderer.invoke('get-document', id),
  createDocument: (data: any) => ipcRenderer.invoke('create-document', data),
  updateDocument: (id: string, data: any) => ipcRenderer.invoke('update-document', id, data),
  deleteDocument: (id: string) => ipcRenderer.invoke('delete-document', id),
  searchDocuments: (query: string) => ipcRenderer.invoke('search-documents', query),

  // File dialogs
  showOpenDialog: (options?: any) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (content: string, options?: any) => ipcRenderer.invoke('show-save-dialog', content, options),

  // Platform info
  platform: process.platform,

  // AI/Agent operations
  parseResume: (filePath: string, apiKey: string) =>
    ipcRenderer.invoke('resume:parse', { filePath, apiKey }),
  replaceResumePdf: (filePath: string) =>
    ipcRenderer.invoke('resume:replace-pdf', { filePath }),
  analyzeResumeBullets: (resumeData: any, apiKey: string) =>
    ipcRenderer.invoke('resume:analyze-bullets', { resumeData, apiKey }),
  analyzeAtsCompatibility: (filePath: string) =>
    ipcRenderer.invoke('resume:analyze-ats', { filePath }),

  // Resume Architect operations
  getCandidateProfile: () => ipcRenderer.invoke('get-candidate-profile'),
  saveCandidateProfile: (profile: any) => ipcRenderer.invoke('save-candidate-profile', profile),

  // PDF operations
  openResumePdf: (pdfPath: string) =>
    ipcRenderer.invoke('open-resume-pdf', pdfPath),

  // Resume chat
  resumeChat: (messages: any[], analysisContext: any, apiKey: string) =>
    ipcRenderer.invoke('resume:chat', { messages, analysisContext, apiKey }),

  // Resume analysis cache
  getResumeAnalysis: () => ipcRenderer.invoke('get-resume-analysis'),
  saveResumeAnalysis: (analysis: any) => ipcRenderer.invoke('save-resume-analysis', analysis),

  // ATS analysis cache
  getAtsAnalysis: () => ipcRenderer.invoke('get-ats-analysis'),
  saveAtsAnalysis: (analysis: any) => ipcRenderer.invoke('save-ats-analysis', analysis),

  // Agent foundation operations
  agentCreateSession: (input: CreateAgentSessionInput) => ipcRenderer.invoke('agent:create-session', input),
  agentGetSession: (sessionId: string) => ipcRenderer.invoke('agent:get-session', sessionId),
  agentListSessions: (assistantId?: AgentAssistantId) => ipcRenderer.invoke('agent:list-sessions', assistantId),
  agentRunTurn: (input: AgentTurnInput) => ipcRenderer.invoke('agent:run-turn', input),
  agentClearSessionMemory: (sessionId: string) => ipcRenderer.invoke('agent:clear-session-memory', sessionId),
  agentGetSessionMessages: (sessionId: string) => ipcRenderer.invoke('agent:get-session-messages', sessionId),
  agentSetApiKey: (apiKey: string) => ipcRenderer.send('agent:set-api-key', apiKey),
  agentRenameSession: (sessionId: string, newTitle: string) => ipcRenderer.invoke('agent:rename-session', sessionId, newTitle),
  agentDeleteSession: (sessionId: string) => ipcRenderer.invoke('agent:delete-session', sessionId),

  // Agent streaming events
  onAgentChunk: (callback: (sessionId: string, text: string) => void) => {
    const listener = (_event: any, data: { sessionId: string; text: string }) => callback(data.sessionId, data.text);
    ipcRenderer.on('agent:chunk', listener);
    return () => ipcRenderer.removeListener('agent:chunk', listener);
  },
  onAgentStep: (callback: (sessionId: string, step: any) => void) => {
    const listener = (_event: any, data: { sessionId: string; step: any }) => callback(data.sessionId, data.step);
    ipcRenderer.on('agent:step', listener);
    return () => ipcRenderer.removeListener('agent:step', listener);
  },

  // Agent logging operations
  agentLoggingStatus: () => ipcRenderer.invoke('agent:logging-status'),
  agentListLogs: (maxCount?: number) => ipcRenderer.invoke('agent:list-logs', maxCount),
  agentGetLog: (logPath: string) => ipcRenderer.invoke('agent:get-log', logPath),
  agentDeleteLog: (logPath: string) => ipcRenderer.invoke('agent:delete-log', logPath),
  agentOpenLogsDir: () => ipcRenderer.invoke('agent:open-logs-dir'),

  // Voice interview operations
  voiceInterviewCreateSession: (input: CreateVoiceInterviewSessionInput) => ipcRenderer.invoke('voice-interview:create-session', input),
  voiceInterviewGetSession: (sessionId: string) => ipcRenderer.invoke('voice-interview:get-session', sessionId),
  voiceInterviewListSessions: () => ipcRenderer.invoke('voice-interview:list-sessions'),
  voiceInterviewStartSession: (sessionId: string) => ipcRenderer.invoke('voice-interview:start-session', sessionId),
  voiceInterviewPauseSession: (sessionId: string) => ipcRenderer.invoke('voice-interview:pause-session', sessionId),
  voiceInterviewResumeSession: (sessionId: string) => ipcRenderer.invoke('voice-interview:resume-session', sessionId),
  voiceInterviewInterruptSession: (sessionId: string) => ipcRenderer.invoke('voice-interview:interrupt-session', sessionId),
  voiceInterviewEndSession: (sessionId: string) => ipcRenderer.invoke('voice-interview:end-session', sessionId),
  voiceInterviewGetTranscript: (sessionId: string) => ipcRenderer.invoke('voice-interview:get-transcript', sessionId),
  voiceInterviewAppendTranscriptEvent: (sessionId: string, input: AppendVoiceTranscriptEventInput) => ipcRenderer.invoke('voice-interview:append-transcript-event', sessionId, input),
  voiceInterviewGetEvents: (sessionId: string) => ipcRenderer.invoke('voice-interview:get-events', sessionId),

  // Voice interview streaming operations (STT-LLM-TTS pipeline)
  voiceInterviewStreamingCreate: (input: any) => ipcRenderer.invoke('voice-interview-streaming:create', input),
  voiceInterviewStreamingStart: (sessionId: string) => ipcRenderer.invoke('voice-interview-streaming:start', sessionId),
  voiceInterviewStreamingSendAudio: (sessionId: string, audioBase64: string) => 
    ipcRenderer.invoke('voice-interview-streaming:send-audio', { sessionId, audioBase64 }),
  voiceInterviewStreamingPause: (sessionId: string) => ipcRenderer.invoke('voice-interview-streaming:pause', sessionId),
  voiceInterviewStreamingResume: (sessionId: string) => ipcRenderer.invoke('voice-interview-streaming:resume', sessionId),
  voiceInterviewStreamingInterrupt: (sessionId: string) => ipcRenderer.invoke('voice-interview-streaming:interrupt', sessionId),
  voiceInterviewStreamingEnd: (sessionId: string) => ipcRenderer.invoke('voice-interview-streaming:end', sessionId),
  voiceInterviewStreamingGetState: (sessionId: string) => ipcRenderer.invoke('voice-interview-streaming:get-state', sessionId),
  voiceInterviewStreamingListActive: () => ipcRenderer.invoke('voice-interview-streaming:list-active'),

  // Voice interview streaming event listeners
  onVoiceInterviewCandidateTranscript: (callback: (sessionId: string, text: string, isFinal: boolean) => void) => {
    const listener = (_event: any, data: { sessionId: string; text: string; isFinal: boolean }) => 
      callback(data.sessionId, data.text, data.isFinal);
    ipcRenderer.on('voice-interview:candidate-transcript', listener);
    return () => ipcRenderer.removeListener('voice-interview:candidate-transcript', listener);
  },
  onVoiceInterviewInterviewerResponse: (callback: (sessionId: string, text: string) => void) => {
    const listener = (_event: any, data: { sessionId: string; text: string }) => callback(data.sessionId, data.text);
    ipcRenderer.on('voice-interview:interviewer-response', listener);
    return () => ipcRenderer.removeListener('voice-interview:interviewer-response', listener);
  },
  onVoiceInterviewAudioOutput: (callback: (sessionId: string, audioBase64: string) => void) => {
    const listener = (_event: any, data: { sessionId: string; audioBase64: string }) => 
      callback(data.sessionId, data.audioBase64);
    ipcRenderer.on('voice-interview:audio-output', listener);
    return () => ipcRenderer.removeListener('voice-interview:audio-output', listener);
  },
  onVoiceInterviewStateChange: (callback: (sessionId: string, state: any) => void) => {
    const listener = (_event: any, data: { sessionId: string; state: any }) => callback(data.sessionId, data.state);
    ipcRenderer.on('voice-interview:state-change', listener);
    return () => ipcRenderer.removeListener('voice-interview:state-change', listener);
  },
  onVoiceInterviewPhaseChange: (callback: (sessionId: string, from: string, to: string) => void) => {
    const listener = (_event: any, data: { sessionId: string; from: string; to: string }) => 
      callback(data.sessionId, data.from, data.to);
    ipcRenderer.on('voice-interview:phase-change', listener);
    return () => ipcRenderer.removeListener('voice-interview:phase-change', listener);
  },
  onVoiceInterviewSpeechStarted: (callback: (sessionId: string) => void) => {
    const listener = (_event: any, data: { sessionId: string }) => callback(data.sessionId);
    ipcRenderer.on('voice-interview:speech-started', listener);
    return () => ipcRenderer.removeListener('voice-interview:speech-started', listener);
  },
  onVoiceInterviewSpeechEnded: (callback: (sessionId: string) => void) => {
    const listener = (_event: any, data: { sessionId: string }) => callback(data.sessionId);
    ipcRenderer.on('voice-interview:speech-ended', listener);
    return () => ipcRenderer.removeListener('voice-interview:speech-ended', listener);
  },
  onVoiceInterviewError: (callback: (sessionId: string, error: string) => void) => {
    const listener = (_event: any, data: { sessionId: string; error: string }) => callback(data.sessionId, data.error);
    ipcRenderer.on('voice-interview:error', listener);
    return () => ipcRenderer.removeListener('voice-interview:error', listener);
  },
  onVoiceInterviewSessionReady: (callback: (sessionId: string) => void) => {
    const listener = (_event: any, data: { sessionId: string }) => callback(data.sessionId);
    ipcRenderer.on('voice-interview:session-ready', listener);
    return () => ipcRenderer.removeListener('voice-interview:session-ready', listener);
  },
  onVoiceInterviewSessionEnded: (callback: (sessionId: string) => void) => {
    const listener = (_event: any, data: { sessionId: string }) => callback(data.sessionId);
    ipcRenderer.on('voice-interview:session-ended', listener);
    return () => ipcRenderer.removeListener('voice-interview:session-ended', listener);
  },

  coaching: {
    getSessionData: (sessionId: string) => ipcRenderer.invoke('coaching:get-session-data', sessionId),
    addGoal: (sessionId: string, input: any) => ipcRenderer.invoke('coaching:add-goal', sessionId, input),
    updateGoal: (sessionId: string, goalId: string, updates: any) => ipcRenderer.invoke('coaching:update-goal', sessionId, goalId, updates),
    addTodo: (sessionId: string, input: any) => ipcRenderer.invoke('coaching:add-todo', sessionId, input),
    updateTodo: (sessionId: string, todoId: string, updates: any) => ipcRenderer.invoke('coaching:update-todo', sessionId, todoId, updates),
    proposeChange: (sessionId: string, input: any) => ipcRenderer.invoke('coaching:propose-change', sessionId, input),
    acceptChange: (sessionId: string, changeId: string, modification?: string) => ipcRenderer.invoke('coaching:accept-change', sessionId, changeId, modification),
    rejectChange: (sessionId: string, changeId: string) => ipcRenderer.invoke('coaching:reject-change', sessionId, changeId),
    getPendingChanges: (sessionId: string) => ipcRenderer.invoke('coaching:get-pending-changes', sessionId),
    getChangeLog: (sessionId: string) => ipcRenderer.invoke('coaching:get-change-log', sessionId),
    createVersion: (sessionId: string, input: any) => ipcRenderer.invoke('coaching:create-version', sessionId, input),
    listVersions: (sessionId: string) => ipcRenderer.invoke('coaching:list-versions', sessionId),
    getUserProfile: () => ipcRenderer.invoke('coaching:get-user-profile'),
    updateUserProfile: (updates: any) => ipcRenderer.invoke('coaching:update-user-profile', updates),
    clearSessionData: (sessionId: string) => ipcRenderer.invoke('coaching:clear-session-data', sessionId),
  },
});

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
