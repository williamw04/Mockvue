import type { UserProfile, Resume, Story, InterviewResponse, CandidateProfile } from '../../types';
import type { IUserService } from '../interfaces';

export class ElectronUserService implements IUserService {
  async getUserProfile(): Promise<UserProfile | null> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      return await window.electronAPI.getUserProfile();
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async saveUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      return await window.electronAPI.saveUserProfile(profile);
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  async completeOnboarding(): Promise<void> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      await window.electronAPI.completeOnboarding();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  async getResume(): Promise<Resume | null> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      return await window.electronAPI.getResume();
    } catch (error) {
      console.error('Error getting resume:', error);
      return null;
    }
  }

  async saveResume(resume: Partial<Resume>): Promise<Resume> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      return await window.electronAPI.saveResume(resume);
    } catch (error) {
      console.error('Error saving resume:', error);
      throw error;
    }
  }

  async getStories(): Promise<Story[]> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      return await window.electronAPI.getStories();
    } catch (error) {
      console.error('Error getting stories:', error);
      return [];
    }
  }

  async getStory(id: string): Promise<Story | null> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      return await window.electronAPI.getStory(id);
    } catch (error) {
      console.error('Error getting story:', error);
      return null;
    }
  }

  async createStory(story: Omit<Story, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Story> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      return await window.electronAPI.createStory(story);
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  async updateStory(id: string, story: Partial<Story>): Promise<Story> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      return await window.electronAPI.updateStory(id, story);
    } catch (error) {
      console.error('Error updating story:', error);
      throw error;
    }
  }

  async deleteStory(id: string): Promise<void> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      await window.electronAPI.deleteStory(id);
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  }

  async getInterviewResponses(): Promise<InterviewResponse[]> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      return await window.electronAPI.getInterviewResponses();
    } catch (error) {
      console.error('Error getting interview responses:', error);
      return [];
    }
  }

  async createInterviewResponse(response: Omit<InterviewResponse, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<InterviewResponse> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      return await window.electronAPI.createInterviewResponse(response);
    } catch (error) {
      console.error('Error creating interview response:', error);
      throw error;
    }
  }

  async updateInterviewResponse(id: string, response: Partial<InterviewResponse>): Promise<InterviewResponse> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      return await window.electronAPI.updateInterviewResponse(id, response);
    } catch (error) {
      console.error('Error updating interview response:', error);
      throw error;
    }
  }

  async deleteInterviewResponse(id: string): Promise<void> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      await window.electronAPI.deleteInterviewResponse(id);
    } catch (error) {
      console.error('Error deleting interview response:', error);
      throw error;
    }
  }

  async getCandidateProfile(): Promise<CandidateProfile | null> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      return await window.electronAPI.getCandidateProfile();
    } catch (error) {
      console.error('Error getting candidate profile:', error);
      return null;
    }
  }

  async saveCandidateProfile(profile: CandidateProfile): Promise<CandidateProfile> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      return await window.electronAPI.saveCandidateProfile(profile);
    } catch (error) {
      console.error('Error saving candidate profile:', error);
      throw error;
    }
  }
}
