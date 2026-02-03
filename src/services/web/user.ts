/**
 * Web User Service Implementation
 * Uses localStorage for data persistence
 */

import type { UserProfile, Resume, Story, InterviewResponse } from '../../types';
import type { IUserService } from '../interfaces';

const STORAGE_KEYS = {
  USER_PROFILE: 'mockvue_user_profile',
  RESUME: 'mockvue_resume',
  STORIES: 'mockvue_stories',
  INTERVIEW_RESPONSES: 'mockvue_interview_responses',
};

export class WebUserService implements IUserService {
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async saveUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const existing = await this.getUserProfile();
      const now = new Date().toISOString();
      
      const updated: UserProfile = {
        id: existing?.id || crypto.randomUUID(),
        name: profile.name || existing?.name || '',
        email: profile.email || existing?.email,
        targetRole: profile.targetRole || existing?.targetRole,
        targetCompany: profile.targetCompany || existing?.targetCompany,
        onboardingCompleted: profile.onboardingCompleted ?? existing?.onboardingCompleted ?? false,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };
      
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  async completeOnboarding(): Promise<void> {
    try {
      const profile = await this.getUserProfile();
      if (profile) {
        await this.saveUserProfile({ ...profile, onboardingCompleted: true });
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  async getResume(): Promise<Resume | null> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESUME);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting resume:', error);
      return null;
    }
  }

  async saveResume(resume: Partial<Resume>): Promise<Resume> {
    try {
      const existing = await this.getResume();
      const profile = await this.getUserProfile();
      const now = new Date().toISOString();
      
      const updated: Resume = {
        id: existing?.id || crypto.randomUUID(),
        userId: profile?.id || '',
        workExperiences: resume.workExperiences || existing?.workExperiences || [],
        education: resume.education || existing?.education || [],
        skills: resume.skills || existing?.skills || [],
        summary: resume.summary || existing?.summary,
        rawText: resume.rawText || existing?.rawText,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };
      
      localStorage.setItem(STORAGE_KEYS.RESUME, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error saving resume:', error);
      throw error;
    }
  }

  async getStories(): Promise<Story[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting stories:', error);
      return [];
    }
  }

  async getStory(id: string): Promise<Story | null> {
    try {
      const stories = await this.getStories();
      return stories.find(s => s.id === id) || null;
    } catch (error) {
      console.error('Error getting story:', error);
      return null;
    }
  }

  async createStory(story: Omit<Story, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Story> {
    try {
      const stories = await this.getStories();
      const profile = await this.getUserProfile();
      const now = new Date().toISOString();
      
      const newStory: Story = {
        ...story,
        id: crypto.randomUUID(),
        userId: profile?.id || '',
        createdAt: now,
        updatedAt: now,
      };
      
      stories.push(newStory);
      localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
      return newStory;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  async updateStory(id: string, story: Partial<Story>): Promise<Story> {
    try {
      const stories = await this.getStories();
      const index = stories.findIndex(s => s.id === id);
      
      if (index === -1) {
        throw new Error('Story not found');
      }
      
      const updated: Story = {
        ...stories[index],
        ...story,
        id: stories[index].id,
        userId: stories[index].userId,
        createdAt: stories[index].createdAt,
        updatedAt: new Date().toISOString(),
      };
      
      stories[index] = updated;
      localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
      return updated;
    } catch (error) {
      console.error('Error updating story:', error);
      throw error;
    }
  }

  async deleteStory(id: string): Promise<void> {
    try {
      const stories = await this.getStories();
      const filtered = stories.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  }

  async getInterviewResponses(): Promise<InterviewResponse[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INTERVIEW_RESPONSES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting interview responses:', error);
      return [];
    }
  }

  async createInterviewResponse(response: Omit<InterviewResponse, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<InterviewResponse> {
    try {
      const responses = await this.getInterviewResponses();
      const profile = await this.getUserProfile();
      const now = new Date().toISOString();
      
      const newResponse: InterviewResponse = {
        ...response,
        id: crypto.randomUUID(),
        userId: profile?.id || '',
        createdAt: now,
        updatedAt: now,
      };
      
      responses.push(newResponse);
      localStorage.setItem(STORAGE_KEYS.INTERVIEW_RESPONSES, JSON.stringify(responses));
      return newResponse;
    } catch (error) {
      console.error('Error creating interview response:', error);
      throw error;
    }
  }

  async updateInterviewResponse(id: string, response: Partial<InterviewResponse>): Promise<InterviewResponse> {
    try {
      const responses = await this.getInterviewResponses();
      const index = responses.findIndex(r => r.id === id);
      
      if (index === -1) {
        throw new Error('Interview response not found');
      }
      
      const updated: InterviewResponse = {
        ...responses[index],
        ...response,
        id: responses[index].id,
        userId: responses[index].userId,
        createdAt: responses[index].createdAt,
        updatedAt: new Date().toISOString(),
      };
      
      responses[index] = updated;
      localStorage.setItem(STORAGE_KEYS.INTERVIEW_RESPONSES, JSON.stringify(responses));
      return updated;
    } catch (error) {
      console.error('Error updating interview response:', error);
      throw error;
    }
  }

  async deleteInterviewResponse(id: string): Promise<void> {
    try {
      const responses = await this.getInterviewResponses();
      const filtered = responses.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEYS.INTERVIEW_RESPONSES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting interview response:', error);
      throw error;
    }
  }
}
