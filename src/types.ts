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

