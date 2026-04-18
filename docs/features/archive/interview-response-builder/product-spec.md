# Feature: Interview Response Builder

**Status**: Planned (types and service layer exist, no UI)  
**Last Updated**: 2026-02-14

## User Story

As a job seeker, I want to build interview responses by combining my STAR stories with common behavioral questions so that I have practiced, well-structured answers ready for interviews.

## Overview

The Interview Response Builder bridges the gap between stories and actual interview answers. Users select a common behavioral question, map one or more stories to it, and craft a polished response. The feature includes practice tracking so users know which responses they've rehearsed.

This is the core value proposition of Mockvue: turning raw experiences (stories) into ready-to-deliver interview answers.

## Acceptance Criteria

- [ ] View common behavioral interview questions (question bank)
- [ ] Select questions to prepare responses for
- [ ] Map stories to questions (one question can use multiple stories)
- [ ] Compose a response that weaves story elements together
- [ ] Mark responses as "practiced" after rehearsal
- [ ] View practice history and stats
- [ ] Search/filter responses by tag or question category
- [ ] AI-assisted response generation from mapped stories
- [ ] Export responses for review

## Key Components (To Be Created)

| Component | Path | Responsibility |
|-----------|------|----------------|
| InterviewPrepPage | `src/components/InterviewPrepPage.tsx` | Route-level page for response management |
| QuestionBank | `src/components/interview/QuestionBank.tsx` | Common question browser |
| ResponseBuilder | `src/components/interview/ResponseBuilder.tsx` | Compose response from stories |
| PracticeMode | `src/components/interview/PracticeMode.tsx` | Rehearsal interface with timer |

## Service Dependencies (Already Defined)

The service layer already supports this feature:

- `IUserService.getInterviewResponses()` — Fetch all responses
- `IUserService.createInterviewResponse(response)` — Create response
- `IUserService.updateInterviewResponse(id, response)` — Update response
- `IUserService.deleteInterviewResponse(id)` — Delete response
- `IUserService.getStories()` — Fetch stories for mapping
- `IAgentService.executeTask()` — AI-assisted response generation (future)

## Data Model (Already Defined)

```typescript
interface InterviewResponse {
  id: string;
  question: string;
  response: string;
  storyIds: string[];    // Links to Story objects
  tags: string[];
  isPracticed: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Question Categories

Suggested categories for the question bank:

| Category | Example Questions |
|----------|-------------------|
| Leadership | "Tell me about a time you led a team..." |
| Problem-Solving | "Describe a difficult problem you solved..." |
| Teamwork | "Give an example of successful collaboration..." |
| Conflict | "How did you handle a disagreement..." |
| Failure | "Tell me about a time you failed..." |
| Innovation | "Describe when you improved a process..." |
| Pressure | "How do you handle tight deadlines..." |

## Implementation Plan

1. Create question bank data (JSON or TypeScript constants)
2. Build `InterviewPrepPage` with question list and response list
3. Build `ResponseBuilder` with story selector and editor
4. Build `PracticeMode` with timer and self-rating
5. Integrate AI response generation
6. Add route to `App.tsx` and navigation links

## Success Metrics

- Users build 5+ responses on average
- 70%+ of responses are marked as practiced
- Story-to-response mapping covers 80%+ of stories
- AI-generated responses have > 4/5 user rating

## Design References

- See: `docs/product-specs/story-management.md` — Story data model
- See: `docs/product-specs/ai-assistant.md` — AI integration patterns
- See: `docs/FRONTEND.md` — UI patterns for new pages
