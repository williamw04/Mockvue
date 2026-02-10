export interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface ProgressStats {
  completed: number;
  inProgress: number;
  scheduled: number;
  pending: number;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  silent?: boolean;
}

export interface FilePickerOptions {
  multiple?: boolean;
  accept?: string[];
  suggestedName?: string;
}

// AI Agent Types
export type AgentFeatureType = 
  | 'summarize'
  | 'rewrite'
  | 'expand'
  | 'translate'
  | 'brainstorm'
  | 'outline'
  | 'custom';

export interface AgentTask {
  id: string;
  feature: AgentFeatureType;
  input: string;
  context?: {
    documentId?: string;
    targetLanguage?: string;
    tone?: string;
    additionalInstructions?: string;
  };
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AgentCapability {
  feature: AgentFeatureType;
  name: string;
  description: string;
  icon: string;
  requiresContext?: boolean;
}

export interface AgentResponse {
  taskId: string;
  result: string;
  metadata?: {
    tokensUsed?: number;
    modelUsed?: string;
    processingTime?: number;
  };
}

// User Profile & Onboarding Types

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
  endDate?: string; // null if current
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
  rawText?: string; // For uploaded resumes
  createdAt: string;
  updatedAt: string;
}

// STAR Method Story
export interface Story {
  id: string;
  userId: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  tags: string[]; // e.g., ['leadership', 'problem-solving', 'teamwork']
  relatedExperienceId?: string; // Link to work experience
  createdAt: string;
  updatedAt: string;
}

// Interview Response built from stories
export interface InterviewResponse {
  id: string;
  userId: string;
  question: string;
  response: string;
  storyIds: string[]; // Stories used to build this response
  tags: string[];
  isPracticed: boolean;
  lastPracticedAt?: string;
  createdAt: string;
  updatedAt: string;
}
