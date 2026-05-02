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

export interface UserAIPreferences {
  aiAnalysisConsent: boolean | null;
  askedAt?: string;
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
  aiPreferences?: UserAIPreferences;
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

export type BulletIssueType =
  | 'weak_verb'
  | 'no_metrics'
  | 'too_brief'
  | 'bad_structure'
  | 'passive_voice';

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

// ATS Compatibility Types
export type ATSCheckStatus = 'pass' | 'warning' | 'fail';

export interface ATSCheckResult {
  checkName: string;
  status: ATSCheckStatus;
  score: number;
  details: string;
  recommendation?: string;
}

export interface ATSAnalysisResult {
  overallScore: number;
  checks: ATSCheckResult[];
  analyzedAt: string;
}

// Agent Foundation Types
export type AgentAssistantId = 'resume-assistant' | 'behavioral-assistant';

export type AgentToolName =
  | 'resume_get'
  | 'resume_search'
  | 'memory_lookup'
  | 'memory_save'
  | 'memory_summarize'
  | 'memory_clear';

export type AgentMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface AgentMessage {
  role: AgentMessageRole;
  content: string;
  createdAt: string;
}

export interface AgentEvidenceRef {
  source: string;
  sourceId: string;
  label?: string;
  snippet?: string;
}

export type ResumeFactKind =
  | 'experience'
  | 'achievement'
  | 'project'
  | 'skill'
  | 'trigger-point'
  | 'strength'
  | 'core-story-match'
  | 'story'
  | 'interview-response';

export interface ResumeFact {
  id: string;
  kind: ResumeFactKind;
  text: string;
  sourceId: string;
  tags: string[];
}

export interface ResumeDoc {
  resume: Resume | null;
  resumeAnalysis: ResumeAnalysis | null;
  candidateProfile: CandidateProfile | null;
  stories: Story[];
  interviewResponses: InterviewResponse[];
  facts: ResumeFact[];
}

export type MemoryEntryKind = 'preference' | 'goal' | 'fact' | 'summary';

export interface MemoryEntry {
  id: string;
  sessionId: string;
  assistantId: AgentAssistantId;
  content: string;
  kind: MemoryEntryKind;
  createdAt: string;
  updatedAt: string;
}

export interface ContextSummary {
  sessionId: string;
  summary: string;
  updatedAt: string;
}

export interface AgentSession {
  id: string;
  assistantId: AgentAssistantId;
  title: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  lastTurnAt?: string;
  summary?: string;
  messageCount: number;
  resumeAnalysisSnapshot?: ResumeAnalysis;
  resumeSnapshot?: Resume;
  forkedFrom?: string;
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type AgentStepKind = 'thinking' | 'tool_call' | 'tool_result' | 'response';

export interface AgentStep {
  id: string;
  kind: AgentStepKind;
  timestamp: string;
  thinking?: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: unknown;
  toolError?: string;
  content?: string;
}

export interface AgentTurnTrace {
  steps: AgentStep[];
  totalToolCalls: number;
}

export interface CreateAgentSessionInput {
  assistantId: AgentAssistantId;
  title?: string;
  initialContext?: string;
  resumeAnalysisSnapshot?: ResumeAnalysis;
  resumeSnapshot?: Resume;
  forkFromSessionId?: string;
}

export interface AgentTurnInput {
  sessionId: string;
  message: string;
  includeMemory?: boolean;
}

export interface AgentTurnResult {
  session: AgentSession;
  reply: string;
  evidence: AgentEvidenceRef[];
  memoryUpdated: boolean;
  trace: AgentTurnTrace;
}

// Coaching Workspace Types

export type CoachingGoalType =
  | 'score_improvement'
  | 'weakness_elimination'
  | 'section_overhaul'
  | 'role_tailoring'
  | 'custom';
export type CoachingGoalStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';
export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type StagedChangeStatus = 'pending' | 'accepted' | 'rejected' | 'modified';

export interface CoachingGoal {
  id: string;
  sessionId: string;
  type: CoachingGoalType;
  title: string;
  description: string;
  targetMetric?: string;
  targetValue?: number;
  currentValue?: number;
  status: CoachingGoalStatus;
  progress: number;
  createdAt: string;
  completedAt?: string;
}

export interface CoachingTodo {
  id: string;
  sessionId: string;
  goalId?: string;
  title: string;
  description?: string;
  targetType?: 'bullet' | 'section' | 'story' | 'general';
  targetId?: string;
  status: TodoStatus;
  proposedBy: 'user' | 'agent';
  createdAt: string;
  completedAt?: string;
}

export interface ChangeAlternative {
  id: string;
  value: string;
  label: string;
  predictedScore?: number;
}

export interface StagedChange {
  id: string;
  sessionId: string;
  todoId?: string;
  targetPath: string;
  targetType: 'bullet' | 'summary' | 'skill' | 'section';
  operation: 'replace' | 'insert' | 'delete';
  beforeValue: string;
  proposedValue: string;
  rationale: string;
  alternatives?: ChangeAlternative[];
  selectedAlternativeId?: string;
  status: StagedChangeStatus;
  createdAt: string;
  decidedAt?: string;
}

export interface AcceptedChange {
  id: string;
  sessionId: string;
  stagedChangeId: string;
  targetPath: string;
  beforeValue: string;
  afterValue: string;
  scoreBefore?: number;
  scoreAfter?: number;
  decision: 'accepted' | 'modified';
  userModification?: string;
  createdAt: string;
}

export interface ResumeVersion {
  id: string;
  sessionId: string;
  label: string;
  trigger: 'manual' | 'session-start' | 'pre-change';
  resumeData: Resume;
  analysisData: ResumeAnalysis | null;
  score: number;
  createdAt: string;
}

export interface CoachingUserProfile {
  targetRole?: string;
  targetIndustry?: string;
  targetCompanies?: string[];
  personalBrand?: string;
  presentationStyle?: string;
  writingPreferences: {
    tone?: string;
    bulletStyle?: 'concise' | 'detailed' | 'balanced';
    avoidPhrases?: string[];
  };
  knownStrengths: string[];
  knownWeaknesses: string[];
}

export interface CoachingSessionData {
  sessionId: string;
  goals: CoachingGoal[];
  todos: CoachingTodo[];
  stagedChanges: StagedChange[];
  changeLog: AcceptedChange[];
  versions: ResumeVersion[];
  userProfile: CoachingUserProfile;
}

// Voice Interview Types
export type VoiceInterviewMode = 'text-only' | 'stt-llm-tts' | 'realtime-s2s';

export type VoiceInterviewSessionStatus = 'draft' | 'active' | 'paused' | 'ended' | 'error';

export type VoiceInterviewSpeaker = 'system' | 'interviewer' | 'candidate';

export type VoiceInterviewEventType =
  | 'session-created'
  | 'session-started'
  | 'session-paused'
  | 'session-resumed'
  | 'session-interrupted'
  | 'session-ended'
  | 'transcript-appended';

export interface VoiceInterviewContext {
  targetRole?: string;
  targetCompany?: string;
  candidateSummary?: string;
  questionPlanId?: string;
}

export interface CreateVoiceInterviewSessionInput {
  mode: VoiceInterviewMode;
  context?: VoiceInterviewContext;
}

export interface AppendVoiceTranscriptEventInput {
  speaker: VoiceInterviewSpeaker;
  text: string;
}

export interface VoiceInterviewSession {
  id: string;
  mode: VoiceInterviewMode;
  status: VoiceInterviewSessionStatus;
  context: VoiceInterviewContext;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  endedAt?: string;
}

export interface VoiceTranscriptEvent {
  id: string;
  sessionId: string;
  speaker: VoiceInterviewSpeaker;
  text: string;
  createdAt: string;
}

export interface VoiceInterviewEvent {
  id: string;
  sessionId: string;
  type: VoiceInterviewEventType;
  createdAt: string;
  payload?: Record<string, unknown>;
}

// Resume Template Types
export type ResumeTemplateStyle = 'classic' | 'modern' | 'minimal';

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  style: ResumeTemplateStyle;
  texPath: string;
}

export interface PDFGenerationResult {
  pdfPath: string;
  generatedAt: string;
  templateId: string;
}

// ============================================================================
// Prep Sheet Types (Interview Cheat Sheets)
// ============================================================================

/**
 * Section identifiers for prep sheets - 11 modular sections
 * Users can dynamically add/remove sections at creation and during editing
 */
export type PrepSheetSectionId =
  | 'company-snapshot'
  | 'role-breakdown'
  | 'story-bank'
  | 'question-mapping'
  | 'company-alignment'
  | 'strengths-weaknesses'
  | 'key-talking-points'
  | 'questions-for-interviewer'
  | 'technical-prep'
  | 'logistics'
  | 'post-interview-reflection';

/**
 * Prep sheet metadata - company and role identification
 */
export interface PrepSheetMeta {
  companyName: string;
  roleTitle?: string;
  templateType: 'behavioral' | 'technical' | 'full';
}

/**
 * Section 1: Company Snapshot - Basic context reviewed before every interview
 */
export interface CompanySnapshotSection {
  companyName: string;
  industry?: string;
  product?: string;
  businessModel?: string;
  recentNews?: string;
  competitors?: string[];
  companyValues?: string[];
  mission?: string;
  interviewFormat?: string;
  dataSource: 'scraped' | 'manual' | 'mixed';
}

/**
 * Section 2: Role Breakdown - Maps job requirements to what you need to demonstrate
 */
export interface RoleBreakdownSection {
  roleTitle: string;
  teamOrg?: string;
  keyResponsibilities: string[];
  topSkills: string[];
  successLooksLike?: string;
  hiringSignals?: string[];
  dataSource: 'jd-parsed' | 'manual' | 'mixed';
}

/**
 * Section 3: Story Bank - References to existing STAR stories with per-sheet notes
 * Stories come from Core Stories feature - prep sheets reference, not duplicate
 */
export interface StoryBankSection {
  linkedStoryIds: string[];
  perSheetNotes: Record<
    string,
    {
      keyTakeaway?: string;
      followUpAngles?: string[];
    }
  >;
}

/**
 * Individual question mapping entry
 */
export interface QuestionMappingEntry {
  id: string;
  questionText: string;
  linkedStoryIds: string[];
  notes?: string;
  source: 'scraped' | 'manual';
  roleTitle?: string;
  stage?: string;
}

/**
 * Section 4: Question Mapping - Pre-map behavioral questions to stories
 */
export interface QuestionMappingSection {
  mappings: QuestionMappingEntry[];
}

/**
 * Value-to-story mapping for company alignment
 */
export interface ValueStoryMapping {
  companyValue: string;
  linkedStoryId: string;
  notes?: string;
}

/**
 * Section 5: Company-Specific Alignment - Customize stories per company values
 */
export interface CompanyAlignmentSection {
  valueStoryMappings: ValueStoryMapping[];
  relevantExperiences?: string[];
  gapsToFrame?: string[];
}

/**
 * Strength entry with supporting example
 */
export interface StrengthEntry {
  strength: string;
  supportingExample?: string;
}

/**
 * Weakness entry with mitigation strategy
 */
export interface WeaknessEntry {
  weakness: string;
  mitigationStrategy?: string;
}

/**
 * Section 6: Strengths & Weaknesses - Self-awareness positioning
 */
export interface StrengthsWeaknessesSection {
  strengths: StrengthEntry[];
  weaknesses: WeaknessEntry[];
}

/**
 * Section 7: Key Talking Points - Short, repeatable positioning statements
 */
export interface KeyTalkingPointsSection {
  whyCompany?: string;
  whyRole?: string;
  tellMeAboutYourselfShort?: string;
  careerNarrative?: string;
}

/**
 * Section 8: Questions for Interviewer - Prepared questions by category
 */
export interface QuestionsForInterviewerSection {
  roleQuestions: string[];
  teamQuestions: string[];
  companyQuestions: string[];
}

/**
 * Section 9: Technical Prep - For technical interviews, system design, coding rounds
 */
export interface TechnicalPrepSection {
  keyConcepts?: string[];
  systemDesignPatterns?: string[];
  commonTechnicalQuestions: QuestionMappingEntry[];
  projectDeepDive?: string[];
}

/**
 * Interview round details
 */
export interface InterviewRound {
  id: string;
  date?: string;
  type: string;
  interviewerName?: string;
  interviewerRole?: string;
  notes?: string;
}

/**
 * Section 10: Logistics & Notes - Interview scheduling and round notes
 */
export interface LogisticsSection {
  interviewRounds: InterviewRound[];
  notesPerRound?: Record<string, string>;
  thankYouNotes?: string;
}

/**
 * Section 11: Post-Interview Reflection - Learning and improvement tracking
 */
export interface PostInterviewReflectionSection {
  wentWell?: string[];
  didntGoWell?: string[];
  struggledQuestions?: string[];
  storiesToRefine?: string[];
}

/**
 * Union type for all prep sheet sections
 */
export type PrepSheetSection =
  | CompanySnapshotSection
  | RoleBreakdownSection
  | StoryBankSection
  | QuestionMappingSection
  | CompanyAlignmentSection
  | StrengthsWeaknessesSection
  | KeyTalkingPointsSection
  | QuestionsForInterviewerSection
  | TechnicalPrepSection
  | LogisticsSection
  | PostInterviewReflectionSection;

/**
 * Prep Sheet - Company-specific interview cheat sheet with dynamic sections
 * Sections are stored as a map allowing add/remove at any time
 */
export interface PrepSheet {
  id: string;
  userId: string;
  meta: PrepSheetMeta;
  sections: Partial<Record<PrepSheetSectionId, PrepSheetSection>>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Scraper Data Contract Types
// ============================================================================

/**
 * Scraped question with metadata for filtering by role/stage
 */
export interface ScrapedQuestion {
  text: string;
  roleTitle?: string;
  stage?: string;
  source: string;
}

/**
 * Scraped company data - Output contract from question ingestion pipeline
 * Used for autofilling prep sheet sections during creation wizard
 */
export interface ScrapedCompanyData {
  companyName: string;

  // For Company Snapshot section
  values?: string[];
  mission?: string;
  industry?: string;
  product?: string;
  interviewFormat?: string;

  // For Question Mapping section
  behavioralQuestions: ScrapedQuestion[];

  // For Technical Prep section
  technicalQuestions: ScrapedQuestion[];

  // For Role Breakdown section
  roleRequirements?: string[];

  // Provenance
  lastScrapedAt: string;
  sources: string[];
}

/**
 * Parsed job description - Output from JD parsing (Gemini AI)
 * Used for autofilling Role Breakdown section
 */
export interface ParsedJobDescription {
  roleTitle: string;
  responsibilities: string[];
  requiredSkills: string[];
  successIndicators?: string[];
  teamOrg?: string;
}

// ============================================================================
// Company Template Types
// ============================================================================

/**
 * Company template - Pre-populated prep sheet template from scraped data
 * Users can select these templates when creating a new prep sheet
 */
export interface CompanyTemplate {
  id: string;
  companyName: string;
  isBundled: boolean;

  // Pre-populated section data from scraping
  sections: {
    companySnapshot?: Partial<CompanySnapshotSection>;
    questionMapping?: Partial<QuestionMappingSection>;
    technicalPrep?: Partial<TechnicalPrepSection>;
  };

  // Template metadata
  createdAt: string;
  updatedAt: string;
  lastScrapedAt: string;
}

/**
 * User saved template - User's own prep sheet saved as reusable template
 */
export interface UserSavedTemplate {
  id: string;
  userId: string;
  name: string;
  basedOnSheetId: string;
  sections: PrepSheetSectionId[];
  createdAt: string;
}

/**
 * Input for creating a new prep sheet
 */
export interface CreatePrepSheetInput {
  companyName: string;
  roleTitle?: string;
  jobDescription?: string;
  sections: PrepSheetSectionId[];
  templateType: 'behavioral' | 'technical' | 'full';
  useTemplate?: string;
  useScrapedData?: boolean;
}
