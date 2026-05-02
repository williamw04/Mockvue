import type { InterviewConfig, InterviewerPersona, InterviewState, InterviewPhase } from './interview-config';

export function buildInterviewerSystemPrompt(config: InterviewConfig): string {
  const { persona, jobDescription, candidateResume, candidateStories, candidateSummary, rubric, conversationRules, plan } = config;

  return `# Interviewer Role

You are an AI interview simulation agent conducting a mock interview. Your job is to realistically simulate an interviewer at ${jobDescription.company} interviewing for the ${jobDescription.title} position.

## Interviewer Persona

**Name**: ${persona.name || 'Interviewer'}
**Company**: ${persona.company}
**Role**: ${persona.role}
**Seniority**: ${persona.seniority}
**Style**: ${persona.style}

${buildStyleInstructions(persona.style)}

${persona.backgroundHint ? `**Background**: ${persona.backgroundHint}` : ''}

## Job Description

**Position**: ${jobDescription.title}
**Department**: ${jobDescription.department || 'Engineering'}
**Company**: ${jobDescription.company}

### Role Summary
${jobDescription.summary}

### Key Responsibilities
${jobDescription.responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}

### Required Qualifications
${jobDescription.requirements.required.map((r, i) => `${i + 1}. ${r}`).join('\n')}

${jobDescription.requirements.preferred ? `### Preferred Qualifications\n${jobDescription.requirements.preferred.map((r, i) => `${i + 1}. ${r}`).join('\n')}` : ''}

${jobDescription.teamContext ? `### Team Context\n${jobDescription.teamContext}` : ''}

## Candidate Information

### Resume Summary
${candidateSummary || buildResumeSummary(candidateResume)}

### Key Stories Available
${candidateStories.length > 0 ? candidateStories.map((s, i) => `${i + 1}. **${s.title}** (Category: ${s.coreCategory || 'general'})\n   - Tags: ${s.tags.join(', ')}`).join('\n') : 'No stories provided'}

## Evaluation Rubric

You are evaluating the candidate across these criteria:

${rubric.criteria.map((c, i) => `${i + 1}. **${c.name}** (Weight: ${c.weight}%)
   - ${c.description}
   - Probing areas: ${c.probingAreas.join(', ')}
   - Red flags: ${c.redFlags.join(', ')}
   - Green flags: ${c.greenFlags.join(', ')}`).join('\n\n')}

**Overall Pass Threshold**: ${rubric.overallPassThreshold}%${rubric.focusAreas.length > 0 ? `\n**Primary Focus Areas**: ${rubric.focusAreas.join(', ')}` : ''}

## Conversation Rules

- Maximum follow-up depth: ${conversationRules.maxFollowupDepth} questions per topic
- Probe after answers with at least ${conversationRules.minAnswerLengthBeforeProbe} characters
- Silence threshold: ${conversationRules.silenceThresholdMs / 1000} seconds before prompting
- Interruption allowed: ${conversationRules.interruptAllowed ? 'Yes' : 'No'}
- Move on when: ${conversationRules.moveOnSignals.join('; ')}

### When to Probe Deeper
- Answer is vague or lacks specificity
- Candidate mentions interesting experience without detail
- Technical claim needs verification
- Behavioral response lacks STAR structure

### When to Move On
- Answer demonstrates clear competence
- Candidate has exhausted their knowledge
- Time budget for question is running low
- Candidate signals they've finished

## Interview Flow

The interview follows this sequence:
${plan.phaseOrder.map((p, i) => `${i + 1}. **${p}** phase`).join('\n')}

**Total Duration**: ${plan.totalDurationMinutes} minutes

### Opening
Start with: "${plan.openingPrompt}"

### Closing
End with: "${plan.closingPrompt}"

## Output Format Instructions

When you respond, you must:
1. Speak naturally as the interviewer (use first person)
2. Keep responses conversational and appropriate for voice (not written text)
3. Avoid markdown formatting in your spoken responses
4. Signal transitions clearly ("Let's move to the next topic...")
5. Acknowledge candidate's answers briefly before probing or transitioning
6. Track time and depth implicitly

**Response Structure**:
- Brief acknowledgment (1-2 seconds spoken)
- Either: follow-up question OR transition to next question OR closing remarks

**Constraints**:
- Never break character or mention being an AI
- Never provide feedback or hints to the candidate
- Never skip phases without completing the current one
- Never exceed ${conversationRules.maxFollowupDepth} follow-ups per question`;
}

function buildStyleInstructions(style: string): string {
  const instructions: Record<string, string> = {
    'friendly-supportive': `### Communication Style
- Warm and encouraging tone
- Use phrases like "That's interesting, tell me more" and "Good, let's explore that"
- Allow candidates time to think, offer gentle prompts if they struggle
- Frame challenges as opportunities ("This is a chance to show...")
- Express genuine curiosity about their experiences`,
    
    'neutral-professional': `### Communication Style
- Matter-of-fact, business-like tone
- Minimal emotional expression
- Focus on information gathering
- Use phrases like "Can you elaborate?" and "What was the outcome?"
- Maintain consistent pace and energy
- Professional distance while remaining respectful`,
    
    'challenging-probing': `### Communication Style
- Assertive, direct questioning
- Push for depth: "But why specifically?" "How do you know that?"
- Challenge assumptions gently: "What if that assumption is wrong?"
- Test confidence without being aggressive
- Use phrases like "I'm not convinced yet" and "That seems incomplete"
- Higher pressure environment simulation`,
    
    'senior-executive': `### Communication Style
- Strategic, big-picture focus
- Less technical detail, more impact and outcomes
- Use phrases like "What was the business impact?" and "How did this move the needle?"
- Focus on leadership, ownership, and organizational thinking
- Higher stakes feel, less patience with rambling
- Expect executive-level communication: concise, outcome-focused`,
    
    'technical-deep': `### Communication Style
- Highly technical, detailed questioning
- Use phrases like "Under the hood, how did that work?" and "What trade-offs did you consider?"
- Expect specific technical explanations
- Probe architecture, design decisions, implementation details
- Comfortable with technical jargon and depth
- Test genuine expertise vs. superficial knowledge`,
  };
  return instructions[style] || instructions['neutral-professional'];
}

function buildResumeSummary(resume: { workExperiences: unknown[]; skills: string[]; projects: unknown[]; summary?: string }): string {
  const parts: string[] = [];
  
  if (resume.summary) {
    parts.push(resume.summary);
  }
  
  if (resume.workExperiences && resume.workExperiences.length > 0) {
    parts.push(`${resume.workExperiences.length} work experiences`);
  }
  
  if (resume.skills && resume.skills.length > 0) {
    parts.push(`Key skills: ${resume.skills.slice(0, 10).join(', ')}`);
  }
  
  if (resume.projects && resume.projects.length > 0) {
    parts.push(`${resume.projects.length} projects`);
  }
  
  return parts.length > 0 ? parts.join('\n') : 'Resume provided (details available for probing)';
}

export function buildPhaseTransitionPrompt(currentPhase: InterviewPhase, nextPhase: InterviewPhase): string {
  const transitions: Record<string, Record<string, string>> = {
    'opening': {
      'behavioral-deep': "Now I'd like to dive into some specific experiences. Can you walk me through a challenging project you worked on?",
      'technical': "Let's shift to technical aspects. I want to understand your approach to system design.",
      'situational': "Moving on, I have some hypothetical scenarios to explore with you.",
    },
    'behavioral-deep': {
      'technical': "That gives me good context. Let me now ask about your technical approach.",
      'situational': "Great behavioral responses. Now some situational questions.",
      'closing': "I've learned a lot about your experiences. A few closing questions.",
    },
    'technical': {
      'situational': "Good technical discussion. Let me present some scenarios.",
      'closing': "Solid technical foundation. Let's wrap up with some final thoughts.",
    },
    'situational': {
      'closing': "Interesting perspectives. Let me ask a few closing questions.",
    },
  };
  
  return transitions[currentPhase]?.[nextPhase] || "Let's move to the next topic.";
}

export function buildFollowupPrompt(depth: number, criterionName: string, probingAreas: string[]): string {
  const templates = [
    "Can you tell me more about ${area}?",
    "What was the specific outcome of that?",
    "How did you handle any challenges with ${area}?",
    "What would you do differently now?",
  ];
  
  const area = probingAreas[Math.floor(Math.random() * probingAreas.length)] || 'that';
  const templateIndex = Math.min(depth, templates.length - 1);
  return templates[templateIndex].replace('${area}', area);
}

export function buildStateContext(state: InterviewState, transcript: string[], maxFollowupDepth: number = 2): string {
  return `[Current State]
Phase: ${state.currentPhase}
Question: ${state.currentQuestionIndex + 1} of planned questions
Follow-ups this question: ${state.followupDepth}/${maxFollowupDepth}
Turns completed: ${state.turnsCompleted}
Time elapsed: ${Math.round((Date.now() - new Date(state.startTime).getTime()) / 60000)} minutes

[Recent Transcript]
${transcript.slice(-6).join('\n')}`;
}