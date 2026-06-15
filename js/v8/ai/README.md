# js/v8/ai/ — Monster AI Rebuild Package

**Worker 1 · 2026-06-12.** The data-driven, single-owner monster-AI architecture for Origami Dungeon.
**Status: isolated scaffold — imported by nothing, cannot affect the running game.** Wiring is a gated step.

## The model
**Utility-AI brain** per monster, on a **single-owner controller**, fed by **data-driven per-room affordances**,
biased by **Oni-Baba**. Not an LLM / neural net at runtime (those don't scale on kid hardware and aren't
debuggable). An LLM may *author* room JSON offline.

```
Director (Oni-Baba bias) ▸ Brain (UtilityBrain) ▸ Body (MonsterController + steering)
                                   ▲
                     Affordances from per-room JSON (the Sims "smart object" model)
```

## Files
| File | What |
|---|---|
| `MonsterAI.constructor.js` | the stack: `MonsterController` (single transform owner), `MonsterFSM` (one transition table), `AffordanceBank`, `UtilityBrain`, `MonsterAIConstructor` factory. Engine-agnostic. |
| `MonsterAI.engineAdapter.js` | the only file that knows Engine8 internals; bridges the constructor to real pathfinding/transforms/anim. |
| `rooms/cabaret.ai.json` | example per-room behavior script (data, not code). |

## Docs (in `knowledge/`)
| Doc | Covers |
|---|---|
| **`MONSTER_AI_V2_UPGRADE_COMPENDIUM_2026-06-15.md`** ⭐ | **CANONICAL (2026-06-15).** Code-verified current state + the 6-phase activation roadmap (P1-P6) for taking this rebuild live. Per-phase specs in `knowledge/monster_ai_v2/SPEC_P*.md`. Start here. |
| `MONSTER_AI_MASTER_COMPENDIUM_2026-06-12.md` | the whole picture: validated as-is truth, research, comparison, recommendation, phased roadmap (superseded as the live reference by the 2026-06-15 compendium) |
| `AI_REBUILD_01_ADAPTER_SPEC.md` | adapter method → Engine8 symbol map (file:line) + the one required extract |
| `AI_REBUILD_02_WIRING_GUIDE.md` | Phase-1 integration, one behavior at a time, validation gates, rollback |
| `AI_REBUILD_03_ROOM_SCRIPT_SCHEMA.md` | the per-room JSON schema + authoring + offline-LLM prompt |
| `AI_REBUILD_04_COMBAT_HOTFIX_PHASE0.md` | the chase-speed fix you can ship now |

## Build order (each gated on Mark's GO + a rendered check)
0. **Phase 0** — chase-speed hotfix (`AI_REBUILD_04`) + `_NO_FLEE` (done). Combat fun now.
1. **Phase 1** — land the constructor + adapter (no behavior change); migrate cabaret SPECTATE; kill the shake.
2. **Phase 2** — route IDLE/WANDER/GREET; retire idle-lookaround, greet-bow, `_crowdWatch`, `_furnitureUnstick`.
3. **Phase 3** — route HOSTILE; fold in chase speed permanently.
4. **Phase 4** — affordances + utility for all rooms → per-room programmable individuality.
5. **Phase 5** — per-monster memory/learning (the MASTER_INDEX "discovery nets").
6. **Phase 6** — Oni-Baba meta-director; offline-LLM room authoring.

## Anti-thrash rules (why this stops the hours-long flailing)
1. One owner per monster per frame (no competing rotation/anim writers). 2. One FSM transition table.
3. Behavior is data the engine consumes (no monolith edit per room). 4. Semantic clip binding, never `NlaTrack.NNN`.
5. Animation derived from real motion. 6. Audit before edit. 7. Validate on the rendered screen. 8. FPS is sacred.

## Honest status
Authored carefully; **not** executed (`node --check`) from the build environment — validate with
`node --check` (as `.mjs` or with `"type":"module"`) before wiring. Nothing here is imported by Engine8 yet.
