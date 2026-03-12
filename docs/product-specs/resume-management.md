# Feature: Resume Management

**Status**: Partial (entry form exists in onboarding, ATS compatibility checks planned)  
**Last Updated**: 2026-03-10

## User Story

As a job seeker, I want to store and manage my resume data so that the app can use my experience, education, and skills to generate better interview responses and story suggestions. I also want to know if my resume will pass ATS (Applicant Tracking System) automated screening.

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

### Implemented (AI Features)
- [x] PDF resume upload and parsing via Gemini AI
- [x] Resume bullet quality analysis with impact scores
- [x] Trigger point identification for interview prep
- [x] Resume score display

### Planned — ATS Compatibility Checks
- [ ] **Single-Column Enforcement**: Detect multi-column layouts that cause data flattening
- [ ] **Standard Font Verification**: Check for ATS-compatible fonts (Arial, Calibri, Times New Roman, Garamond)
- [ ] **Standardized Headings**: Verify presence of "Professional Experience", "Education", "Skills" headings
- [ ] **Graphical Exclusion**: Detect images, graphics, and tables that ATS cannot parse
- [ ] **Reverse Chronological Order**: Verify dates are in proper chronological order

### ATS Compatibility Feature Specification

#### Implementation Approach
- Use **pdf-lib** for direct PDF analysis (font extraction, page structure)
- Combine with existing pdf-parse for text extraction and heading detection

#### ATS Checks

| Check | Algorithmic Trigger | Rationale |
|-------|-------------------|-----------|
| Single-Column | Text position analysis (left-to-right reading) | Prevents data flattening and chronological merging |
| Standard Fonts | Font name extraction via pdf-lib | Prevents ligature rendering errors and special character conversion |
| Standardized Headings | Regex section segmentation | Ensures ATS correctly categorizes experience vs education |
| Graphical Exclusion | Image/table object detection | Visual data cannot be read and corrupts text extraction |
| Reverse Chronology | Date parsing from extracted text | ATS prioritizes recent experience |

#### Scoring Algorithm
- Each check: 20 points (total 100)
- Pass: Full points
- Warning (partial): 10 points  
- Fail: 0 points
- ATS Score = Sum of all checks

#### User Interface
- Display in existing Resume Review flow (/resume-review)
- Show overall ATS Compatibility Score (0-100)
- Individual pass/fail/warning status for each check
- Specific recommendations for failed checks

### Planned — Standalone Resume Page
- [ ] Dedicated `/resume` route for viewing/editing resume
- [ ] Edit work experience outside of onboarding
- [ ] Add/remove education entries
- [ ] Manage skills list
- [ ] View resume in formatted layout

### Planned — File Upload
- [x] Upload PDF resume files
- [x] Parse uploaded resume to extract structured data
- [x] Map parsed data to work experience, education, skills fields
- [x] Store raw file for reference

### Planned — AI Integration
- [x] AI-suggested skills based on work experience
- [x] AI-generated resume summary
- [x] Story suggestions based on resume experiences

## Key Components

| Component | Path | Status |
|-----------|------|--------|
| ResumeUploadStep | `src/components/onboarding/ResumeUploadStep.tsx` | Complete (onboarding only) |
| ResumePage | `src/components/ProfilePage.tsx` | Complete (displays resume data) |
| ResumeReviewPage | `src/components/ResumeReviewPage.tsx` | For bullet analysis + ATS checks |
| ATS Analysis | `electron/parser.ts` | To be implemented |

## Service Dependencies

- `IUserService.getResume()` — Fetch stored resume
- `IUserService.saveResume(resume)` — Save resume data
- `IAgentService.analyzeResume()` — Resume bullet analysis (existing)
- `IAgentService.analyzeAtsCompatibility()` — ATS formatting checks (new)

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

interface ATSCheckResult {
  checkName: string;
  status: 'pass' | 'warning' | 'fail';
  score: number; // 0, 10, or 20
  details: string;
  recommendation?: string;
}

interface ATSAnalysisResult {
  overallScore: number; // 0-100
  checks: ATSCheckResult[];
  analyzedAt: string;
}
```

## Success Metrics

- Resume data completeness: > 80% of users have work experience + skills
- File upload parse accuracy: > 90% field extraction
- ATS compatibility score: > 80% (users who fix formatting issues)
- Time to update resume: < 2 minutes for edits

## Design References

- See: `docs/ONBOARDING_FEATURE.md` — Current resume entry implementation
- See: `docs/product-specs/user-onboarding.md` — Onboarding flow context
