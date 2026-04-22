# Practice Tools — Product Specification

**Status**: Planned — prioritize after resume, stories, and prep surfaces are stable  
**Last Updated**: 2026-04-17  
**Canonical narrative**: [Feature Purposes § Practice Tools](../../FEATURE_PURPOSES.md#6-practice-tools)

## Summary

Multiple ways to rehearse: quick recall (flashcards), structured simulation, and eventually voice/AI mock interviews. Much of the **infrastructure** may exist without productized UI; this spec is the place to decide what ships first.

## Product intent (directional)

| Question | Answer |
|----------|--------|
| **Why it exists** | Preparation without rehearsal doesn’t convert to performance. |
| **Success for the user** | They can practice under increasing realism and get feedback tied to their stories. |
| **Success for the product** | Clear modality boundaries and shared data model with Core Stories / coaching. |

## Modalities (all TBD until prioritized)

1. **Flashcards** — Question → which story / key points.  
2. **Interview simulator** — Prompt, response capture, rubric or self-review.  
3. **AI mock interview** — Voice or text, follow-ups (depends on agent + provider choices).  

## Open questions (needs explicit product decisions)

- [ ] **First modality to ship**: One clear MVP (likely flashcards OR structured simulator).
- [ ] **Feedback**: Self-assessment only vs. AI scoring vs. rubric — privacy and cost implications.
- [ ] **Voice**: Product decision on provider, retention of recordings, and minimum UX.
- [ ] **Link to behavioral assistant**: How the existing agent prompt surfaces in UI (if at all).

## Current engineering notes

See [Feature Purposes](../../FEATURE_PURPOSES.md#6-practice-tools) for what types/services exist without UI. Re-validate against `src/services/interfaces.ts` before locking requirements.

## Acceptance criteria (placeholder)

Fill in after MVP modality is chosen.

- [ ] _TBD_

## See also

- [Feature index](../index.md)
