/**
 * Service interfaces for platform abstraction
 */

import type {
  NotificationOptions,
  AgentTask,
  AgentCapability,
  AgentResponse,
  AgentFeatureType,
  UserProfile,
  Resume,
  ResumeAnalysis,
  CandidateProfile,
  Story,
  InterviewResponse,
  Document,
  DocumentData
} from '../types';

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
 * AI Agent service interface
 * Handles AI-powered features and agentic workflows
 */
export interface IAgentService {
  /**
   * Get available agent capabilities
   */
  getCapabilities(): AgentCapability[];

  /**
   * Execute an agent task
   */
  executeTask(
    feature: AgentFeatureType,
    input: string,
    context?: AgentTask['context']
  ): Promise<AgentResponse>;

  /**
   * Get task history
   */
  getTaskHistory(): Promise<AgentTask[]>;

  /**
   * Get a specific task by ID
   */
  getTask(taskId: string): Promise<AgentTask | null>;

  /**
   * Cancel a running task
   */
  cancelTask(taskId: string): Promise<boolean>;

  /**
   * Stream task results (for real-time updates)
   */
  streamTask(
    feature: AgentFeatureType,
    input: string,
    context?: AgentTask['context'],
    onChunk?: (chunk: string) => void
  ): Promise<AgentResponse>;

  /**
   * Parse a resume (raw text or file path handled by backend)
   */
  parseResume(filePath: string, apiKey: string): Promise<any>;

  /**
   * Analyze resume bullets for quality issues and identify trigger points
   */
  analyzeResume(resume: Resume, apiKey: string): Promise<ResumeAnalysis>;
}

/**
 * User Profile service interface
 * Handles user profile, onboarding, resumes, and stories
 */
export interface IUserService {
  /**
   * Get current user profile
   */
  getUserProfile(): Promise<UserProfile | null>;

  /**
   * Create or update user profile
   */
  saveUserProfile(profile: Partial<UserProfile>): Promise<UserProfile>;

  /**
   * Complete onboarding
   */
  completeOnboarding(): Promise<void>;

  /**
   * Get user resume
   */
  getResume(): Promise<Resume | null>;

  /**
   * Save or update resume
   */
  saveResume(resume: Partial<Resume>): Promise<Resume>;

  /**
   * Get all stories
   */
  getStories(): Promise<Story[]>;

  /**
   * Get a single story
   */
  getStory(id: string): Promise<Story | null>;

  /**
   * Create a new story
   */
  createStory(story: Omit<Story, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Story>;

  /**
   * Update an existing story
   */
  updateStory(id: string, story: Partial<Story>): Promise<Story>;

  /**
   * Delete a story
   */
  deleteStory(id: string): Promise<void>;

  /**
   * Get all interview responses
   */
  getInterviewResponses(): Promise<InterviewResponse[]>;

  /**
   * Create interview response
   */
  createInterviewResponse(response: Omit<InterviewResponse, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<InterviewResponse>;

  /**
   * Update interview response
   */
  updateInterviewResponse(id: string, response: Partial<InterviewResponse>): Promise<InterviewResponse>;

  /**
   * Delete interview response
   */
  deleteInterviewResponse(id: string): Promise<void>;

  /**
   * Get candidate profile (Resume Architect output)
   */
  getCandidateProfile(): Promise<CandidateProfile | null>;

  /**
   * Save candidate profile
   */
  saveCandidateProfile(profile: CandidateProfile): Promise<CandidateProfile>;
}

/**
 * Document Storage service interface
 * Handles document persistence across platforms
 */
export interface IDocumentService {
  /**
   * Get all documents
   */
  getDocuments(): Promise<Document[]>;

  /**
   * Get a single document by ID
   */
  getDocument(id: string): Promise<Document | null>;

  /**
   * Create a new document
   */
  createDocument(data: DocumentData): Promise<Document>;

  /**
   * Update an existing document
   */
  updateDocument(id: string, data: Partial<Document>): Promise<Document>;

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
 * Combined services interface
 */
export interface IAppServices {
  notifications: INotificationService;
  agent: IAgentService;
  user: IUserService;
  documents: IDocumentService;
}

