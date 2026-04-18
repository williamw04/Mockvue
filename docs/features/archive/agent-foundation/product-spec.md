# Feature: Agent Foundation

**Status**: Planned
**Last Updated**: 2026-03-13

## User Story
As a job seeker, I want Mockvue's assistants to answer from my actual resume, stories, and interview data so that resume coaching and behavioral coaching are grounded, reusable, and trustworthy.

## Overview

Mockvue currently exposes AI features through `IAgentService`, but the implementation is mostly a collection of specialized methods (`parseResume`, `analyzeResume`, `chatWithResume`, ATS checks) rather than a reusable agent runtime. This feature establishes the core read-only agent foundation for domain assistants.

The foundation will power at least two assistants:
- **Resume Assistant** — grounded in resume data, resume analysis, candidate profile, and ATS output
- **Behavioral Assistant** — grounded in stories, core story matches, and interview responses

This foundation reuses the existing service abstraction and normal agent loop surface instead of building a second execution engine.

## Goals

- Provide one reusable runtime for assistant turns and assistant sessions
- Keep assistants read-only except for agent-owned memory
- Separate canonical user data from assistant memory
- Ground responses in structured resume/story/interview data
- Reuse the same foundation for future scraper-fed company question knowledge and voice simulation

## Non-Goals

- General-purpose coding agent behavior
- File editing, shell execution, or repo mutation by assistants
- Full autonomous multi-agent orchestration in v1
- Voice transport and realtime audio in v1
- External company-question scraping in the core foundation work

## Acceptance Criteria

- [ ] `IAgentService` supports session-based assistant turns
- [ ] Assistants use only approved tools: resume retrieval/search + memory operations
- [ ] Resume data and assistant memory are stored separately
- [ ] Resume Assistant can answer from `Resume`, `ResumeAnalysis`, `CandidateProfile`, `coreStoryMatches`
- [ ] Behavioral Assistant can answer from `Story[]`, `InterviewResponse[]`, and resume-derived context
- [ ] Assistant memory supports save, lookup, summarize, and clear within allowed scope
- [ ] Assistant cannot edit files, run shell commands, or mutate user-authored career artifacts
- [ ] Existing `ResumeChat` can migrate onto the new foundation without user-visible regression

## Core Entities

- `ResumeDoc` — normalized read model assembled from canonical user data
- `ResumeFact` — flattened fact for retrieval
- `MemoryEntry` — assistant-owned stored memory
- `ContextSummary` — compact durable summary of prior session context
- `AgentSession` — runtime session state for assistant conversations

## Primary Surfaces

- `/resume-review` — Resume Assistant entry point
- `StoriesPage` — Behavioral Assistant entry point

## Success Metrics

- Assistant answers cite or reflect grounded resume/story data in >90% of evaluated turns
- Unsupported questions produce explicit evidence gaps rather than fabricated answers
- Session memory persists correctly across repeated turns
- Resume Assistant migration does not reduce current resume chat usability

## Design References

- See: `docs/design-docs/agent-foundation-architecture.md`
- See: `docs/product-specs/ai-agents.md`

## Implementation Notes

- Affected domain: `IAgentService`
- User data remains canonical in `IUserService`
- Agent memory uses a dedicated persistence layer
- Must follow service abstraction and Electron IPC security constraints
