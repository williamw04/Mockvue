# Feature: Company Question Ingestion Pipeline

**Status**: Planned
**Last Updated**: 2026-03-13

## User Story
As a job seeker, I want Mockvue to surface company-specific interview questions so that I can practice against realistic prompts for my target companies and roles.

## Overview

This feature builds the ingestion pipeline for collecting, normalizing, and storing common interview questions by company, role, and stage. The product direction is intentionally scraper-heavy, but the implementation must still preserve provenance, source quality, and operational resilience.

The pipeline should support:
- source discovery
- source-specific extraction
- normalization into a canonical schema
- provenance tracking
- ranking and freshness metadata
- downstream reuse by behavioral and mock interview agents

## Goals

- Ingest company-specific questions at scale from multiple public sources
- Preserve source provenance and quality metadata for every question observation
- Normalize company names, roles, stages, and duplicate questions
- Feed a reusable question knowledge layer for later interview practice features

## Non-Goals

- Final interview simulator UX
- Voice execution
- Perfect legal/compliance automation beyond source policy labeling and operator review fields
- Human curation-only workflow as the main ingestion path

## Acceptance Criteria

- [ ] Source registry exists with source-specific scrape strategy metadata
- [ ] Normalized schema exists for companies, roles, questions, observations, and provenance
- [ ] Pipeline can ingest from at least one scraper-heavy source path and one safer editorial/open source path
- [ ] Duplicate question clustering is supported
- [ ] All records store source URL, source type, access method, and timestamps
- [ ] Extracted data can be queried by company and role
- [ ] Behavioral assistant can later consume normalized question data without schema changes

## MVP Source Strategy

- Scraper-heavy support for selected public web sources
- Preserve ability to mark high-risk sources separately
- Treat provenance as first-class; never flatten away original source observations

## Primary Consumers

- Behavioral Assistant
- Future Mock Interview Simulator
- Future company/role-tailored prep views

## Success Metrics

- Number of companies with normalized question coverage
- Number of unique question clusters per supported company
- Extraction success rate per source
- Duplicate clustering precision on sampled reviews

## Design References

- See: `docs/design-docs/company-question-ingestion-architecture.md`
- See: `docs/product-specs/agent-foundation.md`

## Implementation Notes

- Initial implementation should be isolated from core assistant runtime work
- Source adapters should be modular and independently testable
- Provenance and risk metadata are mandatory, not optional
