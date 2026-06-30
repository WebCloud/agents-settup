---
name: workstream-scoping
description: Scope a development task or research workstream before implementation by defining correctness, source-of-truth clarity, HITL criteria, verification methods, type/lint/doc correctness gates, verifiable decomposition, DoD, dependency graph, dispatch packet, review lanes, commit plan, guardrails, decision-log rules, evidence artifacts, and review posture. Use before team-orchestration on ambiguous, multi-step, agentic, high-impact, or parallel work.
---

# Workstream Scoping

Use this skill before implementation when the task is ambiguous, multi-step, high-impact, agent-assisted, or likely to split into parallel workstreams.

The goal is to make correctness and verification explicit before agents start executing.

This is the highest-HITL phase of the workflow. Use it to interview the user or task owner when correctness, acceptance criteria, verification method, or definition of done is unclear. Do not push ambiguity downstream to implementation agents.

## Non-Negotiable Standard

Scoping is not a planning essay. It is a dispatch contract.

Do not mark a workstream ready for independent implementation unless the scope
is specific enough that an implementation agent can start without guessing:

- what behavior must change
- what behavior must not change
- which source of truth wins
- which files, packages, commands, and artifacts are in or out of scope
- which checks prove each slice
- which decisions are blocked, defaulted, logged, or waived
- where evidence, diary, decisions, reviews, and handover artifacts go

If the scope still contains vague phrases such as "improve", "make robust",
"clean up", "handle edge cases", "as appropriate", "investigate", or "TBD"
without concrete acceptance criteria and verification, mark the scope `Draft` or
`Blocked`. Do not silently translate vague language into implementation choices.

## Interview-First Protocol

Before producing the final scope, actively interview the user or task owner when
any correctness, product, architecture, data, or review criteria are unclear.
Prefer a short set of high-leverage questions over a long questionnaire.

Every interview must produce durable notes:

- answered decisions with exact user intent
- open questions
- proposed defaults
- assumptions agents may use if logged
- blockers that prevent dispatch
- areas requiring human judgment during review

Use concrete questions:

- "What observable behavior proves this is correct?"
- "What existing behavior must not change?"
- "What would make this unacceptable?"
- "Which source wins if docs, tickets, and current code disagree?"
- "Which examples or fixtures should define correctness?"
- "Which output should a reviewer see first?"
- "Which decisions may agents make, and which require you?"
- "What evidence artifact should exist at the end?"

If the user is unavailable, do not invent source-of-truth decisions. Either:

- mark the workstream `Blocked`, or
- mark it `Guarded` with proposed defaults, explicit assumptions, and review
  escalation. Guarded scopes are not ready for silent autonomous merge.

## Definition Of Ready

Dispatch readiness requires all of these to be true:

- no unresolved blocker is hidden inside prose
- every task slice has a correctness point, verification method, evidence
  artifact, approval path, and commit intent
- every required artifact path is exact
- every verification command is concrete or explicitly deferred with a reason
- all source-of-truth conflicts are resolved, escalated, or logged as HITL
- non-goals and forbidden files/systems are explicit
- implementation agents can identify write ownership and avoid conflicts
- strict-critique reviewers can validate the work without rereading the chat

If any item fails, the dispatch packet status must be `Draft`, `Blocked`, or
`Guarded`; it must not say ready.

## Core Questions

Answer these before dispatching implementers:

1. **Correctness:** What outcome must be true for this work to be correct?
2. **Source of truth:** Where does the desired outcome come from: user request, ticket, PRD, issue, design, existing behavior, tests, or code convention?
3. **Clarity:** Is the source of truth clear, partial, contradictory, or missing?
4. **Verifiability:** Which parts are easy to verify, proxy-verifiable, human-judgment-only, or unknown?
5. **Verification methods:** Which checks prove correctness: TDD/unit tests, integration tests, browser/E2E tests, typecheck, lint, static analysis, security scan, manual QA, screenshots, traces, logs, fixtures, or reviewer inspection? For behavior, deterministic tests are the primary proof and must include happy paths plus known, reasonable unhappy paths within scope.
6. **Definition of done:** What concrete exit criteria must be satisfied before implementation is considered complete?
7. **Type and lint correctness:** What type-system guarantees, lint rules, schema boundaries, unsafe-cast restrictions, and canonical SDK/framework/generated/crate types are required?
8. **Documentation correctness:** Which public, exported, major, lifecycle-sensitive, or non-obvious functions need TSDoc-style comments?
9. **Git history:** How should the work be split into granular, parseable commits for humans and agents?
10. **Decomposition:** How can broad work be split into smaller task slices with explicit verification points?
11. **Guardrails:** What files, commands, systems, repos, credentials, or data are in or out of bounds?
12. **Decision log:** What should agents decide autonomously, and what must be logged for later human review?
13. **Evidence:** What artifacts will prove the work was done correctly?
14. **Review posture:** How much human review and strict critique does the work need?
15. **Dependency graph:** Which slices can start now, which are blocked, and what upstream artifact or HITL decision unblocks them?
16. **HITL decision register:** Which open questions are true blockers, which have proposed defaults, and which assumptions must be logged if used?
17. **Dispatch readiness:** Can an implementation agent receive this scope without reconstructing missing context from chat?
18. **Artifact paths:** Where exactly should diary, evidence, decision-log, handover, and review artifacts be written?
19. **Review lanes:** Which strict-critique lanes and domain skills are required for each workstream or slice?
20. **Definition of ready:** Can the work be implemented without guessing, or must the scope remain Draft/Blocked/Guarded?
21. **Literature packet:** Which docs, tickets, commits, prior workstreams, whitepapers, skills, examples, and current behavior must implementers read, and why?
22. **Anti-sources:** Which legacy docs, stale behavior, old assumptions, or superseded decisions must not override this scope?

## HITL Criteria Definition

Scoping should actively pull missing criteria out of the user, ticket, PRD, design, or existing system before implementation starts.

Ask for human input when:

- the desired outcome is subjective or product-sensitive
- the acceptance criteria are missing, vague, or contradictory
- the verification method is unclear or too expensive
- the work changes security, data integrity, billing, auth, permissions, privacy, or public API behavior
- a task slice cannot be made objectively verifiable
- the agent would need to choose between materially different product or architecture directions

When asking, prefer concrete criteria questions:

- "What observable behavior should prove this is correct?"
- "Which existing behavior must not change?"
- "What would make this implementation unacceptable?"
- "Should this be verified with TDD, browser tests, manual review, or another method?"
- "What artifacts should exist at the end: tests, screenshots, logs, fixtures, traces, docs, or a reviewer note?"

If HITL is unavailable, mark the gap explicitly in the scoping artifact and set review posture to `Unknown` or `Guarded`.

## Source-Of-Truth Discipline

Classify every source used by the scope:

- **Primary:** authoritative for the requested outcome.
- **Supporting:** useful context but not allowed to override primary sources.
- **Legacy/current behavior:** describes what exists today; may be replaced.
- **Anti-source:** stale, superseded, misleading, or explicitly out of scope.
- **Unknown:** referenced but not yet inspected or not accessible.

When sources conflict, record:

- the conflicting claims
- which source wins
- who decided
- what reviewers must re-check
- whether implementation is blocked until the conflict is resolved

Do not let old docs, code comments, previous workstream titles, branch names, or
test behavior silently override the current scope. If current behavior is being
preserved, say so. If current behavior is being replaced, say so.

## Canonical Implementation And Type Research

Before implementation is marked ready, the scope must explicitly check for
canonical types, SDKs, framework APIs, generated schemas, protocol definitions,
or existing package/crate exports that already define the boundary being
changed. Do not let agents invent local protocol, transport, schema, or result
types until this research has been performed and logged.

For each affected typed boundary, record:

- the canonical source inspected, such as an official SDK, generated schema,
  crate API, package export, framework type, protocol spec, or existing shared
  project type
- the exact type, schema, trait, enum, helper, or API that should be reused
- why any local wrapper, narrowing helper, cast, adapter, or duplicate type is
  still necessary
- which verification proves the local code remains aligned with the canonical
  source, such as typecheck, schema parse, compile test, fixture compatibility,
  or SDK contract test

Default posture:

- Rust implementation should lean on crate APIs, enums, traits, typed result
  builders, and compiler-enforced ownership/lifetimes instead of stringly typed
  local mirrors.
- TypeScript implementation should import canonical SDK/generated/shared types
  at protocol and package boundaries, validate unknown data at the edge, and
  narrow into local domain types only after the boundary is checked.
- Local duplicate types are allowed only for intentionally smaller domain
  models or test doubles, and the scope must name the canonical source they
  intentionally differ from.

If canonical type research is skipped, unknown, or blocked, mark the dispatch
packet `Guarded` or `Blocked`. Do not claim the type/lint gate is satisfied by
hand-maintained lookalike types.

## Literature Packet

For implementation-ready workstreams, include a reading packet. This is the
minimum literature an implementing or reviewing agent must inspect.

Each entry must include:

- exact path, URL, ticket, commit, or artifact ref
- why it matters
- whether it is primary, supporting, legacy/current behavior, anti-source, or unknown
- what question it answers

Do not provide a bulk list of documents without purpose. A reading packet is a
map for correctness, not a bibliography.

## Verifier Matrix

Classify each meaningful task slice:

| Class | Meaning | Workflow |
|---|---|---|
| Easy to verify | Objective pass/fail exists | Automate and loop until passing |
| Proxy-verifiable | No direct truth, but good references exist | Compare against examples, snapshots, fixtures, previous behavior |
| Human judgment | Product, architecture, security, UX, or risk acceptance | Preserve evidence and route to human reviewer |
| Unknown | Source of truth or verification path is unclear | Ask, research, or log assumptions before execution |

## Verification Method Menu

Choose verification methods during scoping, not after implementation.

Use these as defaults:

| Method | Use When | Artifact |
|---|---|---|
| TDD/unit test | Pure logic, parsers, classifiers, scoring, transforms, policy rules | Failing-then-passing test or named test case |
| Integration test | Multiple services/modules must cooperate | Test run output, fixture, seeded scenario |
| Browser/E2E test | User-visible behavior, forms, navigation, auth, rendering, regressions on existing or already-scoped routes | Playwright/browser trace, screenshot, or video |
| Typecheck/lint/static analysis | API contracts, dead code, style gates, type safety | Command output |
| Security review/scan | Auth, permissions, injection, secrets, data exposure, sandbox boundaries | Finding log, threat note, or scan output |
| Manual QA | Experience quality, ambiguous UX, judgment-heavy product behavior | Checklist result with screenshots or notes |
| Reviewer inspection | Architecture, maintainability, convention, risk acceptance | Review note tied to files or design decision |

Do not use generic "tests pass" as the only verification method for a task slice unless the tests directly exercise the correctness target.

For user-visible work, distinguish deterministic behavior proof from Visual Proof:

- Deterministic tests are the primary proof for behavior and should cover the happy path plus known, reasonable unhappy paths within the approved scope.
- Visual Proof is a screenshot or trace of an existing user-facing route, or a route that is already part of the scoped product work.
- Do not scope proof-only QA harnesses, hidden routes, synthetic UI surfaces, or special APIs solely to manufacture Visual Proof.
- If no existing/scoped route exists, record Visual Proof as not applicable and use deterministic tests plus a bounded, validated, fingerprinted test-output artifact as substitute proof.

## Correctness Gates

Correctness includes the code's static guarantees and collaboration surface, not only runtime behavior.

Scope these gates explicitly:

- **Type system:** Require the strongest local types the stack can reasonably express. Avoid `any`, broad `unknown`, non-null assertions, unchecked casts, stringly typed variants, and optional fields unless they are justified by the source of truth or external boundary.
- **Schema boundaries:** Parse and validate untrusted or external data at the edge. Internal code should operate on narrowed, well-founded types.
- **Lint/static analysis:** Identify the lint/static commands that must pass. A disabled rule, inline ignore, or broad cast must be logged with the invariant that makes it safe.
- **TSDoc-style documentation:** Major functions need comments that explain behavior, invariants, lifecycle, side effects, error behavior, or return semantics. Do not write comments that merely restate parameter names or obvious code.
- **DevX for collaborators:** Name functions, types, test fixtures, and artifacts so a reviewer or agent can trace intent without reconstructing the whole task from chat.

Use `/Users/vinicius/code/devtools/devtools-frontend` as the documentation quality bar: concise comments on public classes, non-obvious adapters, lifecycle-sensitive methods, return semantics, and footguns. For example, DevTools documents why a Puppeteer connection adapter rewrites sessions, warns when an option can break UI bounds, and states when methods intentionally avoid dispatching update events.

Document a function when it is:

- exported or part of a public module surface
- a major orchestration, policy, lifecycle, security, data, or concurrency function
- a non-obvious adapter between systems
- responsible for narrowing, validating, transforming, or classifying data
- intentionally surprising, side-effectful, or constrained by an invariant
- likely to be edited by future agents

## Git History Plan

Scoping must define how the work should become parseable git history.

Prefer small commits where each commit:

- maps to one task slice or one coherent refactor
- has a message that states intent and affected surface
- leaves the repo in a typechecked and reviewable state
- does not mix mechanical formatting, behavior change, tests, and docs unless the slice is tiny
- carries its own evidence when feasible

If commits cannot be created during the current workflow, still produce a commit plan in the scoping artifact so a later agent or human can stage the patch coherently.

## Dispatch Readiness Gate

For multi-workstream, parallel, high-impact, or agent-orchestrated work, scoping is not complete until implementation can be dispatched through `team-orchestration` without the lead reconstructing context from chat.

Create or update these handoff artifacts:

- **Dependency graph:** what can start now, what is blocked, blocker type, and dependency edges.
- **HITL decision register:** concrete questions, proposed defaults, affected workstreams, and status.
- **Artifact conventions:** exact diary, evidence, decision-log, review, handover, and fixture paths.
- **Dispatch packet:** one per implementation workstream, containing the seed-prompt-ready handoff.
- **Review lanes:** strict-critique lanes, domain skills, and review output paths.

A dispatch packet must include:

- scoping artifact path
- dependency status and blockers
- HITL decisions required before coding
- skills to load
- files/packages/crates likely in scope
- files/packages/crates forbidden
- acceptance criteria
- artifact paths for diary, decisions, evidence, and reviews
- review lanes
- conflict avoidance instructions
- mandatory reading/literature packet with source classification
- exact status: Ready, Draft, Blocked, or Guarded

If any of these are missing, mark the workstream as `Draft` or `Blocked`, not ready for independent agents.

Dispatch packets must not contain placeholders such as `TBD`, `as needed`,
`appropriate tests`, or `relevant files` unless those phrases are immediately
followed by a blocker, owner, and decision path.

## Verifiable Decomposition

Each task slice must include a verification point. A slice is underspecified if it cannot answer:

- what will change
- what must remain true
- how the slice will be verified
- what artifact proves verification happened
- who can approve it: agent, reviewer, or human owner
- which files/packages/crates are likely owned by the slice
- which adjacent files must be checked for parity
- what decisions are forbidden inside the slice

Prefer decomposition like this:

```markdown
- Slice: Add posture classifier for source-of-truth clarity
  Correctness point: Given clear, partial, contradictory, and missing inputs, classifier returns expected posture.
  Verification method: TDD/unit test with named fixtures.
  Evidence artifact: `classifier.test.ts` output and fixture table.
  Approval: agent can self-loop; reviewer must inspect edge cases.
```

Avoid decomposition like this:

```markdown
- Improve posture classifier
```

Also avoid:

```markdown
- Add tests as appropriate
- Refactor source handling
- Make output clearer
- Investigate LSP integration
- Clean up artifacts
```

Unless each item is expanded into observable behavior, verification, evidence,
ownership, and approval, it is not dispatch-ready.

## Required Scoping Artifact

Produce a short artifact before implementation:

```markdown
# Scope: [TASK_ID] — [TITLE]

## Correctness Target
- ...

## Source Of Truth
- Primary:
- Supporting:
- Legacy/current behavior:
- Anti-sources:
- Clarity: clear / partial / contradictory / missing
- Gaps:

## Literature Packet
- Path/ref:
  - Classification:
  - Why it matters:
  - Question answered:

## Verifiability Map
- Easy to verify:
- Proxy-verifiable:
- Human judgment:
- Unknown:

## Verification Methods
- TDD/unit:
- Integration:
- Browser/E2E:
- Typecheck/lint/static:
- Security:
- Manual QA:
- Reviewer inspection:

## Definition Of Done
- Required checks:
- Required artifacts:
- Required approvals:
- Definition of ready status:
- Explicit non-goals:

## Type, Lint, And Documentation Gates
- Canonical type/source research:
- Type-system expectations:
- Schema/edge validation:
- Lint/static commands:
- Allowed unsafe casts or ignores:
- Major functions requiring TSDoc:
- DevTools-style documentation notes:

## Decomposition
- Task slice 1:
  - Correctness point:
  - Likely write/read scope:
  - Must not change:
  - Verification method:
  - Evidence artifact:
  - Type/lint/doc gate:
  - Commit intent:
  - Approval:
- Task slice 2:
  - Correctness point:
  - Verification method:
  - Evidence artifact:
  - Type/lint/doc gate:
  - Commit intent:
  - Approval:

## Guardrails
- In scope:
- Out of scope:
- Commands/services allowed:
- Commands/services forbidden:

## Decision Log Rules
- Agent may decide:
- Agent must ask:
- Agent may proceed but must log:

## Evidence Plan
- Tests/checks:
- Artifacts:
- Review evidence:

## Dependency And Dispatch Plan
- Can start now:
- Blocked by:
- Dependency edges:
- Parallelization constraints:
- Dispatch packet path:

## HITL Decision Register
- Blocking decisions:
- Proposed defaults:
- Assumptions agents may use if logged:
- Waived or deferred decisions:
- Questions to ask user before dispatch:

## Scoping Output Artifacts
- Scope artifact path:
- Criteria/interview notes:
- Open questions:
- Follow-up artifacts to create during implementation:
- Dependency graph:
- HITL decisions:
- Dispatch packets:
- Artifact conventions:
- Review lanes:

## Git History Plan
- Commit slices:
- Suggested commit messages:
- Staging boundaries:
- Mechanical changes to isolate:

## Review Posture
- Routine / Mechanical / Focused / High Impact / Guarded / Unknown
- Why:
- Required reviewers or review lanes:
```

## Artifact Rules

The scoping task must leave durable artifacts that implementation and review agents can consume.

At minimum, create or update:

- the scoping artifact
- criteria/interview notes when HITL occurred
- a list of open questions or assumptions
- a DoD checklist
- a decomposition table with verification points
- type/lint/documentation gates
- a commit plan with staging boundaries
- an evidence plan naming expected artifact paths or artifact types
- a dependency graph for multi-workstream or parallel implementation
- a HITL decision register separating blockers from proposed defaults
- a literature packet with source classifications
- a definition-of-ready status
- dispatch packets for work intended for independent agents
- review lanes and required domain skills for strict critique
- exact diary, evidence, decision-log, and review artifact paths

For larger workstreams, place artifacts under a predictable folder:

```text
docs/workstreams/[TASK_ID]/
  scope.md
  criteria.md
  evidence-plan.md
  dependency-graph.md
  hitl-decisions.md
  dispatch-packet.md
  review-lanes.md
  decisions.md
  literature.md
```

If the repository already has a project-specific diary, handover, or review folder convention, use that instead and link the paths from the scoping artifact.

## Handoff To Team Orchestration

Pass the scoping artifact into `team-orchestration` seed prompts. Every implementing engineer should receive:

- dispatch packet path
- correctness target
- source-of-truth gaps
- verifiability map
- verification methods
- definition of done
- type/lint/documentation gates
- commit plan
- guardrails
- decision-log rules
- evidence plan
- review posture
- dependency status and blockers
- HITL decisions required before coding
- diary, evidence, decision-log, and review paths
- conflict avoidance instructions

If the scoping artifact says a slice is "Unknown" or "Human judgment", do not let an agent silently auto-merge or self-approve it.

Do not dispatch an implementation agent from a PRD alone when the work is parallel, ambiguous, high-impact, or multi-package. Create a dispatch packet first.

## Handoff To Strict Critique

Reviewers must validate:

- implementation matches the correctness target
- source-of-truth claims are supported
- easy-to-verify slices were actually verified
- selected verification methods match the risk and correctness target
- definition of done is satisfied or explicitly waived by a human
- type/lint/documentation gates were satisfied or explicitly waived
- git history is granular and parseable, or the commit plan is preserved for later staging
- proxy-verifiable slices used appropriate references
- human-judgment slices were escalated
- decision logs exist for autonomous choices
- evidence artifacts are inspectable and not just asserted
- dependency and HITL blockers were respected
- dispatch packet matched the actual implementation scope
- review lanes were appropriate and independently executed
