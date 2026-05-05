---
name: runtime-review
description: Deep performance and memory review using JS/TS runtime fundamentals. Identifies closure scope retention, unbounded collections, GC pressure, and memory leaks across server (Bun/Node) and browser (React/iOS Safari) runtimes. Uses a vertical sub-agent committee with peer review.
---

# Runtime & Memory Performance Review

Conduct a deep performance review of the codebase through the lens of JavaScript/TypeScript runtime fundamentals — closure scope retention, garbage collection behavior, memory pressure patterns, and platform-specific concerns (Bun/Node server-side, browser/iOS client-side).

## When to Use

- After significant feature work, before merging to main
- When investigating memory growth or GC pauses
- Periodic health checks on long-running services or mobile web apps
- After adding new `atomFamily`, `Effect.forkDaemon`, infinite queries, or module-level singletons

## Process

### Phase 1: Research Context

Before reviewing any code, research current JS engine behavior. Key reference material is in [js-runtime-fundamentals.md](js-runtime-fundamentals.md). Browse recent discussions on X/Twitter from engine developers (V8, JSC, SpiderMonkey teams) and TC39 delegates for the latest findings.

### Phase 2: Vertical Sub-Agent Committee

Launch 3 parallel review agents, each producing a scratchpad report file in `docs/research/performance/`:

| Vertical                 | Scope                                                         | Focus Areas                                                                                                                             |
| ------------------------ | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **V1: Server Runtime**   | All server-side code (Effect services, API routes, workers)   | Fiber lifecycle, daemon patterns, service singletons, module-level state, `Effect.forkDaemon` cleanup, JSON serialization               |
| **V2: Client Runtime**   | All browser-side code (React, Jotai atoms, hooks, components) | Atom family leaks, closure retention in hooks, infinite scroll accumulation, event listener cleanup, re-render cascades                 |
| **V3: Cross-Cutting JS** | Full monorepo — all apps and packages                         | Module-level singletons/Maps/Sets, timer `.unref()`, Promise patterns, string handling, array allocation hotspots, closure scope unions |

Each sub-agent should:

1. Read [checklist.md](checklist.md) for the full pattern checklist
2. Write findings to a separate scratchpad file (survives auto-compaction)
3. Categorize as CRITICAL / HIGH / MEDIUM / LOW / INFORMATIONAL
4. Never fabricate timing estimates — only structural code smells

### Phase 3: Consolidation & Peer Review

As lead reviewer:

1. Cross-reference findings between verticals (one agent's CRITICAL may be another's false positive)
2. Calibrate severity — downgrade when evidence shows patterns are intentional/bounded
3. Identify good patterns worth maintaining
4. Produce a consolidated report with priority table (P0/P1/P2)

### Phase 4: Implementation

Work through fixes in priority order. After each fix, suggest a granular commit.

## Reference Documents

- [checklist.md](checklist.md) — Full pattern checklist for each vertical
- [js-runtime-fundamentals.md](js-runtime-fundamentals.md) — JS engine GC behavior, closure internals, platform differences
- [prior-findings.md](prior-findings.md) — Findings from the first review session (2026-02-01) as calibration examples

## Severity Guide

| Severity          | Criteria                                                                            |
| ----------------- | ----------------------------------------------------------------------------------- |
| **CRITICAL**      | Unbounded growth proportional to user activity. Will cause OOM/crash in production. |
| **HIGH**          | Measurable waste but bounded by session/route lifecycle. Worth fixing.              |
| **MEDIUM**        | Theoretical concern or minor inefficiency. Fix if convenient.                       |
| **LOW**           | Code smell but negligible runtime impact.                                           |
| **INFORMATIONAL** | Intentional pattern, documented and bounded. No action needed.                      |

## Key Principle

Do not guess. Read the code. Trace the lifecycle. Check if cleanup exists. Many "leaks" are intentional singletons with bounded lifetime. The goal is to find **unbounded growth proportional to user activity** — everything else is secondary.
