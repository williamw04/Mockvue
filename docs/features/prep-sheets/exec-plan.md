# Execution Plan: Prep Sheets

**Created**: 2026-04-17
**Status**: Planned
**Target**: Replace Documents feature with structured Prep Sheets

## Objective

Build a structured prep sheet system that replaces the generic Document feature. Prep sheets are company-specific interview cheat sheets with 11 modular sections, autofilled from scraped data and job descriptions.

## Dependencies

- **Company Question Ingestion** — Scraper pipeline provides company data
- **Core Stories** — Story Bank references existing stories
- **Agent Runtime** — JD parsing uses Gemini

## Working Model

- Work isolation: focused on prep sheets, don't break existing features
- Scraper pipeline runs independently; prep sheets consume its output
- Existing Document components will be deprecated/replaced incrementally

## Phase 0: Type System Foundation

### Deliverables
- New `PrepSheet` type and all section types in `src/types.ts`
- New `IPrepSheetService` interface in `src/services/interfaces.ts`
- Deprecate `Document`, `DocumentQuestion`, `DocumentData` types (keep for migration)

### Tasks
1. Define `PrepSheet` interface with all 11 section fields
2. Define each section type (`CompanySnapshotSection`, `RoleBreakdownSection`, etc.)
3. Define `CreatePrepSheetInput`, `ScrapedCompanyData`, `ParsedJobDescription`
4. Define `IPrepSheetService` interface methods
5. Add `PrepSheetSectionId` union type
6. Mark old Document types with `@deprecated` comments

### Exit Criteria
- All types defined and TypeScript compiles
- `IPrepSheetService` interface complete

## Phase 1: Scraper Data Export

### Deliverables
- Export script that converts scraper SQLite to bundled JSON
- Bundled JSON file structure for top companies
- Electron service method to read bundled data

### Tasks
1. Create `tools/question-ingestion/scripts/export-bundle.ts`
2. Query `ingestion.db` for companies with most observations
3. Group observations by company into `ScrapedCompanyExport` format
4. Output to `electron/storage/scraped-data/companies.json`
5. Add `getScrapedCompanyData()` to `IPrepSheetService`
6. Implement in `ElectronPrepSheetService` (or keep in `ElectronUserService`)

### Exit Criteria
- `companies.json` exists with data for top 20+ companies
- Service method returns scraped data for a company name

## Phase 2: Prep Sheet Storage

### Deliverables
- File-based storage for prep sheets
- CRUD operations in `ElectronPrepSheetService`
- Migration script for existing Documents (optional)

### Tasks
1. Create `electron/storage/prep-sheets/` directory structure
2. Implement `createPrepSheet()` — writes JSON file
3. Implement `getPrepSheets()` — reads all sheets for user
4. Implement `getPrepSheet(id)` — reads single sheet
5. Implement `updatePrepSheet()` — updates JSON file
6. Implement `deletePrepSheet()` — removes file
7. IPC handlers for prep sheet operations
8. Update preload script with prep sheet API

### Exit Criteria
- Full CRUD works via IPC
- Prep sheets persist as JSON files

## Phase 3: JD Parsing Integration

### Deliverables
- Job description parsing via Gemini
- `ParsedJobDescription` output with role, skills, responsibilities

### Tasks
1. Add `parseJobDescription()` to `IPrepSheetService`
2. Use existing agent runtime to call Gemini
3. Parse JD text to extract structured fields
4. Return `ParsedJobDescription` with confidence scores
5. Handle parsing failures gracefully

### Exit Criteria
- JD paste in wizard returns parsed role/skills/responsibilities

## Phase 4: Creation Wizard UI

### Deliverables
- Modal-based creation wizard component
- Three-step flow: Company → Role → Sections
- Autofill from scraped data and JD parsing

### Tasks
1. Create `CreatePrepSheetModal.tsx` component
2. Step 1: Company selection with data preview
3. Step 2: JD paste with parsed preview
4. Step 3: Section toggle selection
5. Connect to `IPrepSheetService.createPrepSheet()`
6. Add "Create Prep Sheet" button to Dashboard
7. Replace "New Document" button

### Exit Criteria
- Wizard creates prep sheet with autofilled sections
- User can customize sections before creation

## Phase 5: Prep Sheet Editor UI

### Deliverables
- Main prep sheet editor page
- Section-specific editor components
- Tabbed or accordion navigation

### Tasks
1. Create `PrepSheetEditor.tsx` (replaces `DocumentPage.tsx`)
2. Create section editor components:
   - `CompanySnapshotEditor.tsx`
   - `RoleBreakdownEditor.tsx`
   - `StoryBankEditor.tsx` — references stories, adds per-sheet notes
   - `QuestionMappingEditor.tsx` — links questions to stories
   - `CompanyAlignmentEditor.tsx`
   - `StrengthsWeaknessesEditor.tsx`
   - `KeyTalkingPointsEditor.tsx`
   - `QuestionsForInterviewerEditor.tsx`
   - `TechnicalPrepEditor.tsx`
   - `LogisticsEditor.tsx`
   - `ReflectionEditor.tsx`
3. Create `PrepSheetCard.tsx` for list view
4. Update Dashboard to use `PrepSheetCard`
5. Update routing: `/prep-sheet/:id` instead of `/document/:id`

### Exit Criteria
- All 11 sections have working editors
- Save/load works for all sections
- List view shows prep sheets correctly

## Phase 6: Story Bank Integration

### Deliverables
- Story Bank section references existing stories
- UI to select/link stories from Core Stories feature
- Per-sheet notes for each linked story

### Tasks
1. `StoryBankEditor` reads from `useUser().getStories()`
2. Story selection UI (checkbox or drag-drop)
3. Per-sheet notes fields per linked story
4. Validate linked story IDs exist
5. Story changes in Core Stories propagate to prep sheets (reference, not duplicate)

### Exit Criteria
- User can link any existing story to a prep sheet
- Per-sheet notes saved independently

## Phase 7: Question Mapping Integration

### Deliverables
- Scraper questions populate Question Mapping section
- UI to link questions to stories
- Support manual question addition

### Tasks
1. `QuestionMappingEditor` loads questions from scraped data
2. Question list with story linking UI
3. Support multiple stories per question
4. Manual question add/edit/delete
5. Filter by question type (behavioral vs technical)

### Exit Criteria
- Scraped questions appear in Question Mapping
- User can link questions to stories

## Phase 8: Refresh Scraped Data

### Deliverables
- "Refresh Data" button in Company Snapshot section
- Runtime scraper trigger for fresh data
- Merge with existing sheet data (don't overwrite user edits)

### Tasks
1. Add `refreshScrapedData()` to service
2. Run scraper at runtime for single company
3. Merge strategy: keep user edits, add new scraped items
4. UI feedback during refresh (loading state)
5. Handle scraper failures gracefully

### Exit Criteria
- User can refresh company data from within a sheet
- User edits preserved after refresh

## Phase 9: Deprecate Old Documents

### Deliverables
- Old Document UI removed
- Existing documents migrated or deprecated
- Routes updated

### Tasks
1. Remove `DocumentPage.tsx`, `DocumentCard.tsx`, `DocumentGrid.tsx`
2. Remove `/document` and `/document/:id` routes
3. Remove `seedDocuments.ts` (use prep sheets instead)
4. Optional: migration script converts Documents to PrepSheets
5. Remove `IDocumentService` from service factory

### Exit Criteria
- Old document code removed
- App uses prep sheets exclusively

## Phase 10: Testing and Polish

### Tests
- Prep sheet CRUD tests
- JD parsing tests
- Story linking tests
- Question mapping tests
- Scraped data integration tests

### Polish
- Error handling for all operations
- Loading states for async operations
- Keyboard shortcuts for section navigation
- Undo/history for edits (optional)

## Risks

- JD parsing quality depends on Gemini output quality
- Scraper data may be noisy or incomplete for some companies
- Story bank references need validation (story deleted → what happens?)
- Migration from Documents may lose user data

## Success Criteria

- Users can create prep sheets in < 2 minutes with autofill
- Company Snapshot autofilled for top 50 companies
- Question Mapping populated with scraped questions
- Story Bank references work correctly
- Old document code removed