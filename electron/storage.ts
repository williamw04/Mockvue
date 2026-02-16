/**
 * User Data Storage Manager for Electron
 * Handles user profile, resume, stories, and interview responses
 */

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  targetRole?: string;
  targetCompany?: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface InterviewResponse {
  id: string;
  userId: string;
  question: string;
  response: string;
  storyIds: string[];
  tags: string[];
  isPracticed: boolean;
  lastPracticedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User Data Storage Manager for Electron
 * Handles user profile, resume, stories, and interview responses
 */
export class UserDataStorage {
  private userDataDir: string;
  private userProfileFile: string;
  private resumeFile: string;
  private storiesFile: string;
  private responsesFile: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.userDataDir = path.join(userDataPath, 'user-data');
    this.userProfileFile = path.join(this.userDataDir, 'profile.json');
    this.resumeFile = path.join(this.userDataDir, 'resume.json');
    this.storiesFile = path.join(this.userDataDir, 'stories.json');
    this.responsesFile = path.join(this.userDataDir, 'responses.json');

    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.userDataDir)) {
      fs.mkdirSync(this.userDataDir, { recursive: true });
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // User Profile Methods
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      if (fs.existsSync(this.userProfileFile)) {
        const data = fs.readFileSync(this.userProfileFile, 'utf-8');
        return JSON.parse(data);
      }
      return null;
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
        id: existing?.id || this.generateId(),
        name: profile.name || existing?.name || '',
        email: profile.email || existing?.email,
        targetRole: profile.targetRole || existing?.targetRole,
        targetCompany: profile.targetCompany || existing?.targetCompany,
        onboardingCompleted: profile.onboardingCompleted ?? existing?.onboardingCompleted ?? false,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      fs.writeFileSync(this.userProfileFile, JSON.stringify(updated, null, 2), 'utf-8');
      return updated;
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  async completeOnboarding(): Promise<void> {
    const profile = await this.getUserProfile();
    if (profile) {
      await this.saveUserProfile({ ...profile, onboardingCompleted: true });
    }
  }

  // Resume Methods
  async getResume(): Promise<Resume | null> {
    try {
      if (fs.existsSync(this.resumeFile)) {
        const data = fs.readFileSync(this.resumeFile, 'utf-8');
        return JSON.parse(data);
      }
      return null;
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
        id: existing?.id || this.generateId(),
        userId: profile?.id || '',
        workExperiences: resume.workExperiences || existing?.workExperiences || [],
        education: resume.education || existing?.education || [],
        skills: resume.skills || existing?.skills || [],
        projects: resume.projects || existing?.projects || [],
        summary: resume.summary || existing?.summary,
        rawText: resume.rawText || existing?.rawText,
        resumePdfPath: resume.resumePdfPath || existing?.resumePdfPath,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      fs.writeFileSync(this.resumeFile, JSON.stringify(updated, null, 2), 'utf-8');
      return updated;
    } catch (error) {
      console.error('Error saving resume:', error);
      throw error;
    }
  }

  // Story Methods
  async getStories(): Promise<Story[]> {
    try {
      if (fs.existsSync(this.storiesFile)) {
        const data = fs.readFileSync(this.storiesFile, 'utf-8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error getting stories:', error);
      return [];
    }
  }

  async getStory(id: string): Promise<Story | null> {
    const stories = await this.getStories();
    return stories.find(s => s.id === id) || null;
  }

  async createStory(story: Omit<Story, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Story> {
    try {
      const stories = await this.getStories();
      const profile = await this.getUserProfile();
      const now = new Date().toISOString();

      const newStory: Story = {
        ...story,
        id: this.generateId(),
        userId: profile?.id || '',
        createdAt: now,
        updatedAt: now,
      };

      stories.push(newStory);
      fs.writeFileSync(this.storiesFile, JSON.stringify(stories, null, 2), 'utf-8');
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
      fs.writeFileSync(this.storiesFile, JSON.stringify(stories, null, 2), 'utf-8');
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
      fs.writeFileSync(this.storiesFile, JSON.stringify(filtered, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  }

  // Interview Response Methods
  async getInterviewResponses(): Promise<InterviewResponse[]> {
    try {
      if (fs.existsSync(this.responsesFile)) {
        const data = fs.readFileSync(this.responsesFile, 'utf-8');
        return JSON.parse(data);
      }
      return [];
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
        id: this.generateId(),
        userId: profile?.id || '',
        createdAt: now,
        updatedAt: now,
      };

      responses.push(newResponse);
      fs.writeFileSync(this.responsesFile, JSON.stringify(responses, null, 2), 'utf-8');
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
      fs.writeFileSync(this.responsesFile, JSON.stringify(responses, null, 2), 'utf-8');
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
      fs.writeFileSync(this.responsesFile, JSON.stringify(filtered, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error deleting interview response:', error);
      throw error;
    }
  }
}

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

/**
 * Document Storage Manager for Electron
 * Handles Q&A document persistence
 */
export class DocumentStorage {
  private documentsDir: string;
  private documentsFile: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.documentsDir = path.join(userDataPath, 'documents');
    this.documentsFile = path.join(this.documentsDir, 'documents.json');

    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.documentsDir)) {
      fs.mkdirSync(this.documentsDir, { recursive: true });
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async getDocuments(): Promise<Document[]> {
    try {
      if (fs.existsSync(this.documentsFile)) {
        const data = fs.readFileSync(this.documentsFile, 'utf-8');
        const documents = JSON.parse(data);
        // Sort by last modified (most recent first)
        return documents.sort((a: Document, b: Document) =>
          new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        );
      }
      return [];
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }

  async getDocument(id: string): Promise<Document | null> {
    try {
      const documents = await this.getDocuments();
      return documents.find(d => d.id === id) || null;
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }

  async createDocument(data: { title: string; description?: string; questions?: DocumentQuestion[]; tags?: string[] }): Promise<Document> {
    try {
      const documents = await this.getDocuments();
      const now = new Date().toISOString();

      const newDocument: Document = {
        id: this.generateId(),
        userId: 'user-1', // Will be updated with actual user ID
        title: data.title,
        description: data.description,
        questions: data.questions || [],
        tags: data.tags || [],
        createdAt: now,
        updatedAt: now,
        lastModified: now,
      };

      documents.push(newDocument);
      fs.writeFileSync(this.documentsFile, JSON.stringify(documents, null, 2), 'utf-8');
      return newDocument;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    try {
      const documents = await this.getDocuments();
      const index = documents.findIndex(d => d.id === id);

      if (index === -1) {
        throw new Error('Document not found');
      }

      const updated: Document = {
        ...documents[index],
        ...data,
        id: documents[index].id,
        userId: documents[index].userId,
        createdAt: documents[index].createdAt,
        updatedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      documents[index] = updated;
      fs.writeFileSync(this.documentsFile, JSON.stringify(documents, null, 2), 'utf-8');
      return updated;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const documents = await this.getDocuments();
      const filtered = documents.filter(d => d.id !== id);
      fs.writeFileSync(this.documentsFile, JSON.stringify(filtered, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async searchDocuments(query: string): Promise<Document[]> {
    try {
      const documents = await this.getDocuments();
      const lowerQuery = query.toLowerCase();

      return documents.filter(doc =>
        doc.title.toLowerCase().includes(lowerQuery) ||
        doc.description?.toLowerCase().includes(lowerQuery) ||
        doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        doc.questions.some(q =>
          q.text.toLowerCase().includes(lowerQuery) ||
          q.response.toLowerCase().includes(lowerQuery)
        )
      );
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }
}
