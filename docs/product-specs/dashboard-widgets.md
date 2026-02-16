# Feature: Dashboard Widgets

**Status**: Partial (UI exists with static data, real data integration pending)  
**Last Updated**: 2026-02-14

## User Story

As a job seeker, I want to see my interview preparation progress and upcoming tasks at a glance so that I stay motivated and know what to work on next.

## Overview

The Dashboard includes widget components for progress visualization and task management. Currently, these components render with hardcoded/static data. They need to be wired to real user data to provide meaningful insights.

## Acceptance Criteria

### Implemented (Static Data)
- [x] Progress chart visualization (circular/bar chart)
- [x] Daily tasks/calendar widget
- [x] Visual layout integrated into Dashboard

### Planned — Real Data Integration
- [ ] Progress chart reflects actual story count, response count, practice sessions
- [ ] Daily tasks pulled from user's preparation schedule
- [ ] Task completion tracking
- [ ] Streak tracking (consecutive days of practice)
- [ ] Weekly/monthly progress trends

### Planned — Interactive Features
- [ ] Create and manage daily tasks
- [ ] Set preparation goals
- [ ] Calendar integration for interview dates
- [ ] Reminder notifications for practice sessions

## Key Components

| Component | Path | Status |
|-----------|------|--------|
| ProgressChart | `src/components/ProgressChart.tsx` | UI complete, static data |
| DailyTasks | `src/components/DailyTasks.tsx` | UI complete, static data |

## Service Dependencies

Currently no service integration. Planned:

- `IUserService.getStories()` — Story count for progress
- `IUserService.getInterviewResponses()` — Response count, practice status
- New: `IUserService.getPreparationStats()` — Aggregated progress metrics
- New: `IUserService.getTasks()` / `createTask()` / `updateTask()` — Task management

## Data Requirements

### Progress Metrics (to calculate from existing data)
```typescript
interface PreparationStats {
  totalStories: number;
  totalResponses: number;
  practicedResponses: number;
  practiceRate: number;           // practicedResponses / totalResponses
  storyCoverage: number;          // stories mapped to responses / total stories
  lastPracticeDate: string;
  currentStreak: number;          // consecutive days
}
```

### Task Data (new model needed)
```typescript
interface PrepTask {
  id: string;
  title: string;
  type: 'practice' | 'create_story' | 'build_response' | 'custom';
  completed: boolean;
  dueDate: string;
  createdAt: string;
}
```

## Implementation Plan

1. Calculate progress stats from existing `IUserService` data
2. Replace hardcoded `progressStats` in ProgressChart with real data
3. Replace hardcoded events in DailyTasks with real tasks
4. Add task CRUD to `IUserService` interface
5. Implement task management UI in DailyTasks
6. Add streak and trend tracking

## Success Metrics

- Dashboard load time: < 500ms including widget data
- Users check dashboard daily (retention metric)
- Task completion rate: > 60%
- Progress visualization accuracy: 100% (reflects real data)

## Design References

- See: `docs/FRONTEND.md` — Card patterns, spacing conventions
- See: `docs/product-specs/story-management.md` — Story data for progress
- See: `docs/product-specs/interview-response-builder.md` — Response data for progress
