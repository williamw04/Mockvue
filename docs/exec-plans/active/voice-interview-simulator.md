# Execution Plan: Voice Interview Simulator

**Created**: 2026-03-13  
**Status**: Planned  
**Target**: Provider-agnostic voice interview execution layer with text fallback

## Objective

Build the architecture and initial implementation path for a realistic voice-based interview simulator that can inject role/company/candidate context while preserving a text-only fallback.

## Working Model

- Work isolation: dedicated git worktree `voice-simulator-rnd`
- Do not take ownership of shared assistant contracts owned by foundation stream
- Consume normalized company questions from ingestion stream later through stable knowledge APIs

## Phase 0: Voice Session Contracts

### Deliverables
- product spec
- design decision doc
- execution plan
- proposed `IVoiceInterviewService` contract
- transcript/session/event schemas

### Exit Criteria
- provider-agnostic session lifecycle agreed

## Phase 1: Interview Orchestration Layer

### Build
- text-first interview orchestration model
- context injection contract:
  - candidate profile
  - resume summary
  - target role
  - company
  - question plan
- transcript model independent of provider SDK state

### Exit Criteria
- text-only path can drive interview turns deterministically

## Phase 2: Voice Provider Abstraction

### Build
- provider adapter interface
- session connect / pause / resume / interrupt / end lifecycle
- provider-agnostic event model

### Direction
- hosted realtime provider first
- preserve ability to swap providers later

### Exit Criteria
- one provider adapter works behind the abstraction

## Phase 3: Electron Integration

### Build
- service interface and Electron implementation
- secure token/session handling strategy
- renderer-safe audio/session bridge

### Exit Criteria
- Electron app can start a provider-backed session without coupling UI to provider SDK

## Phase 4: Text Fallback And Reliability

### Build
- text-only fallback mode
- transcript persistence
- graceful downgrade on provider/network failure

### Exit Criteria
- practice flow still works when voice transport is unavailable

## Phase 5: Evaluation And Hardening

### Tests
- session lifecycle tests
- transcript capture tests
- fallback tests
- provider adapter contract tests

### Metrics
- turn latency
- transcript completeness
- interruption handling success

## Risks

- provider lock-in if abstraction leaks SDK details
- renderer audio edge cases in Electron
- high operational cost for realtime sessions
- brittle coupling if interview orchestration and voice transport are not kept separate

## Success Criteria

- text-only and voice-backed sessions share one interview orchestration model
- provider-specific code is isolated
- session transcripts remain app-owned artifacts
