# Parallel Work Guidelines

## When to Parallelize

Parallelize when:

- Multiple tasks modify **different files** with no shared dependencies
- Tasks are in **different domains** (e.g., backend service + frontend component)
- Research/analysis tasks that only read code

Do NOT parallelize when:

- Tasks modify the **same file** (especially `runtime.ts`, shared types, barrel exports)
- One task's output is another task's input
- Tasks share a dependency that could conflict (e.g., both adding to the same layer)

## Planning Parallel Groups

Before file ownership is assigned, use the dispatch packet, dependency graph, HITL register, and PRD/scoping artifact to split work by verifiable task slices, not just by files. Prefer groups that can produce independent evidence artifacts.

### Step 1: Map File Dependencies

For each task, list:

- Files it will **create** (safe — no conflicts)
- Files it will **modify** (potential conflict zone)
- Files it will **read** for patterns (safe — read-only)
- Evidence it must produce (tests, fixtures, screenshots, traces, decision logs)
- Verifiability class (easy, proxy, human judgment, unknown)
- Type/lint/documentation gates it owns
- Commit slice or staging boundary it owns
- HITL decisions it depends on
- Artifact paths it owns
- Review lane that will verify it

### Step 2: Identify Conflict Zones

Mark any file that appears in the "modify" list of multiple tasks. These are conflict zones.

### Step 3: Group by Independence

- Tasks with no shared "modify" files can run in parallel
- Tasks sharing "modify" files must be sequenced
- Tasks whose evidence depends on another task's output must be sequenced
- Tasks sharing type surfaces, schema boundaries, generated files, or commit slices must be sequenced
- Tasks blocked by unresolved HITL decisions must not be dispatched as implementation work
- Human-judgment and unknown slices should not be hidden inside broad parallel implementation groups
- Use `TaskUpdate` with `addBlockedBy` for sequencing

### Step 4: Write Conflict Avoidance Instructions

For each parallel group, include in the seed prompt:

```
## Conflict Avoidance

Your group ([GROUP_LETTER]) is modifying these files:
- [list of files]

Group [OTHER] is simultaneously modifying:
- [list of their files]

If you both touch [shared file]:
- You modify lines [X-Y] / section [NAME]
- They modify lines [A-B] / section [OTHER_NAME]
- Add your changes at [TOP/BOTTOM/specific location]
```

## Example: Four Parallel Groups

```
| Group | Tasks | Files Modified | Dependencies |
|-------|-------|----------------|--------------|
| A     | F1    | 17 step files, router | None — runs first |
| B     | F2    | New utility file, agent system prompt | None |
| C     | F3+F4+F5 | Agent routing, system prompt, chat handler | None |
| D     | F6    | Router, service discovery | AFTER A (modifies router) |
```

Groups A, B, C run in parallel. Group D waits for A (both touch the router).

## Task Tracking for Parallel Work

```
TaskCreate: "Group A: F1 implementation"
TaskCreate: "Group B: F2 implementation"
TaskCreate: "Group C: F3+F4+F5 implementation"
TaskCreate: "Group D: F6 implementation"

TaskUpdate: Group D → addBlockedBy: [Group A]
```

## Common Pitfalls

1. **Barrel exports**: If two tasks both add exports to an `index.ts`, they'll conflict. Designate one group as the barrel owner, or have each add to different lines.

2. **Runtime.ts layer wiring**: If two tasks both add services to `runtime.ts`, they'll conflict. Sequence them, or have one add at the top and one at the bottom.

3. **Shared type files**: If both tasks extend a union type or interface, they'll conflict. Use specific, separate type files when possible.

4. **Package.json**: If both tasks add dependencies, they'll conflict. Have one group add all shared deps first.

## After Parallel Work Completes

1. Run `bunx tsc --noEmit` per changed app to catch integration issues
2. Check for merge conflicts in any shared files
3. Verify barrel exports are consistent
4. Run the full build to catch any missed dependencies
5. Confirm each parallel group produced its evidence artifacts and decision-log entries
6. Confirm type/lint/documentation gates are satisfied for each group
7. Confirm final changes can be staged into the planned granular commits
8. Confirm all review lanes required by the dispatch packets ran or were explicitly waived by a human owner
