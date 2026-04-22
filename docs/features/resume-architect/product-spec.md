# Resume Architect — Product Specification

**Status**: Built; product boundaries still worth clarifying vs. coaching agent  
**Last Updated**: 2026-04-17  
**Canonical narrative**: [Feature Purposes § Resume Architect](../../FEATURE_PURPOSES.md#3-resume-architect)

## Summary

AI-assisted resume improvement: structured analysis (bullets, triggers, ATS-style checks), chat with tools, and a coaching workspace (goals, todos, staged changes, versions).

## Product intent (stable)

| Question | Answer |
|----------|--------|
| **Why it exists** | Users need concrete, actionable feedback on resume content and format, not generic tips. |
| **Success for the user** | They can see what’s weak, why it matters, and apply or reject specific edits with traceability. |
| **Success for the product** | Resume state, analyses, and version history stay in sync with `ICoachingService` / agent tools as defined in interfaces. |

## Scope (current understanding)

- Bullet-level analysis and rewrites  
- Trigger points (interview risk areas) with comfort ratings  
- ATS-oriented checks (algorithmic PDF/format signals)  
- Gemini agent with tool calling (single model, not a multi-agent pipeline)  
- Coaching workspace: goals, todos, staged changes, resume versions  

## Open questions (needs explicit product decisions)

- [ ] **ATS scope**: Which checks are “advisory” vs. “blocking” for any future gating UX?
- [ ] **Agent vs. manual**: Default path is chat-first, analysis-first, or context-dependent?
- [ ] **Trigger points → stories**: How tightly should triggers link to Core Stories and practice (if at all) in the near term?
- [ ] **Versioning**: What’s the user-facing story for snapshots (rollback, compare, export)?

## Acceptance criteria (draft)

- [ ] User can open their resume context and receive structured bullet feedback with suggested rewrites.
- [ ] User can accept/reject/modify proposed changes with outcomes reflected in persisted state.
- [ ] Goals/todos/versions behave consistently with service contracts (no silent data loss on refresh).
- [ ] UI matches [FRONTEND.md](../../FRONTEND.md) patterns for this product area.

## Related code / services (orientation)

- UI entry points: see `FEATURE_PURPOSES.md` “Key Files” section for component paths; verify in repo if moved.
- Agent runtime: `electron/agent/` (tools, prompts, stores).

## See also

- [Feature index](../index.md)
