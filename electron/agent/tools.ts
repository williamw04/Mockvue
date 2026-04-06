/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AgentAssistantId, ResumeFact } from '../internal-types';
import { UserDataStorage } from '../storage';

export type AgentToolName =
  | 'resume_get'
  | 'resume_search'
  | 'bullet_get_weakest'
  | 'bullet_get_all'
  | 'trigger_points_get'
  | 'story_get_all'
  | 'memory_lookup'
  | 'memory_save'
  | 'memory_clear'
  | 'goal_create'
  | 'todo_create'
  | 'todo_complete'
  | 'change_propose'
  | 'profile_get'
  | 'profile_update'
  | 'version_create';

export interface AgentToolDefinition {
  name: AgentToolName;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      items?: {
        type: string;
        properties?: Record<string, {
          type: string;
          description: string;
          enum?: string[];
        }>;
        required?: string[];
      };
    }>;
    required: string[];
  };
}

export interface ToolCallResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export const AGENT_TOOLS: Record<AgentToolName, AgentToolDefinition> = {
  resume_get: {
    name: 'resume_get',
    description: 'Get the complete resume data including work experiences, skills, and education. Use this when you need the full resume context.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  resume_search: {
    name: 'resume_search',
    description: 'Search for specific information in the resume by keyword. Returns matching facts about experiences, skills, achievements, etc.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query - a keyword or phrase to find in the resume data',
        },
      },
      required: ['query'],
    },
  },
  bullet_get_weakest: {
    name: 'bullet_get_weakest',
    description: 'Get the resume bullet(s) with the lowest impact scores. Use this when the user asks about improving their weakest points.',
    parameters: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of weakest bullets to return (default: 1)',
        },
      },
      required: [],
    },
  },
  bullet_get_all: {
    name: 'bullet_get_all',
    description: 'Get all resume bullet analyses with their impact scores and issues. Use this to see the full picture of bullet quality.',
    parameters: {
      type: 'object',
      properties: {
        min_score: {
          type: 'number',
          description: 'Minimum impact score filter (0-10)',
        },
        max_score: {
          type: 'number',
          description: 'Maximum impact score filter (0-10)',
        },
      },
      required: [],
    },
  },
  trigger_points_get: {
    name: 'trigger_points_get',
    description: 'Get trigger points - topics that interviewers will likely ask about based on the resume. Use for interview preparation.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  story_get_all: {
    name: 'story_get_all',
    description: 'Get all STAR stories the user has prepared. Use this when discussing interview preparation or identifying story gaps.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  memory_lookup: {
    name: 'memory_lookup',
    description: 'Look up previously stored memory for this conversation session. Use to recall past context.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  memory_save: {
    name: 'memory_save',
    description: 'Save important information to memory for this session. Use when the user shares preferences or important context.',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The information to save',
        },
        kind: {
          type: 'string',
          enum: ['preference', 'goal', 'fact'],
          description: 'The type of memory entry',
        },
      },
      required: ['content', 'kind'],
    },
  },
  memory_clear: {
    name: 'memory_clear',
    description: 'Clear all memory for this session. Use when starting fresh or the user wants to reset context.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  goal_create: {
    name: 'goal_create',
    description: 'Create a coaching goal for the user. Use when the user agrees on a specific improvement target.',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['score_improvement', 'weakness_elimination', 'section_overhaul', 'role_tailoring', 'custom'],
          description: 'The type of coaching goal',
        },
        title: {
          type: 'string',
          description: 'Short title for the goal',
        },
        description: {
          type: 'string',
          description: 'Detailed description of what the goal entails',
        },
        targetMetric: {
          type: 'string',
          description: 'The metric to track (e.g. "impact_score", "weakness_count")',
        },
        targetValue: {
          type: 'number',
          description: 'The target value for the metric',
        },
      },
      required: ['type', 'title', 'description'],
    },
  },
  todo_create: {
    name: 'todo_create',
    description: 'Create a todo action item. Use to break goals into concrete steps.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Short title for the action item',
        },
        goalId: {
          type: 'string',
          description: 'ID of the parent goal to link this todo to',
        },
        description: {
          type: 'string',
          description: 'Detailed description of the action item',
        },
        targetType: {
          type: 'string',
          description: 'The type of target this todo relates to (bullet, section, story, general)',
        },
        targetId: {
          type: 'string',
          description: 'ID of the specific target (e.g. bullet ID or section ID)',
        },
      },
      required: ['title'],
    },
  },
  todo_complete: {
    name: 'todo_complete',
    description: 'Mark a todo item as completed. Use when an action item has been fulfilled.',
    parameters: {
      type: 'object',
      properties: {
        todoId: {
          type: 'string',
          description: 'The ID of the todo to mark as completed',
        },
      },
      required: ['todoId'],
    },
  },
  change_propose: {
    name: 'change_propose',
    description: 'Propose a change to the resume. Use when suggesting edits to bullets, summary, skills, or sections. Always include rationale and 2-3 alternatives.',
    parameters: {
      type: 'object',
      properties: {
        targetPath: {
          type: 'string',
          description: 'Path to the target element (e.g. "experiences[0].achievements[2]")',
        },
        targetType: {
          type: 'string',
          description: 'Type of the target element (bullet, summary, skill, section)',
        },
        operation: {
          type: 'string',
          description: 'The operation to perform (replace, insert, delete)',
        },
        proposedValue: {
          type: 'string',
          description: 'The proposed new value',
        },
        rationale: {
          type: 'string',
          description: 'Why this change improves the resume',
        },
        alternatives: {
          type: 'array',
          description: 'Alternative options for the user to choose from',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Unique ID for the alternative' },
              value: { type: 'string', description: 'The alternative text' },
              label: { type: 'string', description: 'Short label (e.g. "Concise", "Detailed")' },
            },
            required: ['id', 'value', 'label'],
          },
        },
      },
      required: ['targetPath', 'targetType', 'operation', 'proposedValue', 'rationale'],
    },
  },
  profile_get: {
    name: 'profile_get',
    description: 'Get the user\'s coaching profile including target role, industry, preferences, and writing style.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  profile_update: {
    name: 'profile_update',
    description: 'Update the user\'s coaching profile. Use when you learn about their preferences, target role, or writing style.',
    parameters: {
      type: 'object',
      properties: {
        targetRole: {
          type: 'string',
          description: 'The role the user is targeting (e.g. "Senior Software Engineer")',
        },
        targetIndustry: {
          type: 'string',
          description: 'The industry the user is targeting',
        },
        targetCompanies: {
          type: 'array',
          description: 'Companies the user is interested in',
          items: { type: 'string' },
        },
        personalBrand: {
          type: 'string',
          description: 'How the user wants to present themselves professionally',
        },
        presentationStyle: {
          type: 'string',
          description: 'Preferred presentation style',
        },
        tone: {
          type: 'string',
          description: 'Preferred writing tone (e.g. "professional", "conversational")',
        },
        bulletStyle: {
          type: 'string',
          description: 'Preferred bullet point style (concise, detailed, balanced)',
        },
      },
      required: [],
    },
  },
  version_create: {
    name: 'version_create',
    description: 'Create a resume version snapshot. Use when significant progress has been made to save a checkpoint.',
    parameters: {
      type: 'object',
      properties: {
        label: {
          type: 'string',
          description: 'A label for this version (e.g. "After bullet improvements", "Pre-interview prep")',
        },
      },
      required: ['label'],
    },
  },
};

export function getToolDefinitionsForAssistant(assistantId: AgentAssistantId): AgentToolDefinition[] {
  const baseTools: AgentToolName[] = ['resume_get', 'resume_search', 'memory_lookup', 'memory_save', 'memory_clear'];

  if (assistantId === 'resume-assistant') {
    return [
      ...baseTools,
      'bullet_get_weakest',
      'bullet_get_all',
      'trigger_points_get',
      'story_get_all',
      'goal_create',
      'todo_create',
      'todo_complete',
      'change_propose',
      'profile_get',
      'profile_update',
      'version_create',
    ].map(name => AGENT_TOOLS[name as AgentToolName]);
  }

  if (assistantId === 'behavioral-assistant') {
    return [...baseTools, 'story_get_all', 'trigger_points_get']
      .map(name => AGENT_TOOLS[name as AgentToolName]);
  }

  return baseTools.map(name => AGENT_TOOLS[name as AgentToolName]);
}

export class AgentToolExecutor {
  constructor(
    private readonly userDataStorage: UserDataStorage,
    private readonly memoryStore: { lookupMemory: (sessionId: string) => unknown[]; saveMemory: (sessionId: string, assistantId: AgentAssistantId, content: string, kind: string) => void; clearMemory: (sessionId: string) => void },
    private readonly sessionId: string,
    private readonly assistantId: AgentAssistantId,
    private readonly coachingStore: {
      addGoal: (sessionId: string, input: Record<string, unknown>) => Promise<any>;
      addTodo: (sessionId: string, input: Record<string, unknown>) => Promise<any>;
      updateTodo: (sessionId: string, todoId: string, update: Record<string, unknown>) => Promise<any>;
      proposeChange: (sessionId: string, input: Record<string, unknown>) => Promise<any>;
      getUserProfile: () => Promise<any>;
      updateUserProfile: (updates: Record<string, unknown>) => Promise<any>;
      createVersion: (sessionId: string, input: Record<string, unknown>) => Promise<any>;
    } | null = null,
  ) {}

  async execute(toolName: AgentToolName, params: Record<string, unknown>): Promise<ToolCallResult> {
    console.log(`[ToolExecutor] Executing: ${toolName}`, params);

    try {
      switch (toolName) {
        case 'resume_get': {
          const resume = await this.userDataStorage.getResume();
          return { success: true, data: resume };
        }

        case 'resume_search': {
          const query = String(params.query || '').toLowerCase();
          const resume = await this.userDataStorage.getResume();
          const analysis = await this.userDataStorage.getResumeAnalysis();
          const stories = await this.userDataStorage.getStories();

          const facts: ResumeFact[] = [];

          for (const skill of resume?.skills || []) {
            if (!query || skill.toLowerCase().includes(query)) {
              facts.push({ id: `skill-${skill}`, kind: 'skill', text: skill, sourceId: 'resume', tags: ['skill'] });
            }
          }

          for (const exp of resume?.workExperiences || []) {
            const expText = `${exp.position} ${exp.company}`.toLowerCase();
            if (!query || expText.includes(query)) {
              facts.push({
                id: `exp-${exp.id}`,
                kind: 'experience',
                text: `${exp.position} at ${exp.company}`,
                sourceId: exp.id,
                tags: ['experience'],
              });
            }
            for (const achievement of exp.achievements || []) {
              if (!query || achievement.toLowerCase().includes(query)) {
                facts.push({
                  id: `achievement-${exp.id}-${achievement.slice(0, 20)}`,
                  kind: 'achievement',
                  text: achievement,
                  sourceId: exp.id,
                  tags: ['achievement'],
                });
              }
            }
          }

          for (const story of stories || []) {
            const storyText = `${story.title} ${story.action}`.toLowerCase();
            if (!query || storyText.includes(query)) {
              facts.push({
                id: `story-${story.id}`,
                kind: 'story',
                text: `${story.title}: ${story.action}`,
                sourceId: story.id,
                tags: ['story', ...(story.tags || [])],
              });
            }
          }

          for (const tp of (analysis as any)?.triggerPoints || []) {
            if (!query || tp.description?.toLowerCase().includes(query)) {
              facts.push({
                id: `trigger-${tp.id}`,
                kind: 'trigger-point',
                text: tp.description,
                sourceId: tp.id,
                tags: ['trigger-point'],
              });
            }
          }

          return { success: true, data: facts.slice(0, 20) };
        }

        case 'bullet_get_weakest': {
          const analysis = await this.userDataStorage.getResumeAnalysis() as any;
          if (!analysis?.bulletAnalyses) {
            return { success: false, error: 'No bullet analysis available. Run resume analysis first.' };
          }

          const count = Number(params.count) || 1;
          const sorted = [...analysis.bulletAnalyses].sort((a, b) => (a.impactScore || 0) - (b.impactScore || 0));
          const weakest = sorted.slice(0, count);

          return {
            success: true,
            data: weakest.map((ba: any) => ({
              originalBullet: ba.originalBullet,
              impactScore: ba.impactScore,
              issues: ba.issues,
              suggestions: ba.suggestions,
              experienceId: ba.experienceId,
            })),
          };
        }

        case 'bullet_get_all': {
          const analysis = await this.userDataStorage.getResumeAnalysis() as any;
          if (!analysis?.bulletAnalyses) {
            return { success: false, error: 'No bullet analysis available. Run resume analysis first.' };
          }

          let bullets = analysis.bulletAnalyses;
          const minScore = params.min_score !== undefined ? Number(params.min_score) : undefined;
          const maxScore = params.max_score !== undefined ? Number(params.max_score) : undefined;

          if (minScore !== undefined) {
            bullets = bullets.filter((ba: any) => (ba.impactScore || 0) >= minScore);
          }
          if (maxScore !== undefined) {
            bullets = bullets.filter((ba: any) => (ba.impactScore || 0) <= maxScore);
          }

          return {
            success: true,
            data: bullets.map((ba: any) => ({
              originalBullet: ba.originalBullet,
              impactScore: ba.impactScore,
              issues: ba.issues,
              suggestions: ba.suggestions,
            })),
          };
        }

        case 'trigger_points_get': {
          const analysis = await this.userDataStorage.getResumeAnalysis() as any;
          if (!analysis?.triggerPoints) {
            return { success: false, error: 'No trigger points available. Run resume analysis first.' };
          }

          return {
            success: true,
            data: analysis.triggerPoints.map((tp: any) => ({
              id: tp.id,
              category: tp.category,
              description: tp.description,
              userComfort: tp.userComfort,
            })),
          };
        }

        case 'story_get_all': {
          const stories = await this.userDataStorage.getStories();
          return {
            success: true,
            data: (stories || []).map((s: any) => ({
              id: s.id,
              title: s.title,
              situation: s.situation,
              task: s.task,
              action: s.action,
              result: s.result,
              tags: s.tags,
            })),
          };
        }

        case 'memory_lookup': {
          const memories = this.memoryStore.lookupMemory(this.sessionId);
          return { success: true, data: memories };
        }

        case 'memory_save': {
          const content = String(params.content);
          const kind = String(params.kind) as 'preference' | 'goal' | 'fact';
          this.memoryStore.saveMemory(this.sessionId, this.assistantId, content, kind);
          return { success: true, data: { saved: true } };
        }

        case 'memory_clear': {
          this.memoryStore.clearMemory(this.sessionId);
          return { success: true, data: { cleared: true } };
        }

        case 'goal_create': {
          if (!this.coachingStore) {
            return { success: false, error: 'Coaching not available' };
          }
          const goal = await this.coachingStore.addGoal(this.sessionId, params as Record<string, unknown>);
          return { success: true, data: goal };
        }

        case 'todo_create': {
          if (!this.coachingStore) {
            return { success: false, error: 'Coaching not available' };
          }
          const todo = await this.coachingStore.addTodo(this.sessionId, {
            ...params,
            proposedBy: 'agent',
          });
          return { success: true, data: todo };
        }

        case 'todo_complete': {
          if (!this.coachingStore) {
            return { success: false, error: 'Coaching not available' };
          }
          const updated = await this.coachingStore.updateTodo(
            this.sessionId,
            String(params.todoId),
            { status: 'completed', completedAt: new Date().toISOString() },
          );
          return { success: true, data: updated };
        }

        case 'change_propose': {
          if (!this.coachingStore) {
            return { success: false, error: 'Coaching not available' };
          }
          const change = await this.coachingStore.proposeChange(this.sessionId, params as Record<string, unknown>);
          return { success: true, data: change };
        }

        case 'profile_get': {
          if (!this.coachingStore) {
            return { success: false, error: 'Coaching not available' };
          }
          const profile = await this.coachingStore.getUserProfile();
          return { success: true, data: profile };
        }

        case 'profile_update': {
          if (!this.coachingStore) {
            return { success: false, error: 'Coaching not available' };
          }
          const updates: Record<string, unknown> = {};
          const fields = ['targetRole', 'targetIndustry', 'targetCompanies', 'personalBrand', 'presentationStyle', 'tone', 'bulletStyle'];
          for (const field of fields) {
            if (params[field] !== undefined && params[field] !== null) {
              updates[field] = params[field];
            }
          }
          const updatedProfile = await this.coachingStore.updateUserProfile(updates);
          return { success: true, data: updatedProfile };
        }

        case 'version_create': {
          if (!this.coachingStore) {
            return { success: false, error: 'Coaching not available' };
          }
          const version = await this.coachingStore.createVersion(this.sessionId, {
            ...params,
            trigger: 'manual',
            resumeData: null,
            analysisData: null,
            score: 0,
          });
          return { success: true, data: version };
        }

        default:
          return { success: false, error: `Unknown tool: ${toolName}` };
      }
    } catch (error) {
      console.error(`[ToolExecutor] Error executing ${toolName}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}