# Feature: Document Management

**Status**: Complete  
**Last Updated**: 2026-02-14

## User Story

As a job seeker, I want to browse, search, sort, and organize my Q&A documents so that I can quickly find and manage my interview prep materials.

## Overview

Document Management provides the primary document listing experience on the Dashboard. Users can view documents in grid or list mode, search by title, sort by various criteria, and create or delete documents. The Dashboard also integrates story counts, recent documents, and an interview prep banner.

## Acceptance Criteria

- [x] View all documents in a grid layout
- [x] Toggle between grid and list view modes
- [x] Search documents by title (real-time filtering)
- [x] Sort documents (most recent, oldest, by title)
- [x] Create new document (navigates to editor)
- [x] Delete document with confirmation
- [x] View document metadata (title, description, question count, last updated)
- [x] Click document card to open in editor
- [x] Recently opened documents tracking
- [x] Loading state while fetching documents
- [x] Empty state when no documents exist
- [x] Responsive grid (1 → 2 → 3 columns)
- [x] Works on both Electron and Web platforms

## Key Components

| Component | Path | Responsibility |
|-----------|------|----------------|
| Dashboard | `src/components/Dashboard.tsx` | Route-level page, search/sort/view state |
| DashboardDocumentCard | `src/components/DashboardDocumentCard.tsx` | Document card in dashboard context |
| DocumentGrid | `src/components/documents/DocumentGrid.tsx` | Grid/list layout with empty state |
| DocumentCard | `src/components/documents/DocumentCard.tsx` | Individual document preview card |
| RecentlyOpened | `src/components/RecentlyOpened.tsx` | Recently opened documents widget |

## Service Dependencies

- `IDocumentService.getDocuments()` — Fetch all documents
- `IDocumentService.createDocument(doc)` — Create new document
- `IDocumentService.deleteDocument(id)` — Delete document
- `IDocumentService.searchDocuments(query)` — Search (client-side filtering currently)
- `IUserService.getUserProfile()` — Display user name and story count
- `IUserService.getStories()` — Story count for dashboard stats

## Data Flow

```
Dashboard mount → getDocuments() → setState(documents)
                → getUserProfile() → setState(profile)
                → getStories() → setState(stories)

User searches → filter documents client-side → re-render grid
User sorts → sort documents client-side → re-render grid
User creates → createDocument() → navigate to /document/:id
User deletes → deleteDocument(id) → remove from state
```

## Success Metrics

- Document list loads in < 200ms (100 documents)
- Search filters in < 50ms (client-side)
- Create-to-edit navigation < 100ms
- Grid renders smoothly at all breakpoints

## Design References

- See: `docs/FRONTEND.md` — Grid layout, card patterns, empty states
- See: `docs/design-docs/service-abstraction.md` — Service layer pattern
