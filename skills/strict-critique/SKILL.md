---
name: strict-critique
description: Antagonistic, evidence-first review workflow for code changes. Enforces parallel reviewer orchestration, vertical skill loading, and merge-blocking severity rules.
---

# Strict Critique

Use this skill when the user asks for a review, critique, audit, or validation of implementation quality.

This skill is intentionally strict and should be run with [$team-orchestration](/Users/vinicius/.claude/skills/team-orchestration/SKILL.md).

When reviewing scoped workstreams, consume `/workstream-scoping` outputs if present: PRD/scoping artifact, dispatch packet, dependency graph, HITL decisions, DoD checklist, artifact conventions, and review lanes. Reviews must validate correctness, not just diff mechanics. Do not re-run `/workstream-scoping` unless the user explicitly asks to re-scope.

## Core Posture

- Assume the code is wrong until proven right.
- Findings over summaries.
- Correctness target over implementation intent.
- Dispatch scope over opportunistic implementation.
- HITL decisions over silent assumptions.
- Human-suggested Neuve review units require an explicit HITL gate just like human-required units; advisory does not mean silent.
- Type/lint correctness is correctness, not style.
- Documentation quality is part of collaboration correctness when behavior is major or non-obvious.
- Naming quality is part of implementation correctness: fixture paths, fixture payload values, test names/functions, comments/doc comments, generated artifact names/comments, implementation docs, and commit-message suggestions must use domain/product language rather than workstream IDs or titles. Required orchestration/bookkeeping artifact paths are the exception.
- Git history must be parseable by humans and agents.
- Evidence over claims.
- Deterministic tests are the primary behavior proof. They must cover happy paths plus known, reasonable unhappy paths within the approved scope.
- Visual Proof is only a screenshot or trace of an existing or already-scoped user-facing route. Proof-only QA harnesses, hidden routes, synthetic UI surfaces, or special APIs created solely for proof are review findings unless explicitly approved by the owner in the scope.
- Kanban ticket state is review process evidence when a repo-local Neuve board exists; review must consume the ticket context and update the ticket with disposition/evidence.
- Verify diary claims independently.
- Verify source-of-truth claims independently.
- Check sibling paths and unchanged code that should have been updated.
- Check decision logs for autonomous agent choices under uncertainty.
- Any Critical or Major issue forces `REQUEST_CHANGES`.

## Mandatory Companion References

1. [$team-orchestration](/Users/vinicius/.claude/skills/team-orchestration/SKILL.md)
2. `/Users/vinicius/.claude/skills/team-orchestration/resources/review-protocol.md`
3. Project review system prompt named by the dispatch packet. For review-triage V0, use `docs/handover/review-triage/review-system-prompt.md`
4. Dispatch packet for the workstream, when present
5. PRD/scoping artifact for the workstream, when present
6. Dependency graph and HITL decision register, when present
7. DoD checklist, artifact conventions, review lanes, implementer diary, decision log, and evidence artifacts, when present
8. `/Users/vinicius/.agents/skills/neuve-review-workflow/SKILL.md` when Neuve is available or the reviewed repo is Neuve
9. `neuve kanban show <ticket>` and `neuve kanban context <ticket>` when the target repo has a Neuve Kanban board

## Lead Rules (Non-Negotiable)

- The lead coordinates only.
- The lead never implements fixes directly.
- The lead never performs the final review directly.
- The implementer stays alive until review is approved.

## Parallel Reviewer Orchestration

Use parallel reviewers only when write scopes are disjoint and review questions are independent.

1. Split the review into vertical lanes.
2. Spawn one reviewer per lane with explicit ownership.
3. Include the antagonistic directive in every seed prompt:
- `Be extra critical. Question every line. Assume the code is wrong until proven right. If you find ANY critical or major issue, verdict MUST be REQUEST_CHANGES.`
4. Collect findings into lane-specific review files.
5. Merge findings and relay exact blocking items to implementer.
6. Re-review patched areas until all lanes are `APPROVE`.

## Vertical Skill Matrix

Load skills per lane based on changed files.

- Backend Effect/Services:
- `/effect-services`, `/ai-sdk`, `/global-patterns`

- Browsing/WebMCP/MCP Agents:
- `/debug-browsing-strict`, `/effect-services`, `/browser-security`, `/ai-sdk`

- Frontend React/UI:
- `/interface-craft`, `/web-design-guidelines`, `/jotai-state`, `/tanstack-form`, `/tanstack-router`, `/shadcn-ui`, `/vercel-react-best-practices`

- Database/Schema/Queries:
- `/database-drizzle`, `/postgres`

- Email flows:
- `/resend`, `/email-best-practices`, `/react-email`, `/agent-email-inbox`

- Security-hardening checks:
- `/browser-security`, `/global-patterns`

## Neuve Dogfood Protocol

Use Neuve as a non-blocking signal-gathering layer during review when the `neuve` command is available, or when reviewing the Neuve repo where `./target/debug/neuve` or `cargo run -p neuve-local-cli --` may be available.

Neuve must never replace strict review. It can influence where the reviewer looks first, which source-truth questions they ask, and what AX backlog feedback they leave.

When a repo-local Neuve Kanban board exists, Kanban is the mandatory process entrypoint for the reviewed work:

1. Run `neuve kanban list` to confirm the local board.
2. Read the owning ticket with `neuve kanban show <ticket>` and `neuve kanban context <ticket>` before reviewing code, tests, docs, or evidence.
3. Treat missing ticket, missing source refs, missing expected evidence, open parent dependencies, or active blockers as review setup findings unless the dispatch packet explicitly waives Kanban for this work.
4. Run or consume `neuve kanban gate <ticket> --target done` before any approval closeout. Treat unmet gate requirements as review setup or evidence findings unless explicitly waived by the owner.
5. Record review disposition or blockers with `neuve kanban comment`, `neuve kanban evidence`, or `neuve kanban block` using source refs, proof refs, satisfied expected-evidence labels, evidence result, artifact refs, and commit short refs/titles when committed work exists. Do this for `APPROVE` and `REQUEST_CHANGES`.
6. Treat command refs as reproduction/provenance only. A command that ran is not evidence unless the handoff records `--result passed`, the exact `--satisfies` expected-evidence label, and a bounded `--proof-ref` showing the outcome.
7. Do not complete tickets from review alone unless the owning orchestration workflow has recorded DoD, proof-backed validation evidence, dependency state, HITL state, final review disposition, and a passing Kanban gate.
8. If Neuve returns any human-routed review unit, the reviewer must stop for a HITL gate before `APPROVE`. Human-routed units include `human_required`, `human_suggested`, `manual-required`, `manual required`, `suggested-review`, `suggested review`, `requires strict human review`, `needs focused human review`, and `needs manual mapping`. Surface the unit paths/ids, route labels, reasons, command range, and artifact refs to the developer; request a bounded decision; and record the decision or explicit waiver in the review artifact and Kanban comment.

Load `/Users/vinicius/.agents/skills/neuve-review-workflow/SKILL.md` before running Neuve commands. If the installed skill is unavailable inside the current agent, read the repo-local fallback at `.agents/skills/neuve-review-workflow/SKILL.md` and record that fallback as AX friction.

`neuve-review-workflow` is the reviewer-facing orchestration entry point, but command-level dogfooding must use the matching Neuve command skill when it is available. Before running or interpreting a specific Neuve command, load the installed command skill first, falling back to the repo-local `.agents/skills/<skill-name>/SKILL.md` copy when present and recording fallback/missing-skill friction in the dogfood feedback artifact.

Command skill mapping:

- `neuve doctor` and `neuve warm`: `/Users/vinicius/.agents/skills/neuve-environment/SKILL.md`
- `neuve triage`: `/Users/vinicius/.agents/skills/neuve-triage/SKILL.md`
- `neuve sources`: `/Users/vinicius/.agents/skills/neuve-sources/SKILL.md`
- `neuve scan`: `/Users/vinicius/.agents/skills/neuve-scan/SKILL.md`
- `neuve feedback`: `/Users/vinicius/.agents/skills/neuve-feedback/SKILL.md`
- `neuve classify`: `/Users/vinicius/.agents/skills/neuve-classifier/SKILL.md`

Default command ladder:

1. `neuve kanban list`, then `neuve kanban show <ticket>`, `neuve kanban context <ticket>`, and `neuve kanban gate <ticket> --target done` when the repo has a board.
2. `neuve doctor` when local state or install status is unknown.
3. `neuve warm` when the branch is large or repeated runs are likely.
4. `neuve triage` for branch posture and immediate review focus.
5. `neuve sources` when review investigation needs usage, history, correctness context, risk, claim correlation, conflicts, or HITL blockers. Use `neuve sources --mode usage --source <file>` for focused blast-radius questions and `--truth <ref>` only for explicit diagnostic pins.
6. `neuve scan` when changed surface, broad-change reasons, file ranking, or delegation boundaries matter.
7. Use `--details`, then `--blame`, then `--blame --focus <path>` only when the brief is insufficient.
8. Use the `.neuve-artifact/*` footnote for raw drill-down instead of pasting full terminal or JSON output into the review.

For each review, record a dogfood feedback artifact unless Neuve was unavailable and the reason is already recorded in the review. Prefer the workstream evidence folder:

```text
docs/handover/{vertical}/{workstream}/evidence/neuve-ax-feedback.md
```

If the dispatch packet names a different evidence path, use that path.

The feedback artifact must include:

- Kanban ticket id, lane/status before review, ticket source refs consumed, gate result, ticket comment/evidence/block command recorded, proof refs and satisfied expected-evidence labels, evidence results, and commit short refs/titles attached to evidence for committed work.
- Commands run, artifact refs, and whether each output affected review focus.
- Value add: what Neuve made faster, clearer, or easier to verify.
- Sticking points: slow commands, confusing labels, missing source truth, poor ranking, broad blockers, artifact friction, or misleading next commands.
- Format feedback: human-facing brief, tables, grouped blockers, JSON artifact, desired Markdown/glanceable artifact, progressive disclosure flow, and whether `--details`/`--blame`/`--focus` revealed the right next layer.
- Backlog signals: concrete product improvements suggested by the reviewer experience.

When allowed and the CLI supports it, also run `neuve feedback record` for at least the most important feedback event. Keep notes bounded and local-only; do not include raw code, raw diffs, secrets, or full source text.

The review verdict must not be `APPROVE` until the Neuve dogfood section is present, or until the review explicitly states why Neuve could not be run.

## Mandatory Verification Checklist

Reviewers must run these checks explicitly:

1. Read the owning Kanban ticket context when a repo-local board exists, or record why no ticket/board is available.
2. Run Neuve dogfood commands with `neuve-review-workflow` and the matching command-specific Neuve skills loaded, or record why Neuve or the expected skills are unavailable.
3. Compare implementation against the correctness target and source of truth.
4. Verify dispatch scope: touched files, ownership, dependencies, non-goals, and artifact paths match the dispatch packet and Kanban ticket.
5. Verify dependency/HITL compliance: blocked slices were not implemented, proposed defaults stayed within allowed scope, ticket parent dependencies were respected, and high-risk ambiguities were escalated.
6. Verify DoD checklist status, including required checks, artifacts, approvals, waivers, non-goals, Kanban expected evidence, and the current `neuve kanban gate <ticket> --target done` report.
7. Verify verifiability claims: easy-to-verify slices have actual checks; proxy-verifiable slices use appropriate references; human-judgment slices are escalated.
8. Confirm evidence artifacts exist and are inspectable.
8a. Verify behavior evidence uses deterministic tests for the happy path plus known, reasonable unhappy paths in scope. Verify Visual Proof, when claimed, is a screenshot/trace of an existing or already-scoped route and not a proof-only QA harness, hidden route, synthetic UI surface, or special API.
9. Check decision logs for autonomous choices under uncertainty.
10. Confirm review lanes required by the dispatch packet ran or were explicitly waived by a human owner.
11. Run `bunx tsc --noEmit -p <app>/tsconfig.json` for every changed app.
12. Run scoped lint/static-analysis commands.
13. Audit type escapes in changed files: `any`, broad `unknown`, unchecked casts, non-null assertions, and lint disables require explicit invariants.
14. Verify major functions have useful TSDoc-style comments when exported, public, lifecycle-sensitive, security-sensitive, adapter-like, classifier-like, or non-obvious. Use `/Users/vinicius/code/devtools/devtools-frontend` as the documentation bar.
15. Grep changed implementation/domain artifacts for workstream ID variants, titles, and slugs. Treat hits in fixture paths, fixture payloads, test names/functions, implementation comments/doc comments, generated artifact names/comments, human-facing implementation docs, or suggested commit messages as findings unless they are required orchestration/bookkeeping paths.
16. Check git history or staging plan: changes should be separable into small coherent commits, with mechanical formatting isolated from behavior when possible, and commit-message suggestions must avoid workstream IDs/titles.
17. Trace catch→null→fallback chains.
18. Confirm unified paths removed old call sites (grep old function names).
19. Verify in-memory cleanup on teardown/error/scope close.
20. Carry forward endpoint protections (rate limits/auth/guards).
21. Cross-check server/client shared constants.
22. Validate lifecycle choice (`forkDaemon` vs `forkIn`).
23. Detect polling endpoint side effects.
24. Verify deprecated API surfaces are fully removed or fully adapted.
25. Check sibling code parity across adjacent lanes.
26. Record the review disposition, evidence, or blocker back to the Kanban ticket when a repo-local board exists; verify evidence handoffs include proof refs, `passed`/failed/blocked/unknown result, satisfied expected-evidence labels, and paired commit short refs/titles for committed work.

## Severity and Merge Gates

- Critical: blocks merge
- Major: blocks merge
- Minor: does not block merge
- Suggestion: non-blocking

Correctness severity additions:

- Critical: implementation contradicts the source of truth; unverifiable high-risk behavior is marked safe; security/data-loss risk; missing required guardrail.
- Major: implementation breached dispatch scope without a logged decision; dependency/HITL blocker was bypassed; missing evidence for a claimed posture; human-judgment area was not escalated; autonomous decision under uncertainty was not logged; proxy verification is weak or misleading.
- Major: behavior proof relies on Visual Proof/manual browsing while deterministic happy/unhappy path tests are missing, or a proof-only QA harness/route/API was created without explicit owner approval.
- Major: type/lint correctness is weakened by unjustified `any`, broad `unknown`, unchecked casts, non-null assertions, lint disables, or missing schema validation at an external boundary.
- Major: a public/exported/major function lacks necessary TSDoc-style documentation and the missing context can mislead future humans or agents.
- Major: workstream IDs/titles leak into implementation/domain artifact names, fixtures, tests, generated artifacts, comments, docs, or commit-message suggestions where domain/product language should be used.
- Minor: commit boundaries are muddy but still stageable into coherent commits.
- Major: commit history or staged patch mixes unrelated behavior in a way that blocks reliable human/agent review.

## Required Review Output

Use exactly this structure:

```markdown
# Review: [TASK_ID] — [TASK_TITLE]

## Verdict: APPROVE or REQUEST_CHANGES

### Correctness Check

- Source of truth:
- Kanban ticket:
- Correctness target:
- Dispatch scope:
- Dependency/HITL status:
- Neuve HITL gate:
- DoD checklist:
- Review lanes:
- Type/lint/doc gates:
- Git history/staging:
- Verification evidence:
- Decision-log status:

### Findings

- [CRITICAL/MAJOR/MINOR/INFO] description (file:line) — why it matters

### Suggestions (non-blocking)

- description

### Neuve Dogfood Feedback

- Commands run:
- Artifact refs:
- Kanban updates:
- HITL gate:
- Signal value:
- Sticking points:
- Format feedback:
- Backlog signals:
- Feedback artifact:
```

## Seed Prompt Template

Use: `resources/reviewer-seed-template.md`

## Exit Criteria

Do not mark the review complete until:

1. All review lanes have explicit verdicts.
2. All Critical/Major findings are resolved.
3. Source-of-truth and correctness target were checked.
4. Dispatch packet scope was checked.
5. Dependency graph and HITL decisions were checked.
6. DoD checklist, evidence artifacts, and decision logs were checked.
7. Artifact conventions and required output paths were checked.
8. Required `tsc` and lint/static checks were executed and reported.
9. Type/lint/documentation gates were checked.
10. Implementation naming was grepped for workstream ID/title leakage and only required orchestration/bookkeeping path hits remain.
11. Git history or staging plan was checked for parseable commit boundaries.
12. Kanban ticket context and gate report were consumed, and the review disposition/evidence/blocker was recorded with proof refs, results, satisfied expected-evidence labels, and commit short refs/titles for committed work, or unavailability was explicitly recorded.
13. Neuve dogfood feedback artifact exists, or unavailability is explicitly recorded.
14. Any Neuve human-routed units (`human_required`, `human_suggested`, manual-required, suggested-review, focused-human-review, or manual-mapping labels) were surfaced through a HITL gate, with the developer decision or explicit waiver recorded.
15. Final verdict is `APPROVE`.
