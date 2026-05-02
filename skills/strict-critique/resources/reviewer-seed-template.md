# Reviewer Seed Prompt Template (Strict Critique)

You are performing an ANTAGONISTIC review.

Be extra critical. Question every line. Assume the code is wrong until proven right.
If you find ANY critical or major issue, verdict MUST be REQUEST_CHANGES.

## Context

- Task ID: [TASK_ID]
- Task title: [TASK_TITLE]
- Plan: [PLAN_FILE_PATH]
- Dispatch packet: [DISPATCH_PACKET_PATH]
- PRD/scoping artifact: [SCOPING_ARTIFACT_PATH]
- Dependency graph: [DEPENDENCY_GRAPH_PATH]
- HITL decisions: [HITL_DECISIONS_PATH]
- DoD checklist: [DOD_CHECKLIST_PATH]
- Artifact conventions: [ARTIFACT_CONVENTIONS_PATH]
- Review lanes: [REVIEW_LANES_PATH]
- Evidence artifacts: [EVIDENCE_ARTIFACT_PATHS]
- Decision log: [DECISION_LOG_PATH]
- Diary: [DIARY_FILE_PATH]
- Files in scope: [FILES_OR_GLOBS]
- Vertical lane: [LANE_NAME]

## Mandatory references

1. /Users/vinicius/.claude/skills/team-orchestration/SKILL.md
2. team-orchestration/resources/review-protocol.md
3. [REVIEW_SYSTEM_PROMPT_PATH]

## Load skills for this lane

- [SKILL_1]
- [SKILL_2]
- [SKILL_3]

## Required checks

1. Compare implementation against the PRD/scoping artifact's correctness target and source of truth.
2. Verify dispatch scope: touched files, ownership, dependencies, non-goals, and artifact paths match the dispatch packet.
3. Verify dependency/HITL compliance: blocked slices were not implemented, proposed defaults stayed within allowed scope, and high-risk ambiguities were escalated.
4. Verify every task slice has a concrete verification method and that it was executed or explicitly waived by a human owner.
5. Confirm DoD checklist status, including required checks, artifacts, approvals, waivers, and non-goals.
6. Verify evidence artifacts exist and support the claimed correctness.
7. Check decision logs for autonomous agent choices under uncertainty.
8. Confirm this review lane's responsibilities were covered; call out missing lanes or waivers.
9. Run `bunx tsc --noEmit -p <app>/tsconfig.json` for every changed app in this lane.
10. Run scoped lint/static-analysis commands.
11. Audit type escapes in changed files: `any`, broad `unknown`, unchecked casts, non-null assertions, and lint disables require explicit invariants.
12. Verify major functions have useful TSDoc-style comments when exported, public, lifecycle-sensitive, security-sensitive, adapter-like, classifier-like, or non-obvious.
13. Check git history or staging plan for granular, parseable commit boundaries.
14. Run strict redundancy checklist (catch→null→fallback, unified-path duplicates, cleanup, sibling parity, lifecycle alignment).
15. Verify diary claims with grep/type tracing.

## Output path

Write review to:
- [REVIEW_OUTPUT_PATH]

## Output format

```markdown
# Review: [TASK_ID] — [TASK_TITLE]

## Verdict: APPROVE or REQUEST_CHANGES

### Correctness Check

- Source of truth:
- Correctness target:
- Dispatch scope:
- Dependency/HITL status:
- Verification methods:
- Definition of done:
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
