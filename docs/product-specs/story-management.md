# Feature: Story Management

**Status**: ⛔️ BLOCKED (Waiting for Resume Parsing)  
**Last Updated**: 2026-02-16

> [!WARNING]
> This feature is **blocked** until the Resume Parsing & Import feature is fully implemented. We will redefine "Story Management" based on the data extracted from resumes.


## User Story

As a job seeker, I want to create, edit, and organize STAR-method stories from my career experiences so that I have a library of real examples ready for any behavioral interview question.

## Overview

Story Management provides a dedicated page for managing behavioral interview stories using the STAR method (Situation, Task, Action, Result). Users build a library of tagged stories that can later be mapped to common interview questions. Stories are the foundational data model for Mockvue's interview prep approach.

## Acceptance Criteria

- [x] View all stories in a list with titles and tags
- [x] Select a story to view full STAR details
- [x] Create new stories with STAR structure
- [x] Edit existing stories inline
- [x] Delete stories with confirmation
- [x] Tag stories with predefined categories
- [x] Color-coded STAR sections (S=Blue, T=Purple, A=Green, R=Orange)
- [x] Character guidance and tips for each section
- [x] Common question prompts to inspire story creation
- [x] Works on Electron platform

## Key Components

| Component | Path | Responsibility |
|-----------|------|----------------|
| StoriesPage | `src/components/StoriesPage.tsx` | Full story management interface |

## Service Dependencies

- `IUserService.getStories()` — Fetch all stories
- `IUserService.getStory(id)` — Fetch single story
- `IUserService.createStory(story)` — Create new story
- `IUserService.updateStory(id, story)` — Update existing story
- `IUserService.deleteStory(id)` — Delete story
- `INotificationService.showSuccess/showError()` — Operation feedback

## STAR Method Structure

Each story contains four structured sections:

| Section | Purpose | Color | Guidance |
|---------|---------|-------|----------|
| Situation | Set the context | Blue | What was the background? What challenge existed? |
| Task | Define your role | Purple | What was your specific responsibility? |
| Action | Describe what you did | Green | What steps did you take? Be specific. |
| Result | Share the outcome | Orange | What was the impact? Quantify if possible. |

## Available Tags

Leadership, Problem-Solving, Teamwork, Communication, Conflict Resolution, Innovation, Time Management, Adaptability, Customer Focus, Technical Skills

## Success Metrics

- Users create 5+ stories on average
- Stories are tagged (>80% have at least 1 tag)
- STAR sections are filled (>90% have all 4 sections)
- Edit/save latency < 100ms

## Design References

- See: `docs/ONBOARDING_FEATURE.md` — Story creation during onboarding
- See: `docs/FRONTEND.md` — Card patterns and accent colors
