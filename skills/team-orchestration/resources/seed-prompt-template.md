# Seed Prompt Template

Use this template when composing prompts for implementing engineers.

## Template

```
You are implementing [TASK_ID]: [TASK_TITLE] for the [VERTICAL] vertical.

## Context

[Brief description of what this task accomplishes and why it matters]

## Correctness Scope

Read the implementation context bundle first:
- Dispatch packet: [DISPATCH_PACKET_PATH]
- PRD/scoping artifact: [SCOPING_ARTIFACT_PATH]
- Dependency graph: [DEPENDENCY_GRAPH_PATH]
- HITL decision register: [HITL_DECISIONS_PATH]
- DoD checklist: [DOD_CHECKLIST_PATH]
- Artifact conventions: [ARTIFACT_CONVENTIONS_PATH]
- Review lanes: [REVIEW_LANES_PATH]

Do not load `/workstream-scoping` during implementation. Treat these artifacts as the completed scoping output unless the lead explicitly asks you to re-scope.

Correctness target:
- [What must be true for this work to be correct]

Source of truth:
- Primary: [ticket / PRD / issue / user request / code convention]
- Clarity: [clear / partial / contradictory / missing]
- Gaps: [known ambiguity]

Verifiability map:
- Easy to verify: [tests/checks]
- Proxy-verifiable: [fixtures/golden references/snapshots]
- Human judgment: [architecture/product/security/UX/risk]
- Unknown: [must ask or log]

Verification methods:
- TDD/unit: [named tests or not applicable]
- Integration: [named scenarios or not applicable]
- Browser/E2E: [flows, screenshots, traces, or not applicable]
- Typecheck/lint/static: [commands]
- Security/manual/reviewer: [review lane and expected artifact]

Definition of done:
- Required checks: [commands and scenarios]
- Required artifacts: [tests/screenshots/logs/traces/docs/review notes]
- Required approvals: [agent/reviewer/human owner]
- Explicit non-goals: [what this task must not do]

Type/lint/documentation gates:
- Type-system expectations: [strict types, schema boundaries, forbidden type escapes]
- Lint/static commands: [commands]
- Allowed unsafe casts or ignores: [none, or exact invariant]
- Major functions requiring TSDoc: [functions/modules]
- Documentation bar: follow DevTools frontend style for behavior, invariants, lifecycle, side effects, return semantics, and footguns

Verifiable decomposition:
- Slice: [name]
  - Correctness point: [observable pass/fail]
  - Verification method: [how it will be checked]
  - Evidence artifact: [where proof will live]
  - Type/lint/doc gate: [specific static or documentation requirement]
  - Commit intent: [one coherent commit subject/scope]
  - Approval: [agent/reviewer/human owner]

Git history plan:
- Commit slices: [small coherent commits]
- Suggested commit messages: [imperative subject lines using domain/product language, not workstream IDs or titles]
- Staging boundaries: [what must not be mixed]
- Mechanical changes to isolate: [formatting/renames/generated output]

Guardrails:
- In scope: [files/systems/actions]
- Out of scope: [files/systems/actions]

Dependency and HITL status:
- Upstream dependencies: [ready / blocked / partial]
- Downstream consumers: [workstreams affected by this output]
- Human decisions already resolved: [list]
- Human decisions still blocking: [list]
- Proposed defaults allowed for this task: [list or none]

Decision-log rules:
- Agent may decide: [bounded choices]
- Agent must ask: [high-risk uncertainty]
- Agent may proceed but must log: [reversible assumptions]

Read these files for context:
- [Diary/research files that provide background]
- [Adjacent code files that show established patterns]

## Skills to Load

Load these skills before starting:
- /[skill-1] (e.g., /effect-services, /ai-sdk, /interface-craft)
- /[skill-2]

## What to Implement

[Specific, concrete list of changes]

1. [File path] — [What to change and why]
2. [File path] — [What to change and why]
3. ...

Naming rule:
- Implementation/domain artifacts must use domain or product concepts, not workstream IDs/titles. This applies to fixture paths, fixture payload values, test names/functions, implementation comments/doc comments, generated artifact names or comments, human-facing implementation docs, and suggested commit messages. Keep workstream IDs only where orchestration/bookkeeping artifact conventions require them, such as PRD, handover, evidence, diary, review, and task paths.

## Acceptance Criteria

- [ ] `bunx tsc --noEmit -p <app>/tsconfig.json` passes for EVERY app with changed files (run per-app, not repo-wide)
- [ ] Scoped lint/static-analysis commands pass
- [ ] Implementation satisfies the correctness target from the PRD/scoping artifact
- [ ] Implementation stays inside the dispatch packet ownership, file boundaries, dependency constraints, and non-goals
- [ ] Any blocked HITL decision is escalated instead of silently decided
- [ ] Every task slice has its verification method executed or explicitly waived by a human owner
- [ ] Definition of done is satisfied
- [ ] Type-system expectations are satisfied; unsafe casts, non-null assertions, and lint disables are absent or explicitly justified
- [ ] Major functions have useful TSDoc-style comments where scoped
- [ ] Implementation names, fixtures, tests, comments, generated artifacts, docs, and suggested commit messages use domain/product language rather than workstream IDs/titles
- [ ] Changes remain stageable according to the commit plan
- [ ] Evidence artifacts listed in the evidence plan are produced or explicitly marked impossible with rationale
- [ ] Decision log includes any autonomous choices made under uncertainty
- [ ] [Functional criterion 1]
- [ ] [Functional criterion 2]
- [ ] [Pattern conformance criterion]

## Mandatory Verification (before reporting done)

- [ ] Grep ALL callers of any replaced/unified function — update or remove every one
- [ ] Grep changed implementation artifacts for the workstream ID/title/slug and replace implementation-facing hits with domain/product language; retain only required orchestration/bookkeeping path hits
- [ ] Grep changed files for `any`, `as unknown`, unchecked casts, `!`, and lint disables; justify or remove each type escape
- [ ] If expanding an endpoint's capabilities, check sibling endpoints for rate limits/auth that must carry forward
- [ ] In-memory stores (Maps, Sets, Refs) have cleanup in teardown/close path
- [ ] Effect.forkDaemon vs forkIn — session-scoped work uses forkIn(sessionScope)
- [ ] Constants/thresholds shared between server and client are aligned
- [ ] No optional chaining (`?.`) flowing into non-optional types
- [ ] Error catch blocks produce structured outcomes, never null that triggers hidden fallbacks

## Conflict Avoidance

[Only needed when running parallel groups]

- Do NOT modify [file/section] — Group [X] is working on that
- Add your changes at [TOP/BOTTOM/specific section] of [file]
- If you need to modify a shared file, [specific instructions]

## Diary Location

Write your diary entry to: `docs/handover/[vertical]/diary/[task-id]-[short-name].md`

Write decision-log entries to: `[DECISION_LOG_PATH]`
Write evidence artifacts to: `[EVIDENCE_ARTIFACT_PATHS]`

Include:
- Files changed (with brief rationale)
- Decisions made (especially deviations from plan)
- Correctness evidence produced
- Verification methods executed, with artifact paths
- DoD status and any human waivers
- Type/lint/doc gate status, including any unsafe-cast or lint-disable rationale
- Commit plan status and any staging-boundary concerns
- Source-of-truth gaps that remain
- Issues encountered and how resolved
- State of the work: what's done, what's next

## What NOT to Do

- Do NOT [specific anti-pattern relevant to this task]
- Do NOT modify files outside your scope
- Do NOT add new dependencies without flagging
```

## Checklist Before Sending

Before dispatching a seed prompt, verify:

1. **Skills listed** — Are the right domain skills included?
2. **Context bundle complete** — Are dispatch packet, PRD/scoping artifact, dependency graph, HITL register, DoD checklist, artifact conventions, and review lanes included?
3. **Files specific** — Are file paths concrete, not vague?
4. **Criteria testable** — Can each acceptance criterion be verified?
5. **Conflicts addressed** — If parallel work, are boundaries clear?
6. **Context sufficient** — Does the engineer have enough background without needing to explore broadly?
7. **Artifact paths set** — Are diary, evidence, and decision-log locations specified?
8. **Anti-patterns noted** — Are known pitfalls called out?

## Design Engineer Variant

When spawning design engineers, ALWAYS add:

```
## Skills to Load

- /interface-craft
- /web-design-guidelines
- [any additional domain skills]
```

This is a hard rule — design engineers without these skills produce lower quality work.
