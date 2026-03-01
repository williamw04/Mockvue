import { vi } from 'vitest';
import {
  IAppServices,
  IDocumentService,
  IUserService,
  IAgentService,
  INotificationService,
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
    user: createMockUserService(),
    documents: createMockDocumentService(),
  };
}
