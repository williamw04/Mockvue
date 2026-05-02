import { ICoachingService } from '../interfaces';
import type {
  CoachingSessionData,
  CoachingGoal,
  CoachingGoalType,
  CoachingTodo,
  ChangeAlternative,
  StagedChange,
  AcceptedChange,
  ResumeVersion,
  Resume,
  ResumeAnalysis,
  CoachingUserProfile,
} from '../../types';

export class ElectronCoachingService implements ICoachingService {
  async getSessionData(sessionId: string): Promise<CoachingSessionData> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.coaching.getSessionData(sessionId);
  }

  async addGoal(sessionId: string, input: { type: CoachingGoalType; title: string; description: string; targetMetric?: string; targetValue?: number }): Promise<CoachingGoal> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.coaching.addGoal(sessionId, input);
  }

  async updateGoal(sessionId: string, goalId: string, updates: Partial<Pick<CoachingGoal, 'status' | 'progress' | 'currentValue' | 'completedAt'>>): Promise<CoachingGoal | null> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.coaching.updateGoal(sessionId, goalId, updates);
  }

  async addTodo(sessionId: string, input: { title: string; goalId?: string; description?: string; targetType?: string; targetId?: string; proposedBy: 'user' | 'agent' }): Promise<CoachingTodo> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.coaching.addTodo(sessionId, input);
  }

  async updateTodo(sessionId: string, todoId: string, updates: Partial<Pick<CoachingTodo, 'status' | 'completedAt'>>): Promise<CoachingTodo | null> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.coaching.updateTodo(sessionId, todoId, updates);
  }

  async proposeChange(sessionId: string, input: { todoId?: string; targetPath: string; targetType: string; operation: string; beforeValue: string; proposedValue: string; rationale: string; alternatives?: ChangeAlternative[] }): Promise<StagedChange> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.coaching.proposeChange(sessionId, input);
  }

  async acceptChange(sessionId: string, changeId: string, modification?: string): Promise<AcceptedChange | null> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.coaching.acceptChange(sessionId, changeId, modification);
  }

  async rejectChange(sessionId: string, changeId: string): Promise<StagedChange | null> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.coaching.rejectChange(sessionId, changeId);
  }

  async getPendingChanges(sessionId: string): Promise<StagedChange[]> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.coaching.getPendingChanges(sessionId);
  }

  async getChangeLog(sessionId: string): Promise<AcceptedChange[]> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.coaching.getChangeLog(sessionId);
  }

  async createVersion(sessionId: string, input: { label: string; trigger: string; resumeData: Resume; analysisData: ResumeAnalysis | null; score: number }): Promise<ResumeVersion> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.coaching.createVersion(sessionId, input);
  }

  async listVersions(sessionId: string): Promise<ResumeVersion[]> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.coaching.listVersions(sessionId);
  }

  async getUserProfile(): Promise<CoachingUserProfile> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.coaching.getUserProfile();
  }

  async updateUserProfile(updates: Partial<CoachingUserProfile>): Promise<CoachingUserProfile> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.coaching.updateUserProfile(updates);
  }

  async clearSessionData(sessionId: string): Promise<void> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    await window.electronAPI.coaching.clearSessionData(sessionId);
  }
}
