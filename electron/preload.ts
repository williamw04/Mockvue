import { contextBridge, ipcRenderer } from 'electron';

// Type definitions for the exposed API
export interface Document {
  id: string;
  title: string;
  description: string;
  content?: string;
  tags: string[];
  wordCount: number;
  lastModified: string;
  createdAt: string;
}

export interface DocumentData {
  title: string;
  description?: string;
  content?: string;
  tags?: string[];
}

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

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Document operations
  getDocuments: () => ipcRenderer.invoke('get-documents'),
  getDocument: (id: string) => ipcRenderer.invoke('get-document', id),
  createDocument: (documentData: DocumentData) => ipcRenderer.invoke('create-document', documentData),
  updateDocument: (documentId: string, documentData: Partial<DocumentData>) => 
    ipcRenderer.invoke('update-document', documentId, documentData),
  deleteDocument: (documentId: string) => ipcRenderer.invoke('delete-document', documentId),
  searchDocuments: (query: string) => ipcRenderer.invoke('search-documents', query),
  
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
  
  // File dialogs
  showOpenDialog: (options?: any) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (content: string, options?: any) => ipcRenderer.invoke('show-save-dialog', content, options),
  
  // Storage stats
  getStorageStats: () => ipcRenderer.invoke('get-storage-stats'),
  
  // Platform info
  platform: process.platform,
});

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

