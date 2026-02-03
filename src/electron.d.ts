import type { 
  Document, 
  DocumentData, 
  UserProfile, 
  Resume, 
  Story, 
  InterviewResponse 
} from './types';

export interface FileDialogResult {
  canceled: boolean;
  filePath?: string;
  fileName?: string;
  content?: string;
}

export interface StorageStats {
  totalDocuments: number;
  totalWords: number;
  storageSize: number;
}

export interface ElectronAPI {
  // Document operations
  getDocuments: () => Promise<Document[]>;
  getDocument: (id: string) => Promise<Document | null>;
  createDocument: (documentData: DocumentData) => Promise<Document>;
  updateDocument: (documentId: string, documentData: Partial<DocumentData>) => Promise<Document>;
  deleteDocument: (documentId: string) => Promise<{ success: boolean }>;
  searchDocuments: (query: string) => Promise<Document[]>;
  
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
  
  // File dialogs
  showOpenDialog: (options?: {
    filters?: Array<{ name: string; extensions: string[] }>;
    defaultPath?: string;
  }) => Promise<FileDialogResult>;
  showSaveDialog: (content: string, options?: {
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }) => Promise<FileDialogResult>;
  
  // Storage stats
  getStorageStats: () => Promise<StorageStats>;
  
  // Platform info
  platform: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};

