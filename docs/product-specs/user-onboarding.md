# Feature: User Onboarding

**Status**: Complete  
**Last Updated**: 2026-02-14

## User Story

As a first-time user, I want to be guided through setting up my profile, adding my resume, and creating initial interview stories so that I'm ready to start preparing for interviews immediately.

## Overview

The onboarding flow is a multi-step wizard that collects essential user information before granting access to the main application. It establishes the foundation for interview prep by requiring a minimum set of STAR-method stories. All protected routes redirect to onboarding until it is completed.

## Acceptance Criteria

- [x] Step 1 (Welcome): Collect name, target role, target company
- [x] Step 2 (Resume): Manual entry of work experience, education, skills
- [x] Step 3 (Stories): Create minimum 3 STAR-method stories
- [x] Step 4 (Completion): Welcome message with navigation to dashboard
- [x] Progress indicator showing current step
- [x] Step navigation (next/back) with validation
- [x] Cannot skip steps or proceed without required data
- [x] Onboarding completion persisted across sessions
- [x] Protected routes redirect to `/onboarding` if not completed
- [x] Works on Electron platform

## Key Components

| Component | Path | Responsibility |
|-----------|------|----------------|
| OnboardingFlow | `src/components/onboarding/OnboardingFlow.tsx` | Step orchestration, progress tracking |
| WelcomeStep | `src/components/onboarding/WelcomeStep.tsx` | Name, role, company form |
| ResumeUploadStep | `src/components/onboarding/ResumeUploadStep.tsx` | Resume data entry form |
| StoryCreationStep | `src/components/onboarding/StoryCreationStep.tsx` | STAR story creation |
| CompletionStep | `src/components/onboarding/CompletionStep.tsx` | Congratulations + navigation |

## Service Dependencies

- `IUserService.getUserProfile()` — Check onboarding status
- `IUserService.saveUserProfile(profile)` — Save profile data
- `IUserService.saveResume(resume)` — Save resume data
- `IUserService.createStory(story)` — Save each story
- `IUserService.completeOnboarding()` — Mark onboarding as done

## User Flow

```
App launch → check getUserProfile()
  ├── onboardingCompleted === true → Dashboard
  └── onboardingCompleted === false → /onboarding
       Step 1: Welcome → validates name + role → Next
       Step 2: Resume → add work/edu/skills → Next
       Step 3: Stories → create ≥3 stories → Next
       Step 4: Complete → click "Go to Dashboard" → /
```

## Validation Rules

| Step | Field | Rule |
|------|-------|------|
| Welcome | Name | Required, non-empty |
| Welcome | Target role | Required, non-empty |
| Welcome | Target company | Optional |
| Resume | Work experience | At least 1 entry recommended |
| Stories | Stories | Minimum 3 required |
| Stories | Each story | Title + at least Situation required |

## Success Metrics

- Onboarding completion rate: Target > 80%
- Average time to complete: < 15 minutes
- No data loss if user refreshes mid-flow
- Smooth step transitions

## Design References

- See: `docs/ONBOARDING_FEATURE.md` — Detailed feature documentation
- See: `docs/FRONTEND.md` — UI patterns and component styling
