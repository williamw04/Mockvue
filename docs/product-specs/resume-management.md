# Feature: Resume Management

**Status**: Partial (entry form exists in onboarding, standalone features planned)  
**Last Updated**: 2026-02-14

## User Story

As a job seeker, I want to store and manage my resume data so that the app can use my experience, education, and skills to generate better interview responses and story suggestions.

## Overview

Resume Management currently exists as part of the onboarding flow where users manually enter work experience, education, and skills. The data is stored and accessible via `IUserService`, but there is no standalone resume management page or advanced features like file upload/parsing.

## Acceptance Criteria

### Implemented (via Onboarding)
- [x] Manual entry of work experiences (company, role, dates, description)
- [x] Manual entry of education (school, degree, dates)
- [x] Manual entry of skills
- [x] Resume summary text
- [x] Data persisted across sessions
- [x] Works on Electron platform

### Planned — Standalone Resume Page
- [ ] Dedicated `/resume` route for viewing/editing resume
- [ ] Edit work experience outside of onboarding
- [ ] Add/remove education entries
- [ ] Manage skills list
- [ ] View resume in formatted layout

### Planned — File Upload
- [ ] Upload PDF/DOC resume files
- [ ] Parse uploaded resume to extract structured data
- [ ] Map parsed data to work experience, education, skills fields
- [ ] Store raw file for reference

### Planned — AI Integration
- [ ] AI-suggested skills based on work experience
- [ ] AI-generated resume summary
- [ ] Story suggestions based on resume experiences

## Key Components

| Component | Path | Status |
|-----------|------|--------|
| ResumeUploadStep | `src/components/onboarding/ResumeUploadStep.tsx` | Complete (onboarding only) |
| ResumePage | `src/components/ResumePage.tsx` | Not yet created |

## Service Dependencies

- `IUserService.getResume()` — Fetch stored resume
- `IUserService.saveResume(resume)` — Save resume data

## Data Model

```typescript
interface Resume {
  workExperiences: WorkExperience[];
  education: Education[];
  skills: string[];
  summary: string;
  rawText: string;
}

interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}
```

## Success Metrics

- Resume data completeness: > 80% of users have work experience + skills
- File upload parse accuracy: > 90% field extraction (when implemented)
- Time to update resume: < 2 minutes for edits

## Design References

- See: `docs/ONBOARDING_FEATURE.md` — Current resume entry implementation
- See: `docs/product-specs/user-onboarding.md` — Onboarding flow context
