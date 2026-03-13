# Design Decisions Index

**Last Updated**: 2026-03-13

This directory catalogs all architectural and design decisions made in the Mockvue project. Each decision includes the problem statement, chosen approach, rationale, and alternatives considered.

## Active Decisions

- [Core Beliefs](./core-beliefs.md) - Foundational principles guiding all development
- [Service Abstraction](./service-abstraction.md) - Cross-platform service layer architecture
- [Agent Foundation Architecture](./agent-foundation-architecture.md) - Reusable read-only assistant runtime inside the existing agent domain
- [Company Question Ingestion Architecture](./company-question-ingestion-architecture.md) - Scraper-heavy question ingestion with normalization and provenance
- [Voice Interview Architecture](./voice-interview-architecture.md) - Provider-agnostic voice session model with text fallback

## Decision Template

When adding a new design decision, use this template:

```markdown
# Design Decision: [Title]

**Status**: ✅ Current (verified YYYY-MM-DD)
**Author**: [name]

## Problem Statement
What problem are we solving?

## Decision
What did we decide?

## Rationale
Why did we choose this approach?

## Alternatives Considered
1. **[Alternative]**: Why it was rejected

## Implementation Requirements
- Specific implementation details

## Verification Status
- [ ] Implemented
- [ ] Documented
- [ ] Tests passing
```

## Superseded Decisions

_None yet._
