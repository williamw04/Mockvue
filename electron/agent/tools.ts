import type { AgentAssistantId, ResumeFact, ResumeDoc } from '../internal-types';
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
  | 'memory_clear';

export interface AgentToolDefinition {
  name: AgentToolName;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
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
};

export function getToolDefinitionsForAssistant(assistantId: AgentAssistantId): AgentToolDefinition[] {
  const baseTools: AgentToolName[] = ['resume_get', 'resume_search', 'memory_lookup', 'memory_save', 'memory_clear'];

  if (assistantId === 'resume-assistant') {
    return [...baseTools, 'bullet_get_weakest', 'bullet_get_all', 'trigger_points_get', 'story_get_all']
      .map(name => AGENT_TOOLS[name as AgentToolName]);
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

        default:
          return { success: false, error: `Unknown tool: ${toolName}` };
      }
    } catch (error) {
      console.error(`[ToolExecutor] Error executing ${toolName}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}