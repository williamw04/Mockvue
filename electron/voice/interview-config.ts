// Local types for voice interview - avoids cross-boundary import

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
  projects: Project[];
  summary?: string;
  rawText?: string;
  resumePdfPath?: string;
  coreStoryMatches?: CoreStoryMatch[];
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

export interface CoreStoryMatch {
  category: string;
  relatedExperienceId: string;
  reasoning: string;
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
  coreCategory?: string;
  createdAt: string;
  updatedAt: string;
}

export type InterviewerStyle =
  | 'friendly-supportive'
  | 'neutral-professional'
  | 'challenging-probing'
  | 'senior-executive'
  | 'technical-deep';

export type InterviewPhase =
  | 'opening'
  | 'behavioral-deep'
  | 'technical'
  | 'situational'
  | 'closing';

export type QuestionCategory =
  | 'behavioral'
  | 'technical'
  | 'situational'
  | 'leadership'
  | 'role-specific';

export interface InterviewerPersona {
  style: InterviewerStyle;
  company: string;
  role: string;
  seniority: 'peer' | 'senior' | 'executive' | 'hiring-manager';
  name?: string;
  backgroundHint?: string;
}

export interface JobDescription {
  title: string;
  company: string;
  department?: string;
  summary: string;
  responsibilities: string[];
  requirements: {
    required: string[];
    preferred?: string[];
  };
  teamContext?: string;
  growthOpportunities?: string;
}

export interface EvaluationCriterion {
  name: string;
  description: string;
  weight: number;
  probingAreas: string[];
  redFlags: string[];
  greenFlags: string[];
}

export interface EvaluationRubric {
  criteria: EvaluationCriterion[];
  overallPassThreshold: number;
  focusAreas: string[];
}

export interface ConversationRules {
  maxFollowupDepth: number;
  minAnswerLengthBeforeProbe: number;
  silenceThresholdMs: number;
  interruptAllowed: boolean;
  transitionHints: string[];
  moveOnSignals: string[];
}

export interface InterviewQuestion {
  id: string;
  category: QuestionCategory;
  phase: InterviewPhase;
  question: string;
  followupPrompts: string[];
  evaluationCriteria: string[];
  timeBudgetMinutes: number;
  priority: number;
}

export interface InterviewPlan {
  questions: InterviewQuestion[];
  totalDurationMinutes: number;
  phaseOrder: InterviewPhase[];
  openingPrompt: string;
  closingPrompt: string;
}

export interface InterviewConfig {
  persona: InterviewerPersona;
  jobDescription: JobDescription;
  candidateResume: Resume;
  candidateStories: Story[];
  candidateSummary?: string;
  rubric: EvaluationRubric;
  conversationRules: ConversationRules;
  plan: InterviewPlan;
}

export interface InterviewState {
  currentPhase: InterviewPhase;
  currentQuestionIndex: number;
  followupDepth: number;
  turnsCompleted: number;
  startTime: string;
  lastActivityTime: string;
  transcriptSummary?: string;
}

export function createDefaultConversationRules(): ConversationRules {
  return {
    maxFollowupDepth: 2,
    minAnswerLengthBeforeProbe: 50,
    silenceThresholdMs: 3000,
    interruptAllowed: true,
    transitionHints: [
      'Let me move to another area',
      'I want to explore a different topic',
      'That gives me a good picture',
    ],
    moveOnSignals: [
      'candidate shows strong mastery',
      'answer is complete and clear',
      'candidate signals completion',
      'time budget exhausted',
    ],
  };
}

export function createDefaultInterviewerPersona(): InterviewerPersona {
  return {
    style: 'neutral-professional',
    company: 'Tech Company',
    role: 'Software Engineer',
    seniority: 'senior',
    name: 'Alex',
    backgroundHint: '10+ years in software development',
  };
}

export function createDefaultRubric(): EvaluationRubric {
  return {
    criteria: [
      {
        name: 'Communication',
        description: 'Clarity, structure, and effectiveness of verbal communication',
        weight: 20,
        probingAreas: ['story structure', 'technical explanations', 'handling ambiguity'],
        redFlags: ['rambling', 'vague answers', 'defensive tone'],
        greenFlags: ['clear STAR structure', 'concise explanations', 'proactive clarification'],
      },
      {
        name: 'Problem Solving',
        description: 'Approach to analyzing and solving complex problems',
        weight: 25,
        probingAreas: ['debugging approach', 'system design thinking', 'trade-off analysis'],
        redFlags: ['jumping to solutions', 'ignoring constraints', 'no structured approach'],
        greenFlags: ['breaking down problems', 'considering alternatives', 'articulating rationale'],
      },
      {
        name: 'Technical Depth',
        description: 'Knowledge and expertise in relevant technical areas',
        weight: 25,
        probingAreas: ['core technologies', 'system architecture', 'best practices'],
        redFlags: ['surface-level knowledge', 'unable to explain choices', 'gaps in fundamentals'],
        greenFlags: ['deep understanding', 'practical experience', 'awareness of trade-offs'],
      },
      {
        name: 'Behavioral Fit',
        description: 'Alignment with team culture and work style',
        weight: 15,
        probingAreas: ['collaboration', 'handling conflict', 'learning attitude'],
        redFlags: ['blaming others', 'rigid mindset', 'poor team awareness'],
        greenFlags: ['team-first attitude', 'growth mindset', 'self-awareness'],
      },
      {
        name: 'Leadership Potential',
        description: 'Ability to influence, mentor, and drive outcomes',
        weight: 15,
        probingAreas: ['initiative', 'mentorship', 'driving change'],
        redFlags: ['passive approach', 'no ownership', 'avoiding responsibility'],
        greenFlags: ['taking initiative', 'mentoring others', 'owning outcomes'],
      },
    ],
    overallPassThreshold: 70,
    focusAreas: ['Technical Depth', 'Problem Solving'],
  };
}