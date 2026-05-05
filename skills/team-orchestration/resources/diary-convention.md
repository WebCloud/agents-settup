# Diary and Handover Convention

## Directory Structure

```
docs/handover/{vertical}/
  scope/          # Optional local copies of scoping artifacts
  diary/          # Implementation diaries (one per task or session)
  reviews/        # Code reviews (one per reviewed task)
  decisions/      # Decision-log entries when the artifact convention calls for them
  evidence/       # Test logs, traces, screenshots, fixtures, generated reports
```

Each vertical gets its own handover directory. Example: `docs/handover/review-triage/`. If a dispatch packet or artifact convention gives a more specific path, that path wins.

## Diary Entry Format

```markdown
# Diary: [TASK_ID] — [TASK_TITLE]

**Date**: YYYY-MM-DD
**Engineer**: [session identifier]
**Status**: COMPLETE / IN_PROGRESS / BLOCKED

## What Was Implemented

[Brief summary of the work done]

## Correctness Evidence

- Correctness target:
- Source of truth:
- Dispatch packet:
- Dependency/HITL status:
- DoD checklist status:
- Evidence produced:
- Verification commands/artifacts:
- Remaining uncertainty:

## Type, Lint, And Documentation Gates

- Typecheck command/results:
- Lint/static command/results:
- Type escapes or lint disables:
- Major functions documented:
- Documentation waivers:

## Git History Plan

- Commit slices completed:
- Suggested staging boundaries:
- Mechanical changes isolated:
- Commit concerns for lead/reviewer:

## Decision Log

- [Decision]: [Why it was made, alternatives considered, reversible yes/no/unknown]

## Files Changed

| File               | Change              | Rationale            |
| ------------------ | ------------------- | -------------------- |
| `path/to/file.ts`  | Added X method      | Needed for Y feature |
| `path/to/other.ts` | Modified Z function | Fixed bug where...   |

## Decisions Made

- [Decision 1]: [Why this approach over alternatives]
- [Decision 2]: [Deviation from plan and justification]

## Issues Encountered

- [Issue 1]: [How it was resolved]
- [Issue 2]: [Workaround applied, tech debt noted]

## Handover

### State of Work

- [What is done and working]
- [What is partially done]

### What's Next

- [Immediate next steps]
- [Dependencies on other work]

### Blockers

- [Any blocking issues for the next engineer]

### Key Context for Next Session

- [Important patterns to follow]
- [Gotchas to be aware of]
- [Files that should NOT be modified]
```

## When to Write a Diary

- **After implementing a task** — before being dismissed
- **After a research/analysis session** — capture findings for future implementers
- **When pausing work mid-task** — handover state for the next session

## Artifact Locations

| Artifact             | Location                            | Written By           |
| -------------------- | ----------------------------------- | -------------------- |
| PRD/scoping artifact | Path named by dispatch packet       | Lead / scoping agent |
| Dispatch packet      | Path named by artifact convention   | Lead / scoping agent |
| Decision log         | Path named by dispatch packet       | Implementing engineer |
| Evidence artifacts   | Path named by dispatch packet       | Implementing engineer |
| Implementation diary | `docs/handover/{vertical}/diary/`   | Implementing engineer |
| Code review          | `docs/handover/{vertical}/reviews/` | Reviewer             |
| Handover notes       | End of diary entry                  | Implementing engineer |

## Review File Format

Reviews follow the format defined in [review-protocol.md](review-protocol.md).

File naming: `reviews/task-{id}-review.md`

## Using Diaries for Context

When spawning a new engineer for a task that builds on previous work:

1. Include the previous diary path in the seed prompt
2. Tell the engineer to read it before starting
3. Reference specific decisions or patterns from the diary

This ensures continuity across dismissed-and-respawned engineer instances.
