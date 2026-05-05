# Review Protocol

## Overview

Every implementation must be reviewed by a **separate senior-engineer instance** before the implementer is dismissed. The lead does NOT perform reviews.

## Review Posture: Antagonistic by Default

Reviewers operate with an **antagonistic lens**. This is not about being hostile — it's about assuming every line of code is wrong until proven right. The goal is to catch bugs, regressions, and design flaws before they reach production.

**Reviewer mindset**:

- **Assume the code is wrong.** Read each change as if it contains a bug. Look for the bug. If you can't find one, look harder.
- **Assume the claimed correctness is unproven.** Compare implementation to the source of truth, not only to the plan or diary.
- **Question every line.** Why this approach and not an alternative? What edge case does this miss? What happens under load, concurrency, failure?
- **Trace execution paths.** Don't just read the diff — trace the full call chain. Check callers, check consumers, check what happens upstream and downstream.
- **Check what WASN'T changed.** The most dangerous bugs are in sibling code that should have been updated but wasn't. If a fix applies to WebMCP, does the same bug exist in MCP? In the browsing agent?
- **Verify claims.** If the diary says "no other callers," grep for it. If the diary says "backward compatible," check the type signature. Trust nothing — verify everything.
- **Validate evidence.** Tests, screenshots, fixtures, traces, and decision logs must exist and support the claimed review posture.
- **Treat static guarantees as correctness.** Type holes, unchecked casts, lint disables, and missing schema validation are correctness risks.
- **Treat documentation as collaboration infrastructure.** Major functions need useful TSDoc-style comments when behavior, lifecycle, side effects, return semantics, or invariants are not obvious.
- **Treat names as implementation surface.** Fixture paths, fixture payload values, test names/functions, implementation comments/doc comments, generated artifact names or comments, human-facing implementation docs, and commit-message suggestions must use domain/product language, not workstream IDs or titles. IDs belong only in required orchestration/bookkeeping artifact paths.
- **Treat git history as an artifact.** The staged patch or commit history must be small enough for humans and agents to replay intent.
- **Be specific.** Every finding must include `file:line`, the exact problem, and why it matters. Vague concerns are not actionable.

## Spawning the Reviewer

The reviewer receives:

1. **Review system prompt**: the project prompt named by the dispatch packet. For review-triage V0, use `docs/handover/review-triage/review-system-prompt.md`
2. **Domain skills**: Relevant skills for the vertical being reviewed (e.g., `/effect-services` for backend, `/jotai-state` for frontend atoms)
3. **The implementer's diary entry**: So the reviewer knows what was changed and why
4. **The dispatch packet**: ownership, files, dependencies, HITL state, artifact paths, review lanes, and non-goals
5. **The PRD/scoping artifact**: correctness target, source of truth, verifiability map, type/lint/documentation gates, commit plan, guardrails, evidence plan, decision-log rules
6. **The DoD checklist, dependency graph, HITL decision register, artifact conventions, review lanes, and evidence artifacts**
7. **The task's acceptance criteria**: From the original seed prompt
8. **Explicit antagonistic directive**: Always include "Be extra critical. Question every line. Assume the code is wrong until proven right."

Example reviewer seed prompt:

```
You are performing an ANTAGONISTIC code review of [TASK_ID]: [TASK_TITLE].
Be extra critical. Question every line. Assume the code is wrong until proven right.

Read the review system prompt at:
docs/handover/review-triage/review-system-prompt.md

Load these skills for domain context:
- /[relevant-skill]

Read the implementer's diary at:
docs/handover/[vertical]/diary/[diary-file].md

Read the implementation context bundle:
- Dispatch packet: docs/research/review-triage/workstreams/dispatch-packets/[task-id].md
- PRD/scoping artifact: docs/research/review-triage/workstreams/[task-id]/prd.md
- Dependency graph: docs/research/review-triage/workstreams/dependency-graph.md
- HITL decisions: docs/research/review-triage/workstreams/hitl-decisions.md
- DoD checklist: docs/research/review-triage/workstreams/dod-checklists.md
- Artifact conventions: docs/research/review-triage/workstreams/artifact-conventions.md
- Review lanes: docs/research/review-triage/workstreams/review-lanes.md

Then review all files listed in the diary. Write your review to:
docs/handover/[vertical]/reviews/[task-id]-review.md

Be harsh. If you find ANY critical or major issue, verdict MUST be REQUEST_CHANGES.
```

## Review Process

The reviewer should:

1. **Read the dispatch packet and PRD/scoping artifact** to understand ownership, boundaries, what correct means, where truth comes from, and what evidence is required.
2. **Read dependency graph and HITL decisions** to confirm the work was allowed to proceed and blocked decisions were not invented.
3. **Read the diary** to understand what was implemented.
4. **Read ALL modified/created files** listed in the diary — not just the diff, the full surrounding context.
5. **Validate dispatch scope** — files touched, non-goals, dependency boundaries, and output paths match the packet.
6. **Validate correctness evidence** — easy-to-verify slices have checks, proxy-verifiable slices use references, human-judgment slices are escalated, decision logs exist where needed.
7. **Validate DoD checklist** — required checks, artifacts, approvals, and waivers are present.
8. **Run `bunx tsc --noEmit -p <app>/tsconfig.json`** for every app with changed files — NEVER trust the engineer's claim that tsc passes. Verify independently.
9. **Run scoped lint/static checks** and verify type/lint gates from the PRD/scoping artifact.
10. **Audit type escapes** — changed `any`, broad `unknown`, unchecked casts, non-null assertions, and lint disables require explicit invariants.
11. **Audit major function docs** — exported, public, lifecycle-sensitive, security-sensitive, adapter, classifier, or non-obvious functions need useful TSDoc-style comments. Use `/Users/vinicius/code/devtools/devtools-frontend` as the reference bar.
12. **Audit implementation naming** — grep changed implementation/domain artifacts for the workstream ID, underscored ID, title, and slug. Fixture paths, fixture payloads, test names/functions, comments/doc comments, generated artifacts, implementation docs, and suggested commit messages must use domain/product concepts. Keep hits only in required orchestration/bookkeeping paths.
13. **Check git history or staging plan** — confirm changes are separable into granular, coherent commits and that suggested commit messages do not contain workstream IDs or titles.
14. **Check what WASN'T changed** — grep for sibling code that may have the same bug or need the same update.
15. **Use sub-agents** for vertical exploration when needed:
   - Type checking: `bunx tsc --noEmit` on affected packages
   - Pattern conformance: Compare against established patterns in adjacent files
   - Runtime analysis: Check for memory leaks, unbounded growth, cleanup gaps, race conditions
   - System design: Evaluate service boundaries, layer wiring, error handling
   - Sibling code: Search for the same pattern in other agent types, other services, other paths
16. **Run the redundancy/strictness checklist** (see below).
17. **Check against domain-specific checklist** (backend, frontend, MCP).
18. **Verify every claim in the diary** — don't trust assertions, confirm them.

## Redundancy and Strictness Checklist (Learned from Wave A)

These patterns caused multi-round review cycles. Check every one:

| # | Check | What to look for |
|---|-------|-----------------|
| 1 | **Correctness target mismatch** | Implementation satisfies the local code shape but not the source-of-truth outcome |
| 1a | **Dispatch scope breach** | Files, ownership, dependency boundaries, non-goals, or artifact paths differ from the dispatch packet without a logged decision |
| 1b | **HITL bypass** | A blocked human decision was silently resolved by the implementer, or a proposed default was used outside its allowed scope |
| 2 | **Evidence gap** | Claimed posture or correctness has no test, trace, fixture, screenshot, decision log, or reviewer artifact |
| 3 | **Verifier mismatch** | Easy-to-verify work lacks automated checks; human-judgment work was treated as automated; proxy references are weak |
| 4 | **Decision-log gap** | Agent made or likely made assumptions under uncertainty but did not log them |
| 5 | **Type/lint gate gap** | Typecheck/lint/static commands were skipped, failed, or weakened with unjustified escapes |
| 6 | **Unsafe type escape** | Changed `any`, broad `unknown`, unchecked cast, non-null assertion, or lint disable has no explicit invariant |
| 7 | **Missing major-function docs** | Public/exported/major function lacks documentation for non-obvious behavior, lifecycle, side effect, return, invariant, or footgun |
| 7a | **Workstream-name leakage** | Workstream ID/title/slug appears in implementation/domain artifacts instead of domain/product language. Grep for ID variants and titles. Required bookkeeping paths are the exception. |
| 8 | **Unreadable commit boundary** | Patch mixes unrelated behavior/mechanical changes in a way that blocks reliable human/agent review |
| 9 | **Catch→null→fallback chains** | Error handler catches and returns null/undefined → caller treats null as "no result" and triggers fallback/retry → hidden retry the task intended to remove |
| 10 | **Duplicate DB/API calls on "unified" paths** | Task says "unify X" but old call survives inside new wrapper. Grep for old function name in new code. |
| 11 | **In-memory store cleanup** | Maps/Sets/Refs added in closures must be cleaned on teardown, error paths, AND scope close — not only on initialization |
| 12 | **Endpoint protection carry-forward** | Expanded endpoint (e.g., claim now does cold-start) must inherit rate limits, auth checks from sibling endpoints |
| 13 | **Server/client constant alignment** | Thresholds, timeouts, policies shared across apps must match. Grep constant value in both server and client. |
| 14 | **Resource lifecycle matching** | `Effect.forkDaemon` = outlives parent scope. Session-scoped work should use `Effect.forkIn(sessionScope)`. |
| 15 | **Polling endpoint side effects** | Status/health poll endpoints calling shared helpers (e.g., `requireSession`) that touch activity timestamps, emit metrics, or hold locks |
| 16 | **Deprecated API surfaces** | Legacy methods marked deprecated or replaced: either fully removed (zero callers) or fully adapted. Half-removed shims are hidden traps. |
| 17 | **Optional chain into non-optional** | `foo?.bar` flowing into a type that requires `number` (not `number \| undefined`). Guard is upstream but TypeScript can't narrow through it. |
| 18 | **Missing imports after merge/edit** | Types/constants used but not imported — easy to miss when code is assembled from multiple changes |

## Review Output Format

```markdown
# Review: [TASK_ID] — [TASK_TITLE]

## Verdict: APPROVE or REQUEST_CHANGES

### Correctness Check

- Source of truth:
- Correctness target:
- Dispatch scope:
- Dependency/HITL status:
- DoD checklist:
- Review lane coverage:
- Type/lint/doc gates:
- Git history/staging:
- Verification evidence:
- Decision-log status:

### Findings

- [CRITICAL/MAJOR/MINOR/INFO] description (file:line) — why it matters

### Suggestions (non-blocking)

- description
```

## After the Review

### If REQUEST_CHANGES

1. Lead reads the review findings
2. Lead relays specific findings to the STILL-RUNNING implementer
3. Implementer patches the issues
4. Implementer reports back
5. Lead may re-run the reviewer or do a targeted check
6. Iterate until APPROVE

### If APPROVE

1. Implementer writes final diary/handover entry
2. Lead does quick sanity check (`bunx tsc --noEmit`, verify files exist, confirm dispatch scope, dependency/HITL state, scoped lint/static checks, DoD, decision log, and evidence artifacts)
3. Dismiss implementer
4. Dismiss reviewer
5. Lead presents summary to user

## Severity Definitions

| Severity       | Criteria                                                                                                                                         | Blocks Merge? |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| **Critical**   | Type errors, security issues, data loss risk, broken functionality, race conditions                                                              | YES           |
| **Major**      | Pattern violations, missing error handling, performance regressions, sibling code with same bug not fixed, log noise/spam, missing kill switches | YES           |
| **Minor**      | Style inconsistencies, naming, timing accuracy caveats, missing context in logs                                                                  | NO            |
| **Suggestion** | Nice-to-have improvements, future considerations                                                                                                 | NO            |

Correctness-specific severity:

- **Critical**: implementation contradicts source of truth, unsafe behavior is marked safe, required guardrail is missing, or high-risk behavior is unverifiable.
- **Major**: claimed evidence is absent or weak, human-judgment work was not escalated, decision-log rules were violated, or posture classification is misleading.
- **Major**: type/lint correctness is weakened by unjustified escapes, lint disables, or missing schema validation at a boundary.
- **Major**: missing TSDoc-style documentation for a major function can mislead future humans or agents.
- **Major**: commit boundaries are too tangled to support reliable review.

## What Makes a Good Antagonistic Review

**Good findings** (from real reviews in this project):

- "MCP agent has the exact same `_lastActivityRef` bug — not fixed" (checked sibling code)
- "`DbDirect` creates a SEPARATE pool with the same MAX, doubling per-instance connections" (traced downstream impact)
- "Every site emits Effect.logInfo + console.log for the same event — doubling log volume" (checked production impact)
- "`forkTimestamp` set before `spawnAgent`, not at the actual fork point — measurement includes spawn preamble" (traced execution order)

**Bad findings** (avoid these):

- "Consider using a different naming convention" (vague, no impact)
- "This could be refactored" (not actionable unless it causes a real problem)
- "I would have done this differently" (opinion without evidence of a bug)
