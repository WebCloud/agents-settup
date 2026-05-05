---
name: team-orchestration
description: Workflow orchestration for multi-agent development. Defines lead role boundaries, engineer delegation, mandatory review protocol, task tracking, seed prompt composition, diary/handover conventions, and parallelization strategy. Load this skill at session start when coordinating implementation work across teammates.
---

# Team Orchestration Workflow

The lead coordinates engineers and reviewers through a structured protocol. The lead NEVER implements, reviews code, or fixes errors directly. All implementation goes to teammates; all reviews go to a separate reviewer instance.

## Companion Skill For Scoping

For ambiguous, multi-step, high-impact, agentic, or parallel work, load `/workstream-scoping` before dispatching implementers unless a complete scoping bundle already exists.

`/workstream-scoping` is a preparation skill, not an implementation skill. Once PRDs and dispatch artifacts exist, implementation agents consume those artifacts directly. Do not ask implementers or reviewers to re-run `/workstream-scoping` unless the user explicitly asks to re-scope the workstream.

The scoping phase defines:

- correctness target
- source-of-truth clarity
- verifiability map
- verification methods and definition of done
- decomposition into smaller verifiable task slices
- type/lint/documentation correctness gates
- granular git history plan
- guardrails and allowed action space
- dependency graph
- HITL decision register
- dispatch packet
- artifact conventions and exact output paths
- review lanes
- decision-log rules
- evidence plan
- review posture

Do not treat a plan as complete until the correctness target, verification path, dependency/HITL state, and artifact paths are explicit. If source-of-truth is missing or contradictory, either ask the user or record the assumption as a decision-log item before implementation.

## Lead Role

**Coordinator, NOT implementer or reviewer.**

| Lead DOES                                                     | Lead DOES NOT                               |
| ------------------------------------------------------------- | ------------------------------------------- |
| Hold plan context, compose seed prompts                       | Write implementation code                   |
| Track phases, manage task dependencies                        | Perform code reviews                        |
| Proxy between teammates and user                              | Fix tsc errors or lint issues               |
| Present summary for user validation                           | Skip the review step                        |
| Quick sanity checks (`bunx tsc --noEmit`, verify files exist) | Dismiss implementer before review completes |
| Relay reviewer findings to implementer with full context      | Soften or filter reviewer findings          |
| Question uncertainty — escalate to user when in doubt         | Assume something is fine without checking   |
| Maintain correctness, evidence, and decision-log artifacts    | Collapse the workstream into chat-only state |

## Team Roles

### Implementing Engineers (senior-engineer)

- Receive seed prompts with: skills to load, files to modify, acceptance criteria
- Receive the implementation context bundle: dispatch packet, PRD/scoping artifact, dependency graph state, HITL decisions, DoD checklist, review lanes, artifact conventions, exact diary/evidence/decision-log paths, correctness target, source of truth, verifiability map, type/lint/documentation gates, commit plan, guardrails, evidence plan
- Write diary entries documenting changes, decisions, issues
- Write decision-log entries when they proceed through uncertainty instead of blocking
- Stay running through the review loop for potential patches
- Use `bun`/`bunx` — never `npm`/`npx`

**Mandatory verification before reporting done:**
- Run `bunx tsc --noEmit -p <app>/tsconfig.json` for EVERY app with changed files — not repo-wide, per-app
- Run the scoped lint/static-analysis commands for every changed app/package
- Preserve type-system correctness: no `any`, broad `unknown`, unchecked casts, non-null assertions, or lint disables unless the scoping artifact permits them or the diary records the invariant that makes them safe
- Add TSDoc-style comments for public, exported, major, lifecycle-sensitive, security-sensitive, adapter, classifier, or non-obvious functions. Follow the DevTools frontend style: document behavior, invariants, return semantics, side effects, and footguns rather than restating the signature.
- Keep changes stageable into the scoped granular commit plan. Do not mix mechanical formatting, behavior, tests, and docs when they can be separate coherent commits.
- Use domain/product concepts for implementation names. Workstream IDs or titles must not appear in fixture paths, fixture payload domain values, test names/functions, implementation comments/doc comments, generated artifact names or comments, human-facing implementation docs, or suggested commit messages. Keep IDs only where orchestration/bookkeeping artifact conventions require them, such as PRD, handover, evidence, diary, review, and task paths.
- When replacing/unifying a flow, grep ALL callers of the old flow and update or remove them
- When adding or expanding an endpoint's capabilities, check sibling endpoints for protections (rate limits, auth) that must carry forward
- In-memory stores (Maps, Sets, Refs) MUST have cleanup in the teardown/close path — not just on fresh start
- Effect.forkDaemon vs Effect.forkIn — match resource lifecycle to the entity it serves (session-scoped work → forkIn(sessionScope))
- Constants/thresholds shared between server and client MUST be cross-checked for alignment
- Never use optional chaining (`?.`) when the result flows into a non-optional type — use non-null assertion with a comment explaining the guard, or default with `?? 0`
- Error catch blocks must produce structured outcomes, never null/undefined that silently triggers hidden fallback paths

### Reviewers (separate senior-engineer, antagonistic)

- Operate with an **antagonistic lens** — assume the code is wrong until proven right
- Receive the review context bundle: project review system prompt, dispatch packet, PRD/scoping artifact, implementer diary, evidence artifacts, decision log, DoD checklist, review lane definition, relevant domain skills, and explicit antagonistic directive
- **Question every line of code** — trace full execution paths, not just the diff
- **Check what WASN'T changed** — sibling code, parallel agent types, shared interfaces
- **Verify every diary claim** — grep, trace types, confirm backward compatibility
- Use sub-agents for vertical exploration (type checking, pattern conformance, runtime analysis, sibling code search)
- Write review to `reviews/task-X.Y-review.md`
- Verdict: APPROVE or REQUEST_CHANGES — ANY critical or major finding forces REQUEST_CHANGES
- Every finding MUST include `file:line`, the exact problem, and WHY it matters
- No timing estimates — structural analysis only

### Design Engineers

- ALWAYS load `/interface-craft` and `/web-design-guidelines` skills
- Handle all UI/motion/animation code changes
- Lead never does frontend implementation directly

## Mandatory Task Execution Protocol

**12 steps. Do NOT skip any.**

1. **Scope correctness** using `/workstream-scoping` when the task is non-trivial and no complete scoping bundle already exists.
2. **Create or update a scoping bundle** with PRD/scoping artifact, dependency graph, HITL decision register, dispatch packet, artifact conventions, DoD checklist, review lanes, correctness target, source-of-truth clarity, verifiability map, verification methods, type/lint/documentation gates, verifiable decomposition, granular commit plan, guardrails, evidence plan, and review posture.
3. **Spawn implementing teammate** with seed prompt + dispatch packet + PRD/scoping artifact + dependency/HITL status + exact artifact paths.
4. **Teammate implements** and reports back with diary, evidence artifacts, and decision log.
5. **Spawn reviewer** (separate instance) with the project `review-system-prompt.md`, dispatch packet, PRD/scoping artifact, DoD checklist, review lanes, diary, evidence artifacts, and decision log — BEFORE dismissing implementer. Always include the antagonistic directive: _"Be extra critical. Question every line. Assume the code is wrong until proven right. If you find ANY critical or major issue, verdict MUST be REQUEST_CHANGES."_
6. **Reviewer writes review** to `reviews/task-X.Y-review.md`, validating both implementation and correctness evidence.
7. **If REQUEST_CHANGES** — lead relays findings to the STILL-RUNNING implementer for patches. Relay the EXACT findings, not a summary. Iterate until APPROVE.
8. **If APPROVE** — implementer writes final diary/handover entry.
9. **Lead does quick sanity check** (`bunx tsc --noEmit`, verify files exist, confirm dispatch scope, dependency/HITL state, DoD, decision log, and evidence artifacts exist).
10. **Update workstream artifact tracker** when the repo has one.
11. **Dismiss implementer and reviewer** only after review loop is complete.
12. **Lead presents summary to user** for final validation.

**CRITICAL**: Never dismiss the implementer before review completes. Never fix code yourself — relay to implementer. Never skip the review instance. Never perform the review yourself. Never soften reviewer findings when relaying to the implementer.

## Review Standards

### What Reviewers Must Check (Beyond Domain Checklists)

0. **Correctness target alignment**: Does the implementation produce the desired outcome described by the source of truth?
0. **Dispatch scope alignment**: Did the implementer stay inside the dispatch packet's ownership, file boundaries, dependency constraints, and non-goals?
0. **Dependency/HITL compliance**: Were blocked slices deferred, human decisions respected, and assumptions logged instead of silently invented?
0. **Verification method fit**: Did each task slice use the verification method scoped for it, and is that method strong enough for the risk?
0. **Definition of done**: Are all scoped DoD checks, artifacts, approvals, and non-goals satisfied or explicitly waived by a human owner?
0. **Type/lint correctness**: Are type-system guarantees strong, lint/static checks passing, and unsafe casts or disabled rules justified by explicit invariants?
0. **Documentation correctness**: Do major functions have useful TSDoc-style comments in the DevTools frontend spirit: why, invariant, lifecycle, side effect, return, or footgun?
0. **Implementation naming hygiene**: Do implementation/domain artifacts use product language instead of workstream IDs/titles in fixture paths, fixture payloads, tests, comments, docs, generated artifacts, and commit-message suggestions?
0. **Git history readability**: Are changes stageable into small, coherent commits that humans and agents can parse?
1. **Sibling code gaps**: If a bug was fixed in one code path, does the same bug exist in a parallel path? (e.g., WebMCP fix missing in MCP agent)
2. **Log noise / production hygiene**: Do new logs respect log levels? Are they gated? Could they spam at scale?
3. **Timing / measurement accuracy**: Does instrumentation measure only what it claims? Does it include unrelated overhead?
4. **Backward compatibility**: Do type changes break existing construction sites? Are optional parameters safe when undefined?
5. **Resource cleanup**: Are new Refs, Queues, fibers, or intervals cleaned up on session close?
6. **Concurrency safety**: Under concurrent sessions, do shared mutable structures have race conditions?
7. **Execution order**: Are operations truly sequential where they need to be? Could fiber scheduling reorder them?
8. **Decision logs**: If agents made autonomous choices under uncertainty, are those choices recorded and reversible where possible?
9. **Evidence artifacts**: Are tests, screenshots, traces, fixtures, or generated reports present and inspectable?
10. **Commit boundaries**: Are mechanical changes, behavior changes, tests, docs, and generated artifacts separated when possible?

### Mandatory Verification (Learned from Wave A)

These checks are non-negotiable. Skipping any of them has caused multi-round review cycles:

1. **Run tsc yourself**: Run `bunx tsc --noEmit -p <app>/tsconfig.json` for every app with changed files. NEVER trust the engineer's claim that it passes — verify independently.
2. **Run lint/static checks yourself**: Run the scoped lint/static-analysis commands. Treat type/lint failures as correctness failures, not style-only issues.
3. **Audit type escapes**: Grep for `any`, `as unknown`, broad casts, non-null assertions, and lint disables in changed files. Each one needs a local invariant or review finding.
4. **Audit major function docs**: Public/exported/major functions need TSDoc-style comments when behavior is non-obvious or collaboration-critical. Use `/Users/vinicius/code/devtools/devtools-frontend` as the reference bar.
5. **Catch→null→fallback chains**: When error handling catches and returns null/undefined, trace what the caller does with that null. If it triggers a fallback/retry path, that's a hidden retry the task likely intended to remove.
6. **Duplicate DB/API calls on "unified" paths**: When a task says "unify X", check that the old call was actually removed — not just wrapped with a new call on top. Grep for the old function name in the new code.
6a. **Workstream-name leakage**: Grep changed implementation artifacts for the workstream ID, underscored ID, title, and slug. Findings are blocking when those names appear in fixture paths, fixture payload values, test names/functions, implementation comments/doc comments, generated artifact names/comments, human-facing implementation docs, or suggested commit messages. Orchestration/bookkeeping paths may retain required IDs.
7. **In-memory store cleanup on ALL termination paths**: Maps, Sets, and Refs added in service closures must be cleaned on session teardown, error paths, and scope close — not only on fresh initialization. Check the teardown/cleanup function.
8. **Endpoint protection carry-forward**: When an endpoint gains new capabilities (e.g., claim can now cold-start), check if sibling endpoints have rate limits, auth checks, or guards that must carry forward to the expanded endpoint.
9. **Server/client constant alignment**: Thresholds, timeouts, and policy constants that exist in both server and client must match. Grep for the constant value in both apps.
10. **Resource lifecycle matching**: `Effect.forkDaemon` means the fiber outlives its parent scope — is that intentional? Session-scoped work should use `Effect.forkIn(sessionScope)` so it's interrupted on session close.
11. **Polling/status endpoint side effects**: If a new polling endpoint calls a shared helper (e.g., `requireSession`), check if that helper has side effects (activity touch, metric increment) that the poll would trigger repeatedly.
12. **Deprecated API surfaces**: If a method is marked deprecated or a legacy path was replaced, verify it's either fully removed (zero callers) or fully adapted to the new contract. Half-removed compatibility shims are hidden traps.

### Severity Definitions

| Severity       | Criteria                                                                                                                                                                           | Blocks Merge? |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| **Critical**   | Type errors, security issues, data loss risk, broken functionality, race conditions                                                                                                | YES           |
| **Major**      | Pattern violations, missing error handling, performance regressions, sibling code with same bug not fixed, log spam, missing kill switches, incomplete documentation that misleads | YES           |
| **Minor**      | Style inconsistencies, naming, timing accuracy caveats, missing log context                                                                                                        | NO            |
| **Suggestion** | Nice-to-have improvements, future considerations                                                                                                                                   | NO            |

### What Makes a Good Review Finding

**Good** (from real reviews):

- "MCP agent has the exact same `_lastActivityRef` bug — not fixed" _(checked sibling code)_
- "`DbDirect` creates a SEPARATE pool with the same MAX, doubling per-instance connections" _(traced downstream impact)_
- "Every site emits Effect.logInfo + console.log for the same event — doubling log volume" _(checked production impact)_
- "`forkTimestamp` set before `spawnAgent`, not at the actual fork point" _(traced execution order)_

**Bad** (avoid):

- "Consider using a different naming convention" _(vague, no impact)_
- "This could be refactored" _(not actionable)_
- "I would have done this differently" _(opinion without evidence of a bug)_

### Review Output Format

```markdown
# Review: [TASK_ID] — [TASK_TITLE]

## Verdict: APPROVE or REQUEST_CHANGES

### Findings

- [CRITICAL/MAJOR/MINOR/INFO] description (file:line) — why it matters

### Suggestions (non-blocking)

- description
```

## Task Tracking

- ALWAYS use `TaskCreate` for multi-step plans — survives context compaction
- ALWAYS re-read the plan before initiating each task
- Reference the plan file path in each task description
- Use `TaskUpdate` with `addBlockedBy` for sequencing dependent work
- Dismiss engineers between tasks for context narrowing
- Each new engineer instance uses previous diary + handover for recap

## Seed Prompt Template

See [resources/seed-prompt-template.md](resources/seed-prompt-template.md) for the full template.

Quick checklist for every seed prompt:

- [ ] Skills to load (e.g., `/effect-services`, `/ai-sdk`, `/interface-craft`)
- [ ] Dispatch packet included
- [ ] PRD/scoping artifact included (correctness target, source of truth, verifiability, guardrails)
- [ ] Dependency graph and HITL decision state included
- [ ] DoD checklist, artifact conventions, and review lanes included
- [ ] Specific files to modify (with line references where helpful)
- [ ] Acceptance criteria (always include `bunx tsc --noEmit`)
- [ ] Type/lint/documentation gates included
- [ ] Commit plan and staging boundaries included
- [ ] Evidence plan and decision-log rules included
- [ ] Diary/handover location
- [ ] Exact evidence and decision-log paths
- [ ] What NOT to do (avoid parallel work conflicts)
- [ ] Reference to research diaries for context

## Diary and Handover Convention

See [resources/diary-convention.md](resources/diary-convention.md) for format details.

| Artifact             | Location                            | Written By            |
| -------------------- | ----------------------------------- | --------------------- |
| PRD/scoping artifact | Path named by dispatch packet       | Lead / scoping agent  |
| Dispatch packet      | Path named by artifact convention   | Lead / scoping agent  |
| Decision log         | Path named by dispatch packet       | Implementing engineer |
| Evidence artifacts   | Path named by dispatch packet       | Implementing engineer |
| Implementation diary | `docs/handover/{vertical}/diary/`   | Implementing engineer |
| Code review          | `docs/handover/{vertical}/reviews/` | Reviewer              |
| Handover notes       | End of diary entry                  | Implementing engineer |

## Parallelization Strategy

See [resources/parallel-work-guidelines.md](resources/parallel-work-guidelines.md) for detailed guidance.

Core rules:

- Identify independent work groups that can run simultaneously
- Document dependencies between groups
- Include conflict avoidance instructions in seed prompts (e.g., "add your change at TOP of file, Group A modifies the MIDDLE")
- Groups with file dependencies must run sequentially (use `addBlockedBy`)

## Review Protocol

See [resources/review-protocol.md](resources/review-protocol.md) for the full review process and antagonistic review guidelines.

Use the project review system prompt identified by the dispatch packet. For the review-triage V0 workstreams, that prompt lives at: `docs/handover/review-triage/review-system-prompt.md`

## Key Rules (Learned from Experience)

- **Correctness comes before execution** — define what correct means and how it will be verified before dispatching implementers.
- **Implementation consumes scoping outputs** — independent agents should receive the PRD, dispatch packet, dependency graph, HITL register, DoD checklist, artifact conventions, review lanes, and exact output paths. They should not need the scoping skill to reconstruct context.
- **Types and lint are correctness tools** — type holes, lint disables, unchecked casts, and schema gaps need explicit invariants or they block review.
- **Major functions need collaboration-grade docs** — use TSDoc-style comments for public, exported, lifecycle-sensitive, security-sensitive, adapter, classifier, or non-obvious functions.
- **Git history is an artifact** — plan small, coherent commits so humans and agents can replay intent from history.
- **Use verifier's rule** — decompose broad tasks into easy-to-verify, proxy-verifiable, human-judgment, and unknown slices.
- **Artifacts over chat** — preserve scoping, evidence, decisions, and reviews as durable artifacts.
- **Unblock and log** — agents may proceed through low/medium uncertainty only when the decision-log rule permits it; high-risk ambiguity must be escalated.
- **User does final validation** at end of each step
- **No hardcoded domain lists** — user rejected this pattern twice
- **User prefers direct removal** over phased/progressive approaches
- **IDE diagnostics are stale** — always use `bunx tsc --noEmit`
- **If 2+ iterations don't converge**, step back and rethink architecture
- **Don't patch wrong architecture** — rewrite cleanly
- **Always use `bun`/`bunx`** — never `npm`/`npx`
- **Never auto-approve anything** — user explicitly rejected this pattern
- **Relay questions if doubt or uncertainty arrives** — escalate to user, don't assume
- **Reviewers must be antagonistic** — assume code is wrong, question every line, check sibling code
- **No worktrees** — worktrees cause merge hell. Only parallelize tasks with zero file overlap running on the same working tree. Tasks sharing any file must run sequentially.
- **Engineers must read task scope before coding** — every seed prompt must include: "MANDATORY: Read the full task spec in [plan file path] (section [X]) BEFORE writing any code." This prevents scope drift and ensures acceptance criteria are understood upfront.
- **Reviewers must independently run tsc** — never trust the engineer's claim. Run `bunx tsc --noEmit -p <app>/tsconfig.json` per changed app.
- **Reviewers must run the redundancy checklist** — the 10-item checklist in review-protocol.md catches the patterns that caused Wave A's multi-round cycles.
