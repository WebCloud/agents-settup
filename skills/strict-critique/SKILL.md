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
- Type/lint correctness is correctness, not style.
- Documentation quality is part of collaboration correctness when behavior is major or non-obvious.
- Naming quality is part of implementation correctness: fixture paths, fixture payload values, test names/functions, comments/doc comments, generated artifact names/comments, implementation docs, and commit-message suggestions must use domain/product language rather than workstream IDs or titles. Required orchestration/bookkeeping artifact paths are the exception.
- Git history must be parseable by humans and agents.
- Evidence over claims.
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

## Mandatory Verification Checklist

Reviewers must run these checks explicitly:

1. Compare implementation against the correctness target and source of truth.
2. Verify dispatch scope: touched files, ownership, dependencies, non-goals, and artifact paths match the dispatch packet.
3. Verify dependency/HITL compliance: blocked slices were not implemented, proposed defaults stayed within allowed scope, and high-risk ambiguities were escalated.
4. Verify DoD checklist status, including required checks, artifacts, approvals, waivers, and non-goals.
5. Verify verifiability claims: easy-to-verify slices have actual checks; proxy-verifiable slices use appropriate references; human-judgment slices are escalated.
6. Confirm evidence artifacts exist and are inspectable.
7. Check decision logs for autonomous choices under uncertainty.
8. Confirm review lanes required by the dispatch packet ran or were explicitly waived by a human owner.
9. Run `bunx tsc --noEmit -p <app>/tsconfig.json` for every changed app.
10. Run scoped lint/static-analysis commands.
11. Audit type escapes in changed files: `any`, broad `unknown`, unchecked casts, non-null assertions, and lint disables require explicit invariants.
12. Verify major functions have useful TSDoc-style comments when exported, public, lifecycle-sensitive, security-sensitive, adapter-like, classifier-like, or non-obvious. Use `/Users/vinicius/code/devtools/devtools-frontend` as the documentation bar.
13. Grep changed implementation/domain artifacts for workstream ID variants, titles, and slugs. Treat hits in fixture paths, fixture payloads, test names/functions, implementation comments/doc comments, generated artifact names/comments, human-facing implementation docs, or suggested commit messages as findings unless they are required orchestration/bookkeeping paths.
14. Check git history or staging plan: changes should be separable into small coherent commits, with mechanical formatting isolated from behavior when possible, and commit-message suggestions must avoid workstream IDs/titles.
15. Trace catch→null→fallback chains.
16. Confirm unified paths removed old call sites (grep old function names).
17. Verify in-memory cleanup on teardown/error/scope close.
18. Carry forward endpoint protections (rate limits/auth/guards).
19. Cross-check server/client shared constants.
20. Validate lifecycle choice (`forkDaemon` vs `forkIn`).
21. Detect polling endpoint side effects.
22. Verify deprecated API surfaces are fully removed or fully adapted.
23. Check sibling code parity across adjacent lanes.

## Severity and Merge Gates

- Critical: blocks merge
- Major: blocks merge
- Minor: does not block merge
- Suggestion: non-blocking

Correctness severity additions:

- Critical: implementation contradicts the source of truth; unverifiable high-risk behavior is marked safe; security/data-loss risk; missing required guardrail.
- Major: implementation breached dispatch scope without a logged decision; dependency/HITL blocker was bypassed; missing evidence for a claimed posture; human-judgment area was not escalated; autonomous decision under uncertainty was not logged; proxy verification is weak or misleading.
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
- Correctness target:
- Dispatch scope:
- Dependency/HITL status:
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
12. Final verdict is `APPROVE`.
