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

## Kanban Work Queue Contract

When the target repo has a Neuve Kanban board, the board is the operational queue for the workstream. The lead must not dispatch implementation or review from chat-only instructions.

Before dispatching any implementer or reviewer:

- Run `neuve kanban list` from the target repo to confirm the repo-local board and lane state. If the repo is not initialized for Kanban, record the setup gap in the scoping bundle and either initialize the board or ask the owner whether this task intentionally bypasses Kanban.
- Select or create exactly one owning ticket for the task slice. The ticket must have source refs, a brief/body, dependency or explicit no-dependency state, unlock criteria, validation route/scope, expected evidence, and current lane.
- Read `neuve kanban show <ticket>` and `neuve kanban context <ticket>` before composing seed prompts. Include the ticket id, source refs, lane, dependencies, blockers, expected evidence, and validation scope in the seed prompt.
- If a ticket is blocked, has unfinished parent dependencies, lacks source refs, or lacks expected evidence, do not dispatch implementation. Either move the ticket through the proper dependency/HITL resolution path or ask the owner for a bounded decision.

During implementation and review:

- Implementers must record progress and handoff context with `neuve kanban comment <ticket> ... --source-ref <id> --evidence-ref <artifact>`.
- Implementers must run `neuve kanban gate <ticket> --target done` before claiming a slice is ready to close. The gate report is the authoritative checklist for missing ticket process requirements, but it does not replace independent review.
- Implementers must record validation proof with `neuve kanban evidence <ticket> <summary> --result passed --satisfies <expected-evidence-label> --proof-ref <artifact-or-review-ref> --artifact-ref <ref> --command-ref <command> --commit-ref <short-ref> --commit-title <title>` after committed work exists. Every ticket evidence handoff tied to committed code must include paired commit short refs and titles.
- Treat `--command-ref` as provenance only. Evidence satisfies a lane gate only when it records the result, the exact expected-evidence label, and a bounded proof ref that demonstrates the result.
- Reviewers must read the same ticket context and add review disposition or blockers back to the ticket.
- Reviewers must run Neuve review routing when available and treat any human-routed unit as a HITL gate before review approval. Human-routed units include `human_required`, `human_suggested`, manual-required, suggested-review, focused-human-review, strict-human-review, and manual-mapping labels.
- Kanban state is process state only. It never replaces source-of-truth inspection, strict review, test evidence, HITL decisions, or owner approval.

At closeout:

- Complete a ticket only after `neuve kanban gate <ticket> --target done` passes and DoD, proof-backed evidence, review disposition, dependency state, HITL state, and any committed-work short refs/titles are recorded.
- Before completing a ticket or presenting final closeout, the lead must run the full `neuve-review-workflow` for the final intended range, normally the full branch against its merge base or target base. If that final pass reports any human-routed units (`human_required`, `human_suggested`, manual-required, suggested-review, focused-human-review, strict-human-review, or manual-mapping labels), the lead must run the same HITL gate: surface the units to the user, request a bounded decision, and record the decision or explicit waiver before completing the ticket.
- Block a ticket when a sourced ambiguity, owner decision, dependency, or validation gap prevents safe progress.
- Leave parent/workstream tickets active when child task tickets remain incomplete; record a comment explaining the current state instead of forcing completion.

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
- Receive the implementation context bundle: Kanban ticket id/context, dispatch packet, PRD/scoping artifact, dependency graph state, HITL decisions, DoD checklist, review lanes, artifact conventions, exact diary/evidence/decision-log paths, correctness target, source of truth, verifiability map, type/lint/documentation gates, commit plan, guardrails, evidence plan
- Write diary entries documenting changes, decisions, issues
- Write decision-log entries when they proceed through uncertainty instead of blocking
- Record ticket progress, evidence handoffs, and blockers through `neuve kanban comment`, `neuve kanban evidence`, and `neuve kanban block` as appropriate
- Stay running through the review loop for potential patches
- Use `bun`/`bunx` — never `npm`/`npx`

**Mandatory verification before reporting done:**
- Re-read `neuve kanban show <ticket>` and `neuve kanban context <ticket>` and confirm the implemented slice still matches the ticket scope.
- Run `bunx tsc --noEmit -p <app>/tsconfig.json` for EVERY app with changed files — not repo-wide, per-app
- Run the scoped lint/static-analysis commands for every changed app/package
- Preserve type-system correctness: no `any`, broad `unknown`, unchecked casts, non-null assertions, or lint disables unless the scoping artifact permits them or the diary records the invariant that makes them safe
- Add TSDoc-style comments for public, exported, major, lifecycle-sensitive, security-sensitive, adapter, classifier, or non-obvious functions. Follow the DevTools frontend style: document behavior, invariants, return semantics, side effects, and footguns rather than restating the signature.
- Treat deterministic tests as the primary behavior proof. They must cover the happy path plus known, reasonable unhappy paths within the scoped work. Visual Proof is only a screenshot/trace of an existing or already-scoped user-facing route; do not create proof-only QA harnesses, hidden routes, synthetic UI surfaces, or special APIs solely to manufacture proof. If no existing/scoped route applies, record Visual Proof as not applicable and provide deterministic test proof plus a validated/fingerprinted test-output artifact.
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
- Receive the review context bundle: Kanban ticket id/context, project review system prompt, dispatch packet, PRD/scoping artifact, implementer diary, evidence artifacts, decision log, DoD checklist, review lane definition, relevant domain skills, and explicit antagonistic directive
- **Question every line of code** — trace full execution paths, not just the diff
- **Check what WASN'T changed** — sibling code, parallel agent types, shared interfaces
- **Verify every diary claim** — grep, trace types, confirm backward compatibility
- Use sub-agents for vertical exploration (type checking, pattern conformance, runtime analysis, sibling code search)
- Run Neuve review routing when available and stop for a HITL gate when any review unit is human-suggested, human-required, manual-required, suggested-review, focused-human-review, strict-human-review, or manual-mapping routed. Record the surfaced units and developer decision or explicit waiver in the review artifact.
- Write review to `reviews/task-X.Y-review.md`
- Verdict: APPROVE or REQUEST_CHANGES — ANY critical or major finding forces REQUEST_CHANGES
- Every finding MUST include `file:line`, the exact problem, and WHY it matters
- No timing estimates — structural analysis only

### Design Engineers

- ALWAYS load `/interface-craft` and `/web-design-guidelines` skills
- Handle all UI/motion/animation code changes
- Lead never does frontend implementation directly

## Mandatory Task Execution Protocol

**14 steps. Do NOT skip any.**

1. **Scope correctness** using `/workstream-scoping` when the task is non-trivial and no complete scoping bundle already exists.
2. **Create or update a scoping bundle** with PRD/scoping artifact, dependency graph, HITL decision register, dispatch packet, artifact conventions, DoD checklist, review lanes, correctness target, source-of-truth clarity, verifiability map, verification methods, type/lint/documentation gates, verifiable decomposition, granular commit plan, guardrails, evidence plan, and review posture.
3. **Select or create the Kanban ticket** for the task slice when the repo has Neuve Kanban. Read `neuve kanban show <ticket>` and `neuve kanban context <ticket>` and include the ticket context in all dispatch prompts.
4. **Spawn implementing teammate** with seed prompt + Kanban ticket context + dispatch packet + PRD/scoping artifact + dependency/HITL status + exact artifact paths.
5. **Teammate implements** and reports back with diary, evidence artifacts, decision log, `neuve kanban gate <ticket> --target done` output, commit short refs/titles, and Kanban comment/evidence handoffs.
6. **Spawn reviewer** (separate instance) with Kanban ticket context, the project `review-system-prompt.md`, dispatch packet, PRD/scoping artifact, DoD checklist, review lanes, diary, evidence artifacts, and decision log — BEFORE dismissing implementer. Always include the antagonistic directive: _"Be extra critical. Question every line. Assume the code is wrong until proven right. If you find ANY critical or major issue, verdict MUST be REQUEST_CHANGES."_
7. **Reviewer writes review** to `reviews/task-X.Y-review.md`, validating both implementation and correctness evidence. If Neuve routes any unit to human-required, human-suggested, manual-required, suggested-review, focused-human-review, strict-human-review, or manual-mapping review, the reviewer must run a HITL gate and record the decision or explicit waiver before `APPROVE`.
8. **If REQUEST_CHANGES** — lead relays findings to the STILL-RUNNING implementer for patches. Relay the EXACT findings, not a summary. Iterate until APPROVE.
9. **If APPROVE** — implementer writes final diary/handover entry and records the final Kanban evidence/comment handoff with proof refs, satisfied expected-evidence labels, `--result passed`, and commit short refs/titles for committed work.
10. **Lead does quick sanity check** (`bunx tsc --noEmit`, verify files exist, confirm dispatch scope, dependency/HITL state, DoD, decision log, evidence artifacts, and Kanban ticket state exist).
11. **Lead runs final Neuve review workflow** for the full final range. If any human-routed review units are present, the lead must run a HITL gate with the user and record the decision or explicit waiver before closeout.
12. **Update workstream artifact tracker** when the repo has one, then run `neuve kanban gate <ticket> --target done` and update Kanban ticket state to done or blocked according to the gate report and recorded evidence.
13. **Dismiss implementer and reviewer** only after review loop is complete.
14. **Lead presents summary to user** for final validation.

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
9a. **Visual Proof discipline**: Does behavior correctness rely on deterministic happy/unhappy path tests, and is Visual Proof limited to screenshots/traces of existing or scoped routes rather than proof-only harnesses/routes/APIs?
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
- [ ] Kanban ticket id, lane, `neuve kanban show` summary, and `neuve kanban context` summary included
- [ ] Dispatch packet included
- [ ] PRD/scoping artifact included (correctness target, source of truth, verifiability, guardrails)
- [ ] Dependency graph and HITL decision state included, including the rule that human-suggested Neuve units require a HITL gate
- [ ] DoD checklist, artifact conventions, and review lanes included
- [ ] Specific files to modify (with line references where helpful)
- [ ] Acceptance criteria (always include `bunx tsc --noEmit`)
- [ ] Type/lint/documentation gates included
- [ ] Commit plan and staging boundaries included
- [ ] Evidence plan and decision-log rules included
- [ ] Kanban gate/comment/evidence/block commands required for handoff and closeout, with proof refs, results, satisfied expected-evidence labels, and commit short refs/titles required on committed evidence
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
- **Kanban drives execution** — when a repo-local Neuve Kanban board exists, every task slice must have a source-linked ticket before dispatch, every handoff must update the ticket, and closeout must pass `neuve kanban gate <ticket> --target done`.
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
