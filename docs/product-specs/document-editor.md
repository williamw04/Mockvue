# Feature: Document Editor

**Status**: Complete  
**Last Updated**: 2026-02-14

## User Story

As a job seeker, I want to create and edit Q&A documents with structured questions and responses so that I can prepare organized answers for behavioral interviews.

## Overview

The Document Editor is a rich, single-document editing experience built around a question-and-response format. It supports inline editing of titles and descriptions, expandable question items with drag-and-drop reordering, and auto-save functionality. This is the **canonical reference implementation** for Mockvue's UI patterns — all new features should match its look and feel.

## Acceptance Criteria

- [x] Create new documents with auto-generated title
- [x] Edit document title inline (transparent input styled as heading)
- [x] Edit document description inline
- [x] Add questions with editable text
- [x] Add responses to questions via expandable textarea
- [x] Expand/collapse individual questions (accordion pattern)
- [x] Drag-and-drop reorder questions via grip handle
- [x] Move questions up/down via chevron buttons
- [x] Delete individual questions with confirmation
- [x] Auto-save with 2-second debounce after any change
- [x] Manual save via button with loading state
- [x] Navigate back to dashboard
- [x] Loading spinner during document fetch
- [x] Works on both Electron and Web platforms

## Key Components

| Component | Path | Responsibility |
|-----------|------|----------------|
| DocumentPage | `src/components/documents/DocumentPage.tsx` | Route-level editor page, state management, auto-save |
| QuestionItem | `src/components/documents/QuestionItem.tsx` | Individual Q&A item with drag-and-drop, expand/collapse |

## Service Dependencies

- `IDocumentService.getDocument(id)` — Load existing document
- `IDocumentService.createDocument(doc)` — Create new document
- `IDocumentService.updateDocument(id, doc)` — Save changes
- `INotificationService.showSuccess/showError()` — Save feedback

## UI Patterns Defined Here

These patterns are extracted from the document editor and should be reused project-wide:

- **Inline editable title**: `<input>` with `bg-transparent border-none focus:outline-none`
- **Accordion items**: Click-to-expand with `ChevronDown`/`ChevronRight` toggle
- **Drag-and-drop**: `react-dnd` with `HTML5Backend`, `GripVertical` handle icon
- **Auto-save**: `useEffect` + `setTimeout` with 2-second debounce
- **Page layout**: `min-h-screen bg-gray-100 py-8 px-4` with `max-w-3xl mx-auto`
- **Card container**: `bg-surface rounded-2xl shadow-lg p-6`

## Success Metrics

- Document save latency: < 100ms
- Auto-save debounce: 2 seconds after last keystroke
- No data loss on navigation (auto-save triggers before unmount)
- Drag-and-drop reorder feels smooth (no layout shift)

## Design References

- See: `docs/FRONTEND.md` — Full design system derived from this feature
- See: `docs/RELIABILITY.md` — Auto-save and error handling patterns
