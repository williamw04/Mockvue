import { contextBridge, ipcRenderer } from 'electron';

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

  openResumePdf: (pdfPath: string) =>
    ipcRenderer.invoke('open-resume-pdf', pdfPath),
});

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

