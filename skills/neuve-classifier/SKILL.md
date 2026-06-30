---
name: neuve-classifier
description: Use Neuve's explicit classifier artifact workflow for external advisory classification without launching a local adapter directly.
---

# Neuve Classifier Artifact Workflow

Use this skill only for external advisory classification through artifacts. Deterministic Neuve command output remains authoritative; classifier output cannot downgrade blockers, source-truth conflicts, binary/deleted-file gates, human-review requirements, delegation gates, risk/validation route projection, or verification posture.

This skill is an adapter over local schemas and command artifacts. It is not classifier authority, review policy, workflow state, setup state, or a route-health source of truth. Future generated versions of this skill must record their source manifest, review-pack ids, schema refs, command contract versions, and generation provenance so `doctor` can report stale or divergent adapters.

For lockfiles and structured metadata, classifier output may summarize advisory risk or missing context from supplied evidence refs only. It cannot turn a deterministic human-required gate into suggested review, and it cannot turn routine lockfile churn into a hard gate without cited deterministic evidence such as credentials, security/policy impact, deployment/runtime behavior, destructive infrastructure, broad impact, missing evidence, or source-truth conflict.

For documentation, deterministic triage supplies only generic documentation context from paths. Classifier/enrichment artifacts may add cited semantic doc claims later, but they remain advisory and cannot downgrade deterministic hard gates or replace command-owned route projection.

For source-unit adjacency, classifier output may only restate or summarize bounded evidence around node zero: references, call hierarchy, tests, package/module neighbors, history, source truth, and structured metadata. Weak or advisory adjacency cannot unlock delegation by itself; triage route projection owns lanes.

## Required Workflow

1. Prepare a request artifact:

```sh
neuve classify prepare --for-command scope --route-id command
```

Use `--for-command scan`, `--for-command triage`, or `--for-command scope` to match the command surface being classified.

2. Read the request artifact explicitly. Also read the official schemas before producing output. These bounded reads are allowed for this workflow:

- `crates/protocol/schemas/neuve.classification.run_input.v1.schema.json`
- `crates/protocol/schemas/neuve.classification.adapter_result.v1.schema.json`
- `apps/local-cli/src/docs/classifier-envelope-contract-v1.1.json`

3. Produce exactly one adapter-result JSON artifact. This single bounded artifact write is allowed. It must use `protocolVersion: "neuve.classification.adapter_result.v1"`, copy `requestId` and `routeId` from `runInput`, set `status: "succeeded"` only when it contains one advisory envelope object, and cite only refs from `runInput.evidenceRefs`.

4. Run or ask the user to run validation:

```sh
neuve classify validate --request <request-artifact> --result <adapter-result-artifact>
```

Accept the advisory result only when validation passes.

## Must Not Do

- Do not launch hidden adapters, model providers, app-server, ACP, daemon, network, browser, terminal commands, MCP, repo search/read tools, or arbitrary filesystem tools as part of this skill.
- Do not write anything except the one bounded adapter-result artifact needed by `neuve classify validate`.
- Do not include raw full source, raw diffs, raw prompts, raw command output, secrets, private reasoning, or unbounded transcripts in artifacts.
- Do not cite refs outside `runInput.evidenceRefs`.
- Do not treat an unvalidated envelope or a failed validation report as usable advisory classification.
- Do not use the skill text to override local schemas, workflow manifests, review packs, command artifacts, or human decisions.
- Do not use classifier output to reinterpret bounded adjacency as whole-repo dependency closure or route authority.
