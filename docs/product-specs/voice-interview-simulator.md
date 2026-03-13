# Feature: Voice Interview Simulator

**Status**: Planned
**Last Updated**: 2026-03-13

## User Story
As a job seeker, I want to practice interviews through a realistic voice-based interviewer so that I can rehearse under conversational pressure instead of only reading and typing responses.

## Overview

This feature adds the voice execution layer for mock interviews. The interviewer should sound realistic, stay in character, and receive structured context about the candidate, target role, company, and question plan. The architecture must remain provider-agnostic and degrade cleanly to text-only practice.

The initial focus is on:
- provider abstraction
- session model
- transcript and event model
- prompt/context injection
- text fallback path

## Goals

- Support realistic interviewer personas with explicit context injection
- Use a provider-agnostic service abstraction for realtime or chained voice flows
- Preserve text-only fallback for debugging, accessibility, and failure handling
- Reuse the same underlying career/question knowledge as other assistants

## Non-Goals

- Shipping a final polished practice UI in the first architecture phase
- Building a self-hosted open voice stack first
- Tightly coupling the system to a single voice vendor

## Acceptance Criteria

- [ ] Voice session abstraction exists with provider-agnostic lifecycle
- [ ] Text-only fallback path is supported by the same interview orchestration model
- [ ] Session context supports resume/profile/company/question injection
- [ ] Transcripts can be stored independently of provider session state
- [ ] Provider integrations are isolated behind a dedicated service interface
- [ ] Voice layer does not require scraper internals or mutate user artifacts directly

## MVP Provider Direction

- Hosted realtime provider first
- Text fallback required from day one
- Premium or research-grade voice renderers can be evaluated later

## Primary Consumers

- Future Mock Interview Simulator route
- Practice Mode and readiness scoring features

## Success Metrics

- Median end-to-end turn latency
- Session completion rate
- Transcript completeness
- User-rated realism of interviewer persona

## Design References

- See: `docs/design-docs/voice-interview-architecture.md`
- See: `docs/product-specs/ai-agents.md`
- See: `docs/product-specs/company-question-ingestion.md`

## Implementation Notes

- Voice execution should not block text-only interview workflows
- Provider session logic and UI/audio plumbing must stay separate
- Security model should avoid exposing secrets directly to renderer code where possible
