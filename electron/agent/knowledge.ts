import type { ResumeDoc, ResumeFact } from '../internal-types';
import { UserDataStorage } from '../storage';

function pushFact(facts: ResumeFact[], fact: ResumeFact): void {
  facts.push(fact);
}

export class AgentKnowledgeAssembler {
  constructor(private readonly userDataStorage: UserDataStorage) {}

  async buildResumeDoc(): Promise<ResumeDoc> {
    const [resume, resumeAnalysis, candidateProfile, stories, interviewResponses] = await Promise.all([
      this.userDataStorage.getResume(),
      this.userDataStorage.getResumeAnalysis(),
      this.userDataStorage.getCandidateProfile(),
      this.userDataStorage.getStories(),
      this.userDataStorage.getInterviewResponses(),
    ]);

    const facts: ResumeFact[] = [];

    for (const skill of resume?.skills || []) {
      pushFact(facts, { id: `skill-${skill}`, kind: 'skill', text: skill, sourceId: resume?.id || 'resume', tags: ['skill'] });
    }

    for (const experience of resume?.workExperiences || []) {
      pushFact(facts, {
        id: `experience-${experience.id}`,
        kind: 'experience',
        text: `${experience.position} at ${experience.company}`,
        sourceId: experience.id,
        tags: ['experience', experience.company, experience.position],
      });
      for (const achievement of experience.achievements) {
        pushFact(facts, {
          id: `achievement-${experience.id}-${achievement}`,
          kind: 'achievement',
          text: achievement,
          sourceId: experience.id,
          tags: ['achievement', experience.company],
        });
      }
    }

    for (const story of stories) {
      pushFact(facts, {
        id: `story-${story.id}`,
        kind: 'story',
        text: `${story.title}: ${story.action}`,
        sourceId: story.id,
        tags: ['story', ...(story.tags || [])],
      });
    }

    for (const response of interviewResponses) {
      pushFact(facts, {
        id: `response-${response.id}`,
        kind: 'interview-response',
        text: `${response.question} ${response.response}`,
        sourceId: response.id,
        tags: ['interview-response', ...(response.tags || [])],
      });
    }

    for (const triggerPoint of resumeAnalysis?.triggerPoints || []) {
      pushFact(facts, {
        id: `trigger-${triggerPoint.id}`,
        kind: 'trigger-point',
        text: triggerPoint.description,
        sourceId: triggerPoint.id,
        tags: ['trigger-point'],
      });
    }

    for (const strength of candidateProfile?.strengths || []) {
      pushFact(facts, {
        id: `strength-${strength}`,
        kind: 'strength',
        text: strength,
        sourceId: candidateProfile?.updatedAt || 'candidate-profile',
        tags: ['strength'],
      });
    }

    for (const match of resume?.coreStoryMatches || []) {
      pushFact(facts, {
        id: `core-story-${match.category}-${match.relatedExperienceId}`,
        kind: 'core-story-match',
        text: `${match.category}: ${match.reasoning}`,
        sourceId: match.relatedExperienceId,
        tags: ['core-story-match', match.category],
      });
    }

    return {
      resume,
      resumeAnalysis,
      candidateProfile,
      stories,
      interviewResponses,
      facts,
    };
  }

  async searchResumeFacts(query: string): Promise<ResumeFact[]> {
    const doc = await this.buildResumeDoc();
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return doc.facts.slice(0, 10);
    }
    return doc.facts.filter(fact => {
      return fact.text.toLowerCase().includes(normalizedQuery)
        || fact.tags.some(tag => tag.toLowerCase().includes(normalizedQuery));
    }).slice(0, 10);
  }
}
