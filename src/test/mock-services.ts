import { vi } from 'vitest';
import {
  IAppServices,
  IDocumentService,
  IUserService,
  IAgentService,
  INotificationService,
  IVoiceInterviewService,
} from '../services/interfaces';

export function createMockDocumentService(): IDocumentService {
  return {
    getDocuments: vi.fn().mockResolvedValue([]),
    getDocument: vi.fn().mockResolvedValue(null),
    createDocument: vi.fn().mockResolvedValue({
      id: 'doc-1',
      userId: 'user-1',
      title: 'Test Document',
      description: '',
      questions: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }),
    updateDocument: vi.fn().mockResolvedValue({}),
    deleteDocument: vi.fn().mockResolvedValue(undefined),
    searchDocuments: vi.fn().mockResolvedValue([]),
  };
}

export function createMockUserService(): IUserService {
  return {
    getUserProfile: vi.fn().mockResolvedValue(null),
    saveUserProfile: vi.fn().mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    completeOnboarding: vi.fn().mockResolvedValue(undefined),
    getResume: vi.fn().mockResolvedValue(null),
    saveResume: vi.fn().mockResolvedValue({}),
    getStories: vi.fn().mockResolvedValue([]),
    getStory: vi.fn().mockResolvedValue(null),
    createStory: vi.fn().mockResolvedValue({}),
    updateStory: vi.fn().mockResolvedValue({}),
    deleteStory: vi.fn().mockResolvedValue(undefined),
    getInterviewResponses: vi.fn().mockResolvedValue([]),
    createInterviewResponse: vi.fn().mockResolvedValue({}),
    updateInterviewResponse: vi.fn().mockResolvedValue({}),
    deleteInterviewResponse: vi.fn().mockResolvedValue(undefined),
    getCandidateProfile: vi.fn().mockResolvedValue(null),
    saveCandidateProfile: vi.fn().mockResolvedValue({}),
    getResumeAnalysis: vi.fn().mockResolvedValue(null),
    saveResumeAnalysis: vi.fn().mockResolvedValue({}),
  };
}

export function createMockAgentService(): IAgentService {
  return {
    getCapabilities: vi.fn().mockReturnValue([]),
    executeTask: vi.fn().mockResolvedValue({
      taskId: 'task-1',
      result: 'Mock result',
    }),
    streamTask: vi.fn().mockResolvedValue({
      taskId: 'task-1',
      result: 'Mock streamed result',
    }),
    getTaskHistory: vi.fn().mockResolvedValue([]),
    getTask: vi.fn().mockResolvedValue(null),
    cancelTask: vi.fn().mockResolvedValue(true),
    parseResume: vi.fn().mockResolvedValue({ success: true, data: {} }),
    analyzeResume: vi.fn().mockResolvedValue({
      bulletAnalyses: [],
      triggerPoints: [],
      overallScore: 75,
      analyzedAt: new Date().toISOString(),
    }),
    chatWithResume: vi.fn().mockResolvedValue('Mock AI response about your resume.'),
    analyzeAtsCompatibility: vi.fn().mockResolvedValue({
      overallScore: 80,
      checks: [
        { checkName: 'Single-Column Layout', status: 'pass', score: 20, details: 'Looks good' },
        { checkName: 'Standard Fonts', status: 'pass', score: 20, details: 'Looks good' },
        { checkName: 'Standardized Headings', status: 'pass', score: 20, details: 'Looks good' },
        { checkName: 'No Graphics/Tables', status: 'pass', score: 20, details: 'Looks good' },
        { checkName: 'Reverse Chronological Order', status: 'pass', score: 20, details: 'Looks good' },
      ],
      analyzedAt: new Date().toISOString(),
    }),
    createAssistantSession: vi.fn().mockResolvedValue({
      id: 'agent-session-1',
      assistantId: 'resume-assistant',
      title: 'Test Session',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    getAssistantSession: vi.fn().mockResolvedValue(null),
    listAssistantSessions: vi.fn().mockResolvedValue([]),
    runAssistantTurn: vi.fn().mockResolvedValue({
      session: {
        id: 'agent-session-1',
        assistantId: 'resume-assistant',
        title: 'Test Session',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      reply: 'Mock grounded assistant reply.',
      evidence: [],
      memoryUpdated: false,
    }),
    clearAssistantSessionMemory: vi.fn().mockResolvedValue(undefined),
  };
}

export function createMockVoiceInterviewService(): IVoiceInterviewService {
  return {
    createSession: vi.fn().mockResolvedValue({
      id: 'voice-session-1',
      mode: 'text-only',
      status: 'draft',
      context: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    getSession: vi.fn().mockResolvedValue(null),
    listSessions: vi.fn().mockResolvedValue([]),
    startSession: vi.fn().mockResolvedValue({
      id: 'voice-session-1',
      mode: 'text-only',
      status: 'active',
      context: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    pauseSession: vi.fn().mockResolvedValue({
      id: 'voice-session-1',
      mode: 'text-only',
      status: 'paused',
      context: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    resumeSession: vi.fn().mockResolvedValue({
      id: 'voice-session-1',
      mode: 'text-only',
      status: 'active',
      context: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    interruptSession: vi.fn().mockResolvedValue({
      id: 'voice-session-1',
      mode: 'text-only',
      status: 'active',
      context: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    endSession: vi.fn().mockResolvedValue({
      id: 'voice-session-1',
      mode: 'text-only',
      status: 'ended',
      context: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    getTranscript: vi.fn().mockResolvedValue([]),
    appendTranscriptEvent: vi.fn().mockResolvedValue({
      id: 'voice-event-1',
      sessionId: 'voice-session-1',
      speaker: 'candidate',
      text: 'Mock transcript',
      createdAt: new Date().toISOString(),
    }),
    getEvents: vi.fn().mockResolvedValue([]),
  };
}

export function createMockNotificationService(): INotificationService {
  return {
    isSupported: vi.fn().mockReturnValue(true),
    requestPermission: vi.fn().mockResolvedValue(true),
    show: vi.fn().mockResolvedValue(undefined),
    showSuccess: vi.fn().mockResolvedValue(undefined),
    showError: vi.fn().mockResolvedValue(undefined),
    showInfo: vi.fn().mockResolvedValue(undefined),
  };
}

export function createMockServices(): IAppServices {
  return {
    notifications: createMockNotificationService(),
    agent: createMockAgentService(),
    voiceInterview: createMockVoiceInterviewService(),
    user: createMockUserService(),
    documents: createMockDocumentService(),
  };
}
