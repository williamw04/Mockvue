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

export type LikertValue = 'strongly-agree' | 'agree' | 'neutral' | 'disagree' | 'strongly-disagree';

export interface SurveyResponse {
  questionId: string;
  value: LikertValue;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  targetRole?: string;
  targetCompany?: string;
  onboardingCompleted: boolean;
  surveyResponses?: SurveyResponse[];
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  role: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
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

export type CoreStoryCategory =
  | 'conflict'
  | 'failure'
  | 'leadership'
  | 'adaptability'
  | 'tight-deadline'
  | 'difficult-customer'
  | 'data-driven-decision'
  | 'above-and-beyond'
  | 'persuasion'
  | 'proudest-accomplishment';

export interface CoreStoryMatch {
  category: CoreStoryCategory;
  relatedExperienceId: string; // The ID (or company/position string if ID is not generated yet) of the matching experience
  reasoning: string; // Why this experience is a good fit for this core story
}

export interface Resume {
  id: string;
  userId: string;
  workExperiences: WorkExperience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  summary?: string;
  rawText?: string; // For uploaded resumes
  resumePdfPath?: string; // Path to stored PDF
  coreStoryMatches?: CoreStoryMatch[]; // AI suggested mapping to the 10 core stories
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
  coreCategory?: CoreStoryCategory; // Link to one of the 10 behavioral core categories
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

// Document Types (Q&A Document)
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

export interface DocumentData {
  title: string;
  description?: string;
  questions?: DocumentQuestion[];
  tags?: string[];
}

// Resume Architect Types

export type BulletIssueType = 'weak_verb' | 'no_metrics' | 'too_brief' | 'bad_structure' | 'passive_voice';

export interface BulletIssue {
  type: BulletIssueType;
  message: string;
  suggestion: string;
}

export interface BulletAnalysis {
  experienceId: string;
  bulletIndex: number;
  originalBullet: string;
  issues: BulletIssue[];
  suggestedRewrite: string;
  impactScore: number; // 1-10
}

export type TriggerPointComfort = 'have_story' | 'comfortable' | 'not_comfortable';

export interface TriggerPoint {
  id: string;
  experienceId: string;
  description: string;
  whyItMatters: string;
  userComfort?: TriggerPointComfort;
  linkedStoryId?: string;
}

export interface ResumeAnalysis {
  bulletAnalyses: BulletAnalysis[];
  triggerPoints: TriggerPoint[];
  overallScore: number; // 0-100
  analyzedAt: string;
}

export interface CandidateProfile {
  strengths: string[];
  triggerPoints: TriggerPoint[];
  storyReadiness: {
    covered: number;
    comfortable: number;
    gaps: number;
  };
  resumeScore: number;
  createdAt: string;
  updatedAt: string;
}

// Chat Types (Resume Review)
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
