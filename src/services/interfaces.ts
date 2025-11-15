/**
 * Service interfaces for platform abstraction
 */

import type { Document, DocumentData, NotificationOptions, FilePickerOptions } from '../types';

/**
 * Storage service interface
 * Handles document persistence across platforms
 */
export interface IStorageService {
  /**
   * Retrieve all documents
   */
  getDocuments(): Promise<Document[]>;
  
  /**
   * Retrieve a single document by ID
   */
  getDocument(id: string): Promise<Document | null>;
  
  /**
   * Create a new document
   */
  createDocument(data: DocumentData): Promise<Document>;
  
  /**
   * Update an existing document
   */
  updateDocument(id: string, data: Partial<DocumentData>): Promise<Document>;
  
  /**
   * Delete a document
   */
  deleteDocument(id: string): Promise<void>;
  
  /**
   * Search documents by query
   */
  searchDocuments(query: string): Promise<Document[]>;
}

/**
 * File service interface
 * Handles file system operations across platforms
 */
export interface IFileService {
  /**
   * Open a file picker dialog
   */
  pickFile(options?: FilePickerOptions): Promise<File | File[] | null>;
  
  /**
   * Save content to a file
   */
  saveFile(content: string, filename?: string): Promise<boolean>;
  
  /**
   * Read file content
   */
  readFile(file: File | string): Promise<string>;
  
  /**
   * Export document to file
   */
  exportDocument(document: Document, format: 'json' | 'txt' | 'html'): Promise<boolean>;
  
  /**
   * Import document from file
   */
  importDocument(file: File): Promise<DocumentData>;
}

/**
 * Notification service interface
 * Handles system notifications across platforms
 */
export interface INotificationService {
  /**
   * Check if notifications are supported
   */
  isSupported(): boolean;
  
  /**
   * Request notification permission
   */
  requestPermission(): Promise<boolean>;
  
  /**
   * Show a notification
   */
  show(options: NotificationOptions): Promise<void>;
  
  /**
   * Show a success notification
   */
  showSuccess(message: string): Promise<void>;
  
  /**
   * Show an error notification
   */
  showError(message: string): Promise<void>;
  
  /**
   * Show an info notification
   */
  showInfo(message: string): Promise<void>;
}

/**
 * AI/Agentic service interface
 * Handles AI-powered features like brainstorming, feedback, and drafting
 */
export interface IAgenticService {
  /**
   * Generate brainstorming ideas
   */
  brainstorm(context: string, questionText?: string): Promise<string[]>;
  
  /**
   * Provide feedback on selected response
   */
  provideFeedback(response: string, context?: string): Promise<string>;
  
  /**
   * Generate a draft based on context and responses
   */
  generateDraft(context: string, responses?: string[]): Promise<string>;
  
  /**
   * Check if the service is available
   */
  isAvailable(): boolean;
}

/**
 * Combined services interface
 */
export interface IAppServices {
  storage: IStorageService;
  files: IFileService;
  notifications: INotificationService;
  agentic: IAgenticService;
}

