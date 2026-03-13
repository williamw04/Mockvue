# Execution Plan: Company Question Ingestion

**Created**: 2026-03-13  
**Status**: Planned  
**Target**: Scraper-heavy normalized company-question knowledge pipeline

## Objective

Build a scraper-heavy ingestion pipeline that collects, normalizes, and stores company-specific interview questions with provenance for later assistant and simulator use.

## Working Model

- Work isolation: dedicated git worktree `question-ingestion-scraper`
- Do not redefine assistant contracts owned by foundation stream
- Consume stable normalized types and expose downstream-ready records

## Phase 0: Source Strategy And Contracts

### Deliverables
- product spec
- design decision doc
- execution plan
- source registry format
- normalized schema draft

### Initial Schema Targets
- `Company`
- `RoleProfile`
- `Question`
- `QuestionObservation`
- `SourceDefinition`
- `IngestionRun`

### Exit Criteria
- source registry and normalization contract agreed

## Phase 1: Source Registry And Fetch Layer

### Build
- source registry with metadata:
  - source name
  - discovery strategy
  - fetch strategy
  - risk label
  - parsing mode
- fetch pipeline abstraction
- retry and per-source failure isolation

### Exit Criteria
- pipeline can fetch raw content for at least one target source family

## Phase 2: Extraction And Normalization

### Build
- source-specific extractors
- company normalization
- role normalization
- question canonicalization
- observation persistence with provenance

### Exit Criteria
- extracted raw pages become normalized question observations

## Phase 3: Deduplication And Freshness

### Build
- duplicate clustering
- canonical question generation
- freshness timestamps
- source confidence / ranking metadata

### Exit Criteria
- company + role query returns clustered questions instead of raw duplicates

## Phase 4: Knowledge Access Layer

### Build
- downstream query API for assistants
- filters by company, role, stage, question type
- provenance-preserving outputs

### Dependency Rule
- this stream may expose a knowledge adapter contract, but must not modify voice-specific code

### Exit Criteria
- behavioral/question assistant can later query normalized question data without schema changes

## Phase 5: Hardening And Monitoring

### Tests
- extractor fixture tests per source
- normalization tests
- duplicate clustering tests
- provenance completeness tests
- failure isolation tests

### Operational Checks
- scrape success rate by source
- parse failure rate by source
- duplicate ratio

## Risks

- source breakage and anti-bot controls
- unstable DOM structures
- noisy duplicate content
- legal/policy risk for aggressive scraping

## Success Criteria

- normalized company-question coverage exists for initial target companies
- provenance is mandatory on every record
- scraper internals remain isolated from assistant runtime core
