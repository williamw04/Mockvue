import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import type {
  CoachingGoal,
  CoachingGoalType,
  CoachingTodo,
  StagedChange,
  AcceptedChange,
  ResumeVersion,
  CoachingUserProfile,
  CoachingSessionData,
  ChangeAlternative,
} from '../internal-types';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface CoachingSnapshot {
  goals: Record<string, CoachingGoal[]>;
  todos: Record<string, CoachingTodo[]>;
  stagedChanges: Record<string, StagedChange[]>;
  changeLog: Record<string, AcceptedChange[]>;
  versions: Record<string, ResumeVersion[]>;
  userProfile: CoachingUserProfile;
}

const DEFAULT_USER_PROFILE: CoachingUserProfile = {
  writingPreferences: {},
  knownStrengths: [],
  knownWeaknesses: [],
};

export class CoachingStore {
  private readonly coachingDataDir: string;
  private readonly snapshotFile: string;
  private goals = new Map<string, CoachingGoal[]>();
  private todos = new Map<string, CoachingTodo[]>();
  private stagedChanges = new Map<string, StagedChange[]>();
  private changeLog = new Map<string, AcceptedChange[]>();
  private versions = new Map<string, ResumeVersion[]>();
  private userProfile: CoachingUserProfile;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.coachingDataDir = path.join(userDataPath, 'coaching-data');
    this.snapshotFile = path.join(this.coachingDataDir, 'coaching.json');
    this.userProfile = { ...DEFAULT_USER_PROFILE };
    this.ensureDirectories();
    this.load();
  }

  addGoal(sessionId: string, input: { type: CoachingGoalType; title: string; description: string; targetMetric?: string; targetValue?: number }): CoachingGoal {
    const now = new Date().toISOString();
    const goal: CoachingGoal = {
      id: makeId('goal'),
      sessionId,
      type: input.type,
      title: input.title,
      description: input.description,
      targetMetric: input.targetMetric,
      targetValue: input.targetValue,
      status: 'not_started',
      progress: 0,
      createdAt: now,
    };
    const existing = this.goals.get(sessionId) || [];
    existing.push(goal);
    this.goals.set(sessionId, existing);
    this.save();
    return goal;
  }

  updateGoal(sessionId: string, goalId: string, updates: Partial<Pick<CoachingGoal, 'status' | 'progress' | 'currentValue' | 'completedAt'>>): CoachingGoal | null {
    const sessionGoals = this.goals.get(sessionId);
    if (!sessionGoals) return null;
    const goal = sessionGoals.find(g => g.id === goalId);
    if (!goal) return null;
    Object.assign(goal, updates);
    this.save();
    return goal;
  }

  getGoals(sessionId: string): CoachingGoal[] {
    return this.goals.get(sessionId) || [];
  }

  addTodo(sessionId: string, input: { title: string; goalId?: string; description?: string; targetType?: string; targetId?: string; proposedBy: 'user' | 'agent' }): CoachingTodo {
    const now = new Date().toISOString();
    const todo: CoachingTodo = {
      id: makeId('todo'),
      sessionId,
      goalId: input.goalId,
      title: input.title,
      description: input.description,
      targetType: input.targetType as CoachingTodo['targetType'],
      targetId: input.targetId,
      status: 'pending',
      proposedBy: input.proposedBy,
      createdAt: now,
    };
    const existing = this.todos.get(sessionId) || [];
    existing.push(todo);
    this.todos.set(sessionId, existing);
    this.save();
    return todo;
  }

  updateTodo(sessionId: string, todoId: string, updates: Partial<Pick<CoachingTodo, 'status' | 'completedAt'>>): CoachingTodo | null {
    const sessionTodos = this.todos.get(sessionId);
    if (!sessionTodos) return null;
    const todo = sessionTodos.find(t => t.id === todoId);
    if (!todo) return null;
    Object.assign(todo, updates);
    this.save();
    return todo;
  }

  getTodos(sessionId: string): CoachingTodo[] {
    return this.todos.get(sessionId) || [];
  }

  proposeChange(sessionId: string, input: { todoId?: string; targetPath: string; targetType: string; operation: string; beforeValue: string; proposedValue: string; rationale: string; alternatives?: { id: string; value: string; label: string; predictedScore?: number }[] }): StagedChange {
    const now = new Date().toISOString();
    const change: StagedChange = {
      id: makeId('change'),
      sessionId,
      todoId: input.todoId,
      targetPath: input.targetPath,
      targetType: input.targetType as StagedChange['targetType'],
      operation: input.operation as StagedChange['operation'],
      beforeValue: input.beforeValue,
      proposedValue: input.proposedValue,
      rationale: input.rationale,
      alternatives: input.alternatives as ChangeAlternative[] | undefined,
      status: 'pending',
      createdAt: now,
    };
    const existing = this.stagedChanges.get(sessionId) || [];
    existing.push(change);
    this.stagedChanges.set(sessionId, existing);
    this.save();
    return change;
  }

  acceptChange(sessionId: string, changeId: string, modification?: string): AcceptedChange | null {
    const sessionChanges = this.stagedChanges.get(sessionId);
    if (!sessionChanges) return null;
    const change = sessionChanges.find(c => c.id === changeId);
    if (!change) return null;

    change.status = modification ? 'modified' : 'accepted';
    change.decidedAt = new Date().toISOString();

    const now = new Date().toISOString();
    const accepted: AcceptedChange = {
      id: makeId('accepted'),
      sessionId,
      stagedChangeId: change.id,
      targetPath: change.targetPath,
      beforeValue: change.beforeValue,
      afterValue: modification || change.proposedValue,
      decision: modification ? 'modified' : 'accepted',
      userModification: modification,
      createdAt: now,
    };

    const log = this.changeLog.get(sessionId) || [];
    log.push(accepted);
    this.changeLog.set(sessionId, log);
    this.save();
    return accepted;
  }

  rejectChange(sessionId: string, changeId: string): StagedChange | null {
    const sessionChanges = this.stagedChanges.get(sessionId);
    if (!sessionChanges) return null;
    const change = sessionChanges.find(c => c.id === changeId);
    if (!change) return null;

    change.status = 'rejected';
    change.decidedAt = new Date().toISOString();
    this.save();
    return change;
  }

  getPendingChanges(sessionId: string): StagedChange[] {
    const sessionChanges = this.stagedChanges.get(sessionId) || [];
    return sessionChanges.filter(c => c.status === 'pending');
  }

  getStagedChange(sessionId: string, changeId: string): StagedChange | null {
    const sessionChanges = this.stagedChanges.get(sessionId);
    if (!sessionChanges) return null;
    return sessionChanges.find(c => c.id === changeId) || null;
  }

  getChangeLog(sessionId: string): AcceptedChange[] {
    return this.changeLog.get(sessionId) || [];
  }

  createVersion(sessionId: string, input: { label: string; trigger: string; resumeData: unknown; analysisData: unknown; score: number }): ResumeVersion {
    const now = new Date().toISOString();
    const version: ResumeVersion = {
      id: makeId('version'),
      sessionId,
      label: input.label,
      trigger: input.trigger as ResumeVersion['trigger'],
      resumeData: input.resumeData,
      analysisData: input.analysisData,
      score: input.score,
      createdAt: now,
    };
    const existing = this.versions.get(sessionId) || [];
    existing.push(version);
    this.versions.set(sessionId, existing);
    this.save();
    return version;
  }

  listVersions(sessionId: string): ResumeVersion[] {
    return this.versions.get(sessionId) || [];
  }

  getVersion(versionId: string): ResumeVersion | null {
    for (const sessionVersions of this.versions.values()) {
      const found = sessionVersions.find(v => v.id === versionId);
      if (found) return found;
    }
    return null;
  }

  getUserProfile(): CoachingUserProfile {
    return this.userProfile;
  }

  updateUserProfile(updates: Partial<CoachingUserProfile>): CoachingUserProfile {
    this.userProfile = { ...this.userProfile, ...updates };
    if (updates.writingPreferences) {
      this.userProfile.writingPreferences = {
        ...this.userProfile.writingPreferences,
        ...updates.writingPreferences,
      };
    }
    this.save();
    return this.userProfile;
  }

  getSessionData(sessionId: string): CoachingSessionData {
    return {
      sessionId,
      goals: this.getGoals(sessionId),
      todos: this.getTodos(sessionId),
      stagedChanges: this.getPendingChanges(sessionId),
      changeLog: this.getChangeLog(sessionId),
      versions: this.listVersions(sessionId),
      userProfile: this.getUserProfile(),
    };
  }

  clearSessionData(sessionId: string): void {
    this.goals.delete(sessionId);
    this.todos.delete(sessionId);
    this.stagedChanges.delete(sessionId);
    this.changeLog.delete(sessionId);
    this.versions.delete(sessionId);
    this.save();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.coachingDataDir)) {
      fs.mkdirSync(this.coachingDataDir, { recursive: true });
    }
  }

  private load(): void {
    if (!fs.existsSync(this.snapshotFile)) {
      return;
    }

    try {
      const raw = fs.readFileSync(this.snapshotFile, 'utf-8');
      const snapshot = JSON.parse(raw) as CoachingSnapshot;

      this.goals = new Map(Object.entries(snapshot.goals || {}));
      this.todos = new Map(Object.entries(snapshot.todos || {}));
      this.stagedChanges = new Map(Object.entries(snapshot.stagedChanges || {}));
      this.changeLog = new Map(Object.entries(snapshot.changeLog || {}));
      this.versions = new Map(Object.entries(snapshot.versions || {}));
      this.userProfile = snapshot.userProfile || { ...DEFAULT_USER_PROFILE };

      console.log('[CoachingStore] Loaded from disk:', {
        goals: this.goals.size,
        todos: this.todos.size,
        stagedChanges: this.stagedChanges.size,
        versions: this.versions.size,
      });
    } catch (error) {
      console.error('[CoachingStore] Failed to load:', error);
    }
  }

  private save(): void {
    const toRecord = <T>(map: Map<string, T[]>): Record<string, T[]> => {
      const record: Record<string, T[]> = {};
      for (const [key, value] of map.entries()) {
        record[key] = value;
      }
      return record;
    };

    const snapshot: CoachingSnapshot = {
      goals: toRecord(this.goals),
      todos: toRecord(this.todos),
      stagedChanges: toRecord(this.stagedChanges),
      changeLog: toRecord(this.changeLog),
      versions: toRecord(this.versions),
      userProfile: this.userProfile,
    };

    try {
      fs.writeFileSync(this.snapshotFile, JSON.stringify(snapshot, null, 2), 'utf-8');
    } catch (error) {
      console.error('[CoachingStore] Failed to save:', error);
    }
  }
}
