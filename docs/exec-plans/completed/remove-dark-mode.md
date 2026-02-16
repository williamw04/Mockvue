# Execution Plan: Remove Dark Mode & Softer White Theme

**Status**: Completed  
**Completed**: 2026-02-14

## Goal

Remove all dark mode functionality from the application and replace pure whites with a softer white aesthetic for a cleaner, more cohesive light-only design.

## Success Criteria

- [x] No `useTheme()` calls in active components
- [x] No `dark:` Tailwind prefixes in active components
- [x] No `theme === 'dark'` conditionals in active components
- [x] `ThemeProvider` removed from `main.tsx` render tree
- [x] Custom `surface` color (#fafbfc) added to Tailwind config
- [x] All page backgrounds use `bg-gray-100`
- [x] All card/panel backgrounds use `bg-surface`
- [x] Global CSS updated (body bg, scrollbar styles)
- [x] All documentation updated to reflect light-only design

## Files Modified

### Configuration
- `tailwind.config.js` — Added `surface: '#fafbfc'` custom color

### Entry Points
- `src/main.tsx` — Removed `ThemeProvider` wrapper
- `src/index.css` — Updated body background to `#f3f4f6`, light scrollbar styles

### App Shell
- `src/App.tsx` — Removed `dark:` prefixes from loading spinner

### Page Components (removed theme conditionals, updated bg classes)
- `src/components/Dashboard.tsx`
- `src/components/StoriesPage.tsx`
- `src/components/AIAssistant.tsx`
- `src/components/documents/DocumentPage.tsx`
- `src/components/documents/DocumentCard.tsx`
- `src/components/documents/DocumentGrid.tsx`
- `src/components/documents/QuestionItem.tsx`

### Feature Components
- `src/components/Sidebar.tsx`
- `src/components/ProgressChart.tsx`
- `src/components/DailyTasks.tsx`

### Onboarding Components
- `src/components/onboarding/OnboardingFlow.tsx`
- `src/components/onboarding/WelcomeStep.tsx`
- `src/components/onboarding/CompletionStep.tsx`
- `src/components/onboarding/ResumeUploadStep.tsx`
- `src/components/onboarding/StoryCreationStep.tsx`

### Documentation Updated
- `AGENTS.md` — Updated styling rules to light-only
- `cursor/rules/AGENTS.mdc` — Updated styling rules to light-only
- `docs/FRONTEND.md` — Full rewrite (v2.0.0) removing dark mode section, updating color palette, updating all code examples
- `ARCHITECTURE.md` — Marked ThemeToggle.tsx as deprecated
- `docs/ONBOARDING_FEATURE.md` — Removed dark mode mentions

## Dead Code (Can Be Deleted)

- `src/services/ThemeContext.tsx` — No longer imported
- `src/components/ThemeToggle.tsx` — No longer imported

## Design Decisions

**Why light-only**: Reduces code complexity, eliminates dual-class maintenance burden, and provides a more consistent visual experience. The app targets professional interview preparation — a clean, well-lit aesthetic suits the use case.

**Why `#fafbfc` for surface**: Slightly warmer than pure `#ffffff`, reduces eye strain while maintaining clear contrast against the `bg-gray-100` (#f3f4f6) page background. Creates a subtle card-lift effect without relying solely on shadows.

**`bg-white` retained for**: Semi-transparent overlays (`bg-white/30`, `bg-white/40`), and form inputs where maximum contrast aids readability.
