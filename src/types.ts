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

