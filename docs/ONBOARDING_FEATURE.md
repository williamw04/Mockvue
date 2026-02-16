# Onboarding Feature - Resume & Stories for Behavioral Interview Prep

## Overview

This feature transforms Mockvue into a behavioral interview prep tool. Users are now guided through an onboarding process where they add their resume and create behavioral interview stories using the STAR method (Situation, Task, Action, Result).

## Philosophy

**Stories are the foundation of great interview responses.** Rather than memorizing generic answers, this approach helps users:
- Build a library of real, detailed experiences
- Use the proven STAR method to structure stories
- Create authentic responses that can be adapted to various questions
- Practice and refine their storytelling skills

## Architecture

### New Data Types

```typescript
// User Profile - Tracks onboarding status and basic info
UserProfile {
  id, name, email, targetRole, targetCompany, onboardingCompleted
}

// Resume - Work experience, education, and skills
Resume {
  workExperiences[], education[], skills[], summary, rawText
}

// Story - STAR method stories
Story {
  title, situation, task, action, result, tags[], relatedExperienceId
}

// Interview Response - Built from stories
InterviewResponse {
  question, response, storyIds[], tags[], isPracticed
}
```

### Service Layer

**IUserService** - New service interface for user data operations:
- User profile management
- Resume storage
- Story CRUD operations
- Interview response management

Implemented for both:
- **Web**: Uses localStorage
- **Electron**: Uses file system storage

### Components

#### Onboarding Flow (`src/components/onboarding/`)

1. **WelcomeStep** - Collects user name, target role, and company
2. **ResumeUploadStep** - Manual resume entry (work experience, education, skills)
3. **StoryCreationStep** - STAR method story builder (requires minimum 3 stories)
4. **CompletionStep** - Welcome screen with next steps

#### StoriesPage (`src/components/StoriesPage.tsx`)

Full-featured story management:
- View all stories
- Edit existing stories
- Delete stories
- Create new stories
- STAR method structure with visual indicators

#### Updated Dashboard

Shows:
- Story count and quick access
- Recent stories
- Interview prep banner
- Original document features

### Routing & Protection

```typescript
// Routes
/onboarding - Complete setup process
/ - Dashboard (protected)
/stories - Story management (protected)
/document/:id - Document editor (protected)

// ProtectedRoute component redirects to /onboarding if not completed
```

## Key Features

### STAR Method Editor

Visual, structured editor with:
- Color-coded sections (S=Blue, T=Purple, A=Green, R=Orange)
- Character guidance and tips
- Tag system for categorizing stories
- Common question prompts

### Story Tags

Pre-defined tags help categorize stories:
- Leadership
- Problem-Solving
- Teamwork
- Communication
- Conflict Resolution
- Innovation
- Time Management
- Adaptability
- Customer Focus
- Technical Skills

### Minimum Viable Stories

Users must create at least **3 stories** during onboarding to ensure they have foundational content for interviews.

## User Flow

```
1. User launches app
2. Check if onboarding completed
   - No → Redirect to /onboarding
   - Yes → Show Dashboard
3. Onboarding Steps:
   a. Enter name and target role
   b. Add work experience and skills
   c. Create 3+ STAR stories
   d. Complete onboarding
4. Dashboard shows story library
5. Users can manage stories at /stories
6. Build interview responses from stories
```

## Storage

### Web (localStorage)

```javascript
mockvue_user_profile - User profile JSON
mockvue_resume - Resume data
mockvue_stories - Array of stories
mockvue_interview_responses - Array of responses
```

### Electron (File System)

```
userData/
  user-data/
    profile.json - User profile
    resume.json - Resume data
    stories.json - All stories
    responses.json - Interview responses
```

## Implementation Details

### Electron Backend

**`electron/storage.ts`**:
- Added `UserDataStorage` class
- Methods for all CRUD operations
- File-based persistence

**`electron/main.ts`**:
- IPC handlers for all user data operations
- Integrated with existing document handlers

**`electron/preload.ts`**:
- Exposed user data methods to renderer
- TypeScript definitions for all operations

### React Frontend

**Services**:
- `ElectronUserService` - Electron implementation
- `WebUserService` - Web implementation
- Integrated into service factory and context

**Components**:
- Responsive, modern UI
- Accessibility considerations
- Loading and error states

## Future Enhancements

### Planned Features

1. **Resume Upload** - PDF/DOC parsing
2. **AI Story Enhancement** - Suggestions to improve stories
3. **Mock Interview Mode** - Practice with common questions
4. **Response Builder** - Generate answers from stories
5. **Progress Tracking** - Track practiced questions
6. **Export Features** - Export stories to PDF/doc
7. **Story Templates** - Pre-built structures for common scenarios
8. **Audio Practice** - Record and playback responses

### Potential Improvements

- Story search and filtering
- Story analytics (most used, needs improvement)
- Peer review/sharing features
- Integration with job postings
- Company-specific question banks
- Video practice mode
- Interview scheduling integration

## Usage Tips for Users

1. **Be Specific**: Include numbers, metrics, and concrete details
2. **Focus on YOU**: Use "I" statements, not "we"
3. **Show Impact**: Always quantify results when possible
4. **Be Authentic**: Real stories are more memorable
5. **Practice Out Loud**: Don't just read, speak your stories
6. **Update Regularly**: Add new experiences as they happen
7. **Tag Thoroughly**: Makes finding relevant stories easier

## Technical Notes

- All stories use ISO 8601 timestamps
- UUIDs generated client-side for compatibility
- Backward compatible with existing document features
- No breaking changes to existing storage
- Progressive enhancement approach

## Testing Checklist

- [ ] Onboarding flow completion
- [ ] Story creation (STAR method)
- [ ] Story editing and deletion
- [ ] Dashboard story display
- [ ] Protected route redirects
- [ ] localStorage persistence (Web)
- [ ] File system persistence (Electron)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Error handling and validation

## Development

To work on onboarding features:

```bash
# Run in web mode
npm run dev

# Run in Electron mode
npm run electron:dev

# Build for production
npm run build
npm run electron:build
```

## Summary

This onboarding feature represents a fundamental shift in how Mockvue helps users prepare for interviews. By focusing on **stories as the building blocks** of great responses, users develop authentic, memorable answers backed by real experiences. The STAR method provides structure, while the tag system enables quick retrieval of relevant stories for any question.

The implementation is production-ready, fully typed, and integrates seamlessly with the existing application architecture.
