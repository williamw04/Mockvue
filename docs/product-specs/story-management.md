# Feature: Behavioral Core Stories (Story Management)

**Status**: Complete  
**Last Updated**: 2026-02-21

## User Story

As a job seeker, I want to create, edit, and organize my past experiences against a strict framework of the 10 most common behavioral story archetypes. I want AI to evaluate my resume and suggest which of my experiences best fit these 10 core stories so I have a well-rounded library of examples for interviews.

## Overview

Story Management has been upgraded from a generic list of stories to a **Behavioral Core Story Matrix**. There are 10 distinct "Core Story" competencies (e.g., Conflict, Failure, Leadership, Adaptability). 

During onboarding, the AI parses the user's resume, extracts experiences, and mathematically maps the best matches to these 10 categories, providing reasoning. The Core Stories page acts as a dashboard, showing which categories have drafted stories, which have pending AI suggestions, and which are empty. 

## Acceptance Criteria

- [x] Define a strict data model with the 10 Behavioral Core Categories.
- [x] AI Parser dynamically evaluates the candidate's parsed resume and generates `coreStoryMatches` with reasoning.
- [x] New Onboarding step presents top 3 AI story matches and allows 1-click drafting.
- [x] Display a 10-item grid interface ("The Matrix") on the Stories page.
- [x] Matrix cards show visual status (Drafted ✓, AI Suggestion ✨, or Empty !).
- [x] Selecting a card allows editing the STAR format.
- [x] If editing an AI suggestion, the AI's reasoning and the matched experience are pre-populated as context for the user to write their story.
- [x] Save stories to the database mapped to their specific category.

## Key Components

| Component | Path | Responsibility |
|-----------|------|----------------|
| CoreStoriesPage | `src/components/CoreStoriesPage.tsx` | Main 10-item matrix interface |
| CoreStoryMatchStep | `src/components/onboarding/CoreStoryMatchStep.tsx` | Onboarding AI suggestion review |
| Parser | `electron/parser.ts` | Extends resume parsing to evaluate core stories |

## Service Dependencies

- `IUserService.getStories()` — Fetch all user stories
- `IUserService.createStory(story)` — Create new STAR story
- `IUserService.updateStory(id, story)` — Update existing story
- `IUserService.getResume()` — Used to pull `coreStoryMatches` for the Matrix

## The 10 Core Competencies

1. **Conflict**: Disagreed with a peer/supervisor and resolved it.
2. **Failure**: A genuine mistake and what was learned.
3. **Leadership**: Took the lead to mobilize others.
4. **Adaptability**: Priorities shifted rapidly.
5. **Tight Deadline**: Overwhelmed and had to prioritize.
6. **Difficult Customer**: Handled a difficult stakeholder.
7. **Data-Driven Decision**: Made a choice with complex data.
8. **Above and Beyond**: Exceeded expectations intrinsically.
9. **Persuasion**: Used logic/rapport to convince a skeptic.
10. **Proudest Accomplishment**: Hero story highlighting their best work.

## Success Metrics

- Users have at least 5 of the 10 core stories drafted.
- High conversion rate (> 50%) of users accepting AI suggestions during onboarding.
- STAR sections are completely filled for drafted stories.
