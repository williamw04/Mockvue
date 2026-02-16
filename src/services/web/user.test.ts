import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebUserService } from './user';

describe('WebUserService', () => {
  let service: WebUserService;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    service = new WebUserService();
  });

  describe('getUserProfile', () => {
    it('returns null when no profile exists', async () => {
      const profile = await service.getUserProfile();
      expect(profile).toBeNull();
    });

    it('returns stored profile', async () => {
      const stored = {
        id: 'user-1',
        name: 'Jane',
        onboardingCompleted: false,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      localStorage.setItem('mockvue_user_profile', JSON.stringify(stored));

      const profile = await service.getUserProfile();
      expect(profile).not.toBeNull();
      expect(profile!.name).toBe('Jane');
    });
  });

  describe('saveUserProfile', () => {
    it('creates a new profile when none exists', async () => {
      const profile = await service.saveUserProfile({
        name: 'Alice',
        targetRole: 'Engineer',
      });

      expect(profile.name).toBe('Alice');
      expect(profile.targetRole).toBe('Engineer');
      expect(profile.id).toBeDefined();
      expect(profile.onboardingCompleted).toBe(false);
    });

    it('merges with existing profile', async () => {
      await service.saveUserProfile({ name: 'Bob', targetRole: 'PM' });
      const updated = await service.saveUserProfile({ targetCompany: 'Acme' });

      expect(updated.name).toBe('Bob');
      expect(updated.targetRole).toBe('PM');
      expect(updated.targetCompany).toBe('Acme');
    });

    it('preserves existing id on update', async () => {
      const first = await service.saveUserProfile({ name: 'Carol' });
      const second = await service.saveUserProfile({ name: 'Carol Updated' });

      expect(second.id).toBe(first.id);
    });
  });

  describe('completeOnboarding', () => {
    it('sets onboardingCompleted to true', async () => {
      await service.saveUserProfile({ name: 'Test' });
      await service.completeOnboarding();

      const profile = await service.getUserProfile();
      expect(profile!.onboardingCompleted).toBe(true);
    });
  });

  describe('stories CRUD', () => {
    it('returns empty array when no stories exist', async () => {
      const stories = await service.getStories();
      expect(stories).toEqual([]);
    });

    it('creates a story with generated id and timestamps', async () => {
      const story = await service.createStory({
        title: 'Led a team project',
        situation: 'Our team needed a new feature...',
        task: 'I was responsible for...',
        action: 'I organized the team...',
        result: 'We delivered on time...',
        tags: ['leadership'],
      });

      expect(story.id).toBeDefined();
      expect(story.title).toBe('Led a team project');
      expect(story.tags).toEqual(['leadership']);
      expect(story.createdAt).toBeDefined();
    });

    it('gets a story by id', async () => {
      const created = await service.createStory({
        title: 'My Story',
        situation: 'S',
        task: 'T',
        action: 'A',
        result: 'R',
        tags: [],
      });

      const found = await service.getStory(created.id);
      expect(found).not.toBeNull();
      expect(found!.title).toBe('My Story');
    });

    it('returns null for nonexistent story', async () => {
      const found = await service.getStory('nonexistent');
      expect(found).toBeNull();
    });

    it('updates a story', async () => {
      const created = await service.createStory({
        title: 'Original',
        situation: 'S',
        task: 'T',
        action: 'A',
        result: 'R',
        tags: [],
      });

      const updated = await service.updateStory(created.id, {
        title: 'Updated Title',
        tags: ['new-tag'],
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.tags).toEqual(['new-tag']);
      expect(updated.id).toBe(created.id);
      expect(updated.createdAt).toBe(created.createdAt);
    });

    it('throws when updating nonexistent story', async () => {
      await expect(
        service.updateStory('nonexistent', { title: 'Nope' }),
      ).rejects.toThrow('Story not found');
    });

    it('deletes a story', async () => {
      const story = await service.createStory({
        title: 'To Delete',
        situation: 'S',
        task: 'T',
        action: 'A',
        result: 'R',
        tags: [],
      });

      await service.deleteStory(story.id);
      const stories = await service.getStories();
      expect(stories).toHaveLength(0);
    });
  });

  describe('resume', () => {
    it('returns null when no resume exists', async () => {
      const resume = await service.getResume();
      expect(resume).toBeNull();
    });

    it('saves and retrieves resume', async () => {
      const resume = await service.saveResume({
        skills: ['TypeScript', 'React'],
        summary: 'Experienced developer',
      });

      expect(resume.skills).toEqual(['TypeScript', 'React']);
      expect(resume.summary).toBe('Experienced developer');

      const retrieved = await service.getResume();
      expect(retrieved).not.toBeNull();
      expect(retrieved!.skills).toEqual(['TypeScript', 'React']);
    });

    it('merges with existing resume', async () => {
      await service.saveResume({ skills: ['TypeScript'] });
      const updated = await service.saveResume({
        summary: 'Updated summary',
      });

      expect(updated.skills).toEqual(['TypeScript']);
      expect(updated.summary).toBe('Updated summary');
    });
  });

  describe('interview responses CRUD', () => {
    it('returns empty array when no responses exist', async () => {
      const responses = await service.getInterviewResponses();
      expect(responses).toEqual([]);
    });

    it('creates an interview response', async () => {
      const response = await service.createInterviewResponse({
        question: 'Tell me about a time you led a team',
        response: 'In my last role...',
        storyIds: ['story-1'],
        tags: ['leadership'],
        isPracticed: false,
      });

      expect(response.id).toBeDefined();
      expect(response.question).toBe('Tell me about a time you led a team');
      expect(response.isPracticed).toBe(false);
    });

    it('updates an interview response', async () => {
      const created = await service.createInterviewResponse({
        question: 'Test question',
        response: 'Original',
        storyIds: [],
        tags: [],
        isPracticed: false,
      });

      const updated = await service.updateInterviewResponse(created.id, {
        isPracticed: true,
        response: 'Refined answer',
      });

      expect(updated.isPracticed).toBe(true);
      expect(updated.response).toBe('Refined answer');
    });

    it('throws when updating nonexistent response', async () => {
      await expect(
        service.updateInterviewResponse('nonexistent', { isPracticed: true }),
      ).rejects.toThrow('Interview response not found');
    });

    it('deletes an interview response', async () => {
      const created = await service.createInterviewResponse({
        question: 'To delete',
        response: 'Delete me',
        storyIds: [],
        tags: [],
        isPracticed: false,
      });

      await service.deleteInterviewResponse(created.id);
      const responses = await service.getInterviewResponses();
      expect(responses).toHaveLength(0);
    });
  });
});
