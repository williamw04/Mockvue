import type {
  UserProfile,
  Resume,
  Story,
  InterviewResponse,
  Document,
  DocumentQuestion
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

