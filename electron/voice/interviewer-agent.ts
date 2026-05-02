import { GoogleGenerativeAI } from '@google/generative-ai';
import type { InterviewConfig, InterviewState, InterviewPhase } from './interview-config';
import { buildInterviewerSystemPrompt, buildPhaseTransitionPrompt, buildStateContext } from './interviewer-prompt';

export interface InterviewTurnInput {
  candidateSpeech: string;
  isInterrupt?: boolean;
}

export interface InterviewTurnOutput {
  interviewerResponse: string;
  state: InterviewState;
  shouldEnd: boolean;
  phaseTransition?: { from: InterviewPhase; to: InterviewPhase };
}

export interface InterviewerAgentConfig {
  geminiApiKey: string;
  interviewConfig: InterviewConfig;
  model?: string;
}

export interface InterviewerEventHandler {
  onResponse: (text: string) => void;
  onPhaseChange: (from: InterviewPhase, to: InterviewPhase) => void;
  onStateUpdate: (state: InterviewState) => void;
  onError: (error: Error) => void;
}

const DEFAULT_MODEL = 'gemini-3-flash-preview';

export class InterviewerAgent {
  private genAI: GoogleGenerativeAI | null = null;
  private config: InterviewConfig;
  private state: InterviewState;
  private transcript: Array<{ speaker: 'interviewer' | 'candidate'; text: string }> = [];
  private model: string;
  private handlers?: InterviewerEventHandler;

  constructor(agentConfig: InterviewerAgentConfig, handlers?: InterviewerEventHandler) {
    this.config = agentConfig.interviewConfig;
    this.model = agentConfig.model || DEFAULT_MODEL;
    this.handlers = handlers;
    
    if (agentConfig.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(agentConfig.geminiApiKey);
    }

    this.state = {
      currentPhase: 'opening',
      currentQuestionIndex: 0,
      followupDepth: 0,
      turnsCompleted: 0,
      startTime: new Date().toISOString(),
      lastActivityTime: new Date().toISOString(),
    };
  }

  setApiKey(apiKey: string): void {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  getState(): InterviewState {
    return this.state;
  }

  getTranscript(): Array<{ speaker: 'interviewer' | 'candidate'; text: string }> {
    return this.transcript;
  }

  async initialize(): Promise<string> {
    const openingPrompt = this.config.plan.openingPrompt || 
      "Hello, welcome to your interview for the ${jobDescription.role} position at ${jobDescription.company}. I'm ${persona.name || 'your interviewer'}. Let's start with you telling me a bit about yourself and what drew you to this role.";

    const formattedOpening = openingPrompt
      .replace('${jobDescription.role}', this.config.jobDescription.title)
      .replace('${jobDescription.company}', this.config.jobDescription.company)
      .replace('${persona.name}', this.config.persona.name || 'your interviewer');

    this.transcript.push({ speaker: 'interviewer', text: formattedOpening });
    this.handlers?.onResponse?.(formattedOpening);
    
    return formattedOpening;
  }

  async processCandidateInput(input: InterviewTurnInput): Promise<InterviewTurnOutput> {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    this.transcript.push({ speaker: 'candidate', text: input.candidateSpeech });
    this.state.lastActivityTime = new Date().toISOString();
    this.state.turnsCompleted++;

    const systemPrompt = buildInterviewerSystemPrompt(this.config);
    const stateContext = buildStateContext(this.state, this.transcript.map(t => `${t.speaker}: ${t.text}`));

    const fullPrompt = `${systemPrompt}

${stateContext}

---

The candidate just said: "${input.candidateSpeech}"

${input.isInterrupt ? '[Note: The candidate interrupted you. Respond appropriately and let them finish.]' : ''}

As the interviewer, respond naturally. Consider:
1. Should I acknowledge their answer briefly?
2. Should I probe deeper on this topic (current followup depth: ${this.state.followupDepth}/${this.config.conversationRules.maxFollowupDepth})?
3. Should I transition to the next question or phase?
4. Are we nearing the end of the interview?

Remember: Speak as the interviewer, keep responses voice-appropriate (no markdown), and stay in character.`;

    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const interviewerText = response.text();

      this.transcript.push({ speaker: 'interviewer', text: interviewerText });
      this.handlers?.onResponse?.(interviewerText);

      const newState = this.determineNextState(interviewerText, input.candidateSpeech);
      const shouldEnd = this.shouldEndInterview();
      
      let phaseTransition: { from: InterviewPhase; to: InterviewPhase } | undefined;
      if (newState.currentPhase !== this.state.currentPhase) {
        phaseTransition = { from: this.state.currentPhase, to: newState.currentPhase };
        this.handlers?.onPhaseChange?.(this.state.currentPhase, newState.currentPhase);
      }

      this.state = newState;
      this.handlers?.onStateUpdate?.(this.state);

      return {
        interviewerResponse: interviewerText,
        state: this.state,
        shouldEnd,
        phaseTransition,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.handlers?.onError?.(err);
      throw err;
    }
  }

  private determineNextState(interviewerResponse: string, candidateResponse: string): InterviewState {
    const newState: InterviewState = { ...this.state };
    
    const transitionKeywords = ['let\'s move', 'next topic', 'moving on', 'shift to', 'next question'];
    const hasTransition = transitionKeywords.some(k => interviewerResponse.toLowerCase().includes(k));
    
    const probeKeywords = ['tell me more', 'can you elaborate', 'what specifically', 'how exactly', 'why'];
    const isProbing = probeKeywords.some(k => interviewerResponse.toLowerCase().includes(k));
    
    const closingKeywords = ['final question', 'before we wrap', 'closing', 'any questions for me', 'last thing'];
    const isClosing = closingKeywords.some(k => interviewerResponse.toLowerCase().includes(k));

    if (isProbing && !hasTransition) {
      newState.followupDepth++;
    } else if (hasTransition) {
      newState.followupDepth = 0;
      newState.currentQuestionIndex++;
      
      const questionsPerPhase = Math.ceil(this.config.plan.questions.length / this.config.plan.phaseOrder.length);
      const phaseIndex = Math.floor(newState.currentQuestionIndex / questionsPerPhase);
      
      if (phaseIndex < this.config.plan.phaseOrder.length) {
        newState.currentPhase = this.config.plan.phaseOrder[phaseIndex];
      } else {
        newState.currentPhase = 'closing';
      }
    }

    if (isClosing) {
      newState.currentPhase = 'closing';
    }

    newState.lastActivityTime = new Date().toISOString();
    
    return newState;
  }

  private shouldEndInterview(): boolean {
    const elapsedMs = Date.now() - new Date(this.state.startTime).getTime();
    const elapsedMinutes = elapsedMs / 60000;
    
    if (elapsedMinutes >= this.config.plan.totalDurationMinutes) {
      return true;
    }
    
    if (this.state.currentPhase === 'closing' && this.state.turnsCompleted > 5) {
      const closingKeywords = ['good luck', 'thank you', 'appreciate your time', 'pleasure meeting you'];
      const lastResponse = this.transcript[this.transcript.length - 1]?.text || '';
      return closingKeywords.some(k => lastResponse.toLowerCase().includes(k));
    }
    
    return false;
  }

  async generateClosing(): Promise<string> {
    const closingPrompt = this.config.plan.closingPrompt || 
      "Thank you for taking the time to speak with me today. It was great learning more about your experience. We'll be in touch soon regarding next steps. Do you have any questions for me before we wrap up?";

    this.transcript.push({ speaker: 'interviewer', text: closingPrompt });
    this.handlers?.onResponse?.(closingPrompt);
    
    this.state.currentPhase = 'closing';
    this.handlers?.onStateUpdate?.(this.state);
    
    return closingPrompt;
  }

  reset(): void {
    this.transcript = [];
    this.state = {
      currentPhase: 'opening',
      currentQuestionIndex: 0,
      followupDepth: 0,
      turnsCompleted: 0,
      startTime: new Date().toISOString(),
      lastActivityTime: new Date().toISOString(),
    };
  }

  summarizeTranscript(): string {
    const interviewerTurns = this.transcript.filter(t => t.speaker === 'interviewer');
    const candidateTurns = this.transcript.filter(t => t.speaker === 'candidate');
    
    return `Interview Summary:
- Duration: ${Math.round((Date.now() - new Date(this.state.startTime).getTime()) / 60000)} minutes
- Turns completed: ${this.state.turnsCompleted}
- Questions asked: ${this.state.currentQuestionIndex + 1}
- Final phase: ${this.state.currentPhase}

Key interviewer prompts:
${interviewerTurns.slice(0, 5).map(t => `- ${t.text.slice(0, 100)}...`).join('\n')}

Candidate responses:
${candidateTurns.slice(0, 5).map(t => `- ${t.text.slice(0, 100)}...`).join('\n')}`;
  }
}

export function createInterviewerAgent(
  geminiApiKey: string,
  interviewConfig: InterviewConfig,
  handlers?: InterviewerEventHandler
): InterviewerAgent {
  return new InterviewerAgent({ geminiApiKey, interviewConfig }, handlers);
}