# Feature: Resume Parsing & Import

**Status**: Complete  
**Last Updated**: 2026-02-16

## User Story

As a user, I want to upload my resume (PDF) so that the application can extract my work history, education, projects, and skills to auto-populate my profile.

## Overview

The onboarding flow walks users through a 4-step wizard: Welcome → Resume → Stories → Completion. The Resume step combines **AI-powered PDF parsing** with **manual entry** on a single page. After parsing, the Stories step suggests AI-generated behavioral story matches.Uploading a PDF auto-fills the form fields, which the user can review and edit before saving.

## Acceptance Criteria

- [x] Upload resume PDF via native file picker
- [x] Parse text content using `pdf-parse` (Electron main process)
- [x] Extract structured data via Gemini 2.0 Flash (work experience, education, projects, skills)
- [x] Auto-fill manual entry form with parsed data
- [x] User can edit parsed data before saving
- [x] Store original PDF copy in app data directory
- [x] Save all resume data (experiences, education, projects, skills, raw text, PDF path, and AI core story matches) to `IUserService`
- [x] Profile page displays all stored resume data
- [x] New "Stories" step suggests top 3 AI matches to draft into the library
- [x] "Open PDF" button on Profile page opens stored resume with OS default viewer
- [x] Redirect to Dashboard upon onboarding completion

## User Flow

1. **Welcome Screen**: Brief intro to MockVue
2. **Resume Step** (single page):
   - **Top section**: "Quick Fill with AI" — file picker, Gemini API key input, Parse button
   - **Below**: Manual entry form (always visible) — auto-filled by parsing
   - User reviews, edits, and clicks Continue
3. **AI Stories Match Step**:
   - Presents top 3 AI-suggested behavioral core stories based on parsed achievements.
   - User can "Add Stories" or "Skip for now".
4. **Completion**: Profile saved, redirect to Dashboard

## Key Components

| Component | Responsibility |
|-----------|----------------|
| `OnboardingFlow.tsx` | 4-step wizard (Welcome → Resume → Stories → Completion) |
| `ResumeUploadStep.tsx` | Combined upload + manual entry interface |
| `CoreStoryMatchStep.tsx` | Presents top AI-matched behavioral stories |
| `ProfilePage.tsx` | Displays stored profile, experiences, projects, skills |
| `electron/parser.ts` | PDF text extraction + Gemini API parsing, including behavioral story mapping |
| `electron/main.ts` | IPC handlers for parse, save, open PDF |
| `electron/preload.ts` | `parseResume`, `openResumePdf` bridges |

## Service Dependencies

- `IUserService.saveUserProfile(profile)` — stores name, target role
- `IUserService.saveResume(resumeData)` — stores experiences, education, projects, skills, PDF path
- `IUserService.getResume()` — retrieves stored resume for Profile page
- `electronAPI.parseResume(filePath, apiKey)` — PDF extraction + Gemini parsing
- `electronAPI.openResumePdf(pdfPath)` — opens stored PDF with system viewer

## Technical Details

### Parser Pipeline
```
PDF File → pdf-parse (text extraction) → Gemini 2.0 Flash (structured JSON) → UI Form
```

### Data Stored
- `workExperiences[]` — company, position, dates, achievements
- `education[]` — school, degree, field, dates, GPA
- `projects[]` — title, description, role, technologies, URL
- `skills[]` — flat string array
- `coreStoryMatches[]` — AI generated mapping of experiences to behavioral traits
- `rawText` — extracted plain text from PDF
- `resumePdfPath` — path to copied PDF in app data

### API Key
- Gemini API key entered per-session in the Upload step
- Not stored permanently; sent directly to Google's generative AI endpoint

## Success Metrics

- Parsing accuracy > 80% (users don't need to rewrite everything)
- Time from upload to dashboard < 1 minute
