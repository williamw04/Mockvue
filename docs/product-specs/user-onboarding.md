# Feature: Resume Parsing & Import

**Status**: In Progress (Redefined from "User Onboarding")  
**Last Updated**: 2026-02-16

## User Story

As a user, I want to upload my resume (PDF or text) so that the application can extract my work history, skills, and education to auto-populate my profile.

## Overview

The "Onboarding" flow is now strictly a "Resume Import" flow. Instead of a multi-step wizard for manual entry, the user simply provides a resume. The system parses the text and populates the user profile. This is the single source of truth for the user's background.

## Acceptance Criteria

- [ ] Upload Resume (PDF or Plain Text support)
- [ ] Parse text content from the uploaded file
- [ ] Auto-populate "Work Experience", "Education", and "Skills" in the User Profile
- [ ] User review step: Allow user to edit extracted data before saving
- [ ] Save parsed data to `IUserService`
- [ ] Redirect to Dashboard upon completion

## User Flow

1.  **Welcome Screen**: "Import your resume to get started."
2.  **Upload**: Drag & drop or file picker.
3.  **Parsing**: Show loading state while processing.
4.  **Review**: Display extracted fields (Name, Roles, Skills). User confirms.
5.  **Complete**: Profile saved, redirect to Dashboard.

## Key Components

| Component | Responsibility |
|-----------|----------------|
| `ResumeUploadStep.tsx` | Main interface for file selection |
| `ResumeParserService` (New) | Logic to extract text and structure data |
| `ProfileReview.tsx` (New) | Form to edit parsed data before saving |

## Service Dependencies

- `IUserService.saveUserProfile(profile)`
- `IUserService.saveResume(resumeData)`
- `FileService.readFile(file)`

## Success Metrics

- Parsing accuracy > 80% (users don't need to rewrite everything)
- Time from upload to dashboard < 1 minute

