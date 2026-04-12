# Design Decision: Company Question Ingestion Architecture

**Status**: ✅ Current (verified 2026-03-13)
**Author**: OpenCode

## Problem Statement

Mockvue needs company-specific interview questions at scale. The chosen product direction is scraper-heavy, but the system must still preserve provenance, normalize data, and avoid tightly coupling scrape logic to assistant runtime logic.

## Decision

Build a modular ingestion pipeline with source adapters and a normalized storage model.

### Pipeline Stages

1. discovery
2. fetch
3. extract
4. normalize
5. deduplicate / cluster
6. persist with provenance

### Core Design Rules

- source adapters are isolated and independently testable
- normalized question data is separate from raw scrape artifacts
- provenance is mandatory for every observation
- assistant runtime consumes normalized outputs, not scraper internals

## Recommended Data Model

- `Company`
- `RoleProfile`
- `Question`
- `QuestionObservation`
- `SourceDefinition`
- `IngestionRun`

This supports canonical question clustering while preserving original source context.

## Rationale

- Keeps scraper-specific instability away from UI and assistant logic
- Makes it possible to blend risky and safer sources in one downstream model
- Supports later ranking, freshness scoring, and manual review without changing the schema

## Risk Posture

Because the product direction is scraper-heavy:
- source metadata must include access method and risk labeling
- ingestion failures must be isolated by source
- downstream assistants must rely on normalized data, not assume scraped text is authoritative

## Alternatives Considered

1. **Manual curation-first only**
   - Rejected for current product direction.
2. **Flat unstructured scraped text store**
   - Rejected because it makes deduplication, provenance, and reuse difficult.
3. **Embedding-first ingestion before normalization**
   - Rejected for v1 because predictable structured retrieval is more important than retrieval sophistication.

## Implementation Requirements

- Source registry with per-source metadata and extraction strategy
- Normalized question and provenance schema
- Duplicate clustering support
- Separate workstream from agent runtime foundation

## Verification Status

- [ ] Implemented
- [x] Documented
- [ ] Tests passing
