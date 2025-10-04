export interface Document {
  id: string;
  title: string;
  description: string;
  tags: string[];
  wordCount: number;
  lastModified: string;
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

