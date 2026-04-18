# Design Decision: Voice Interview Architecture

**Status**: ✅ Current (verified 2026-03-13)
**Author**: OpenCode

## Problem Statement

Mockvue needs a realistic voice interview simulator, but the system must remain provider-agnostic, support context injection, and degrade gracefully to text-only mode.

## Decision

Introduce a provider-agnostic voice interview abstraction that is separate from the core assistant runtime and separate from UI/audio transport.

### Core Architecture

- interview orchestration stays domain-level
- voice execution is handled through a dedicated voice interface
- transcripts and session artifacts remain app-owned, not vendor-owned
- text-only fallback is a first-class execution mode

## Recommended Layers

- interview orchestrator
- voice provider adapter
- transcript/session store
- UI transport/audio integration

## Rationale

- Hosted realtime providers will change over time
- Voice realism should not dictate the core session model
- Text-only fallback is essential for reliability, testing, and accessibility

## Execution Modes

- `realtime-s2s`
- `stt-llm-tts`
- `text-only`

These modes should share the same interview session abstraction.

## Alternatives Considered

1. **Directly couple to one vendor SDK in the renderer**
   - Rejected due to lock-in, secret handling, and brittle UI coupling.
2. **Ship self-hosted open voice stack first**
   - Rejected due to operational complexity for MVP.
3. **Voice-only without text fallback**
   - Rejected because it weakens reliability and debuggability.

## Implementation Requirements

- provider-agnostic `IVoiceInterviewService`-style abstraction
- session lifecycle and transcript model
- explicit support for prompt/context injection
- clear boundary between provider session state and app-owned session artifacts

## Verification Status

- [ ] Implemented
- [x] Documented
- [ ] Tests passing
