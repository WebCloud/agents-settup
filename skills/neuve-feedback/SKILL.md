---
name: neuve-feedback
description: Use neuve feedback to record bounded local AX/product feedback from review dogfooding, summarize recent events, and link command artifacts without exposing raw code.
---

# Neuve Feedback

Use this skill whenever Neuve command output helps, misleads, is slow, lacks a needed signal, has awkward formatting, or creates review workflow friction. Feedback is part of dogfooding and product calibration.

Feedback is not a review verdict. It records how a local command behaved for a reviewer.

## First Commands

Record one bounded event:

```sh
neuve feedback record \
  --kind focus-usefulness \
  --rating partially-helped \
  --command triage \
  --target checkout-review \
  --artifact .neuve-artifact/triage-...json \
  --note "Immediate-focus table was useful, but focused blame did not name the source gap."
```

Inspect recent feedback:

```sh
neuve feedback summary
neuve feedback summary --limit 20
```

If feedback recording fails because local consent or initialization is missing, record that failure in the review notes as AX friction and continue.

## Useful Fields

Choose `--kind` for the main product signal: focus usefulness, source truth, blockers, review outcome, or performance pain. Choose `--rating` to express the outcome in the command's accepted qualitative terms, such as helped, partially-helped, confusing, wrong, painful, or aligned.

Use `--command` for the command family: `scan`, `sources`, `triage`, `checkpoints`, `artifacts`, `feedback`, `doctor`, or `warm`. Use `--target` for a lane, path, source id, review phase, or artifact ref. Use `--artifact` when the feedback concerns a specific `.neuve-artifact/*` output.

## What To Record

In a review evidence file or lane review, record:

- Commands run and artifact refs observed.
- Whether each command changed review focus.
- Value add: what became faster, clearer, or easier to verify.
- Sticking points: slow commands, unclear labels, missing source truth, poor ranking, broad blockers, artifact friction, or misleading next commands.
- Format feedback: brief output, tables, grouped blockers, artifact footers, `--details`, `--blame`, `--focus`, and desired Markdown or glanceable artifacts.
- Backlog signals: concrete product improvements suggested by reviewer experience.

## Artifacts And Evidence

`feedback record` writes a row to `.neuve/metadata.sqlite` and a `.neuve-artifact/feedback-record-*.json` artifact. `feedback summary` writes `.neuve-artifact/feedback-summary-*.json`.

Reference feedback artifacts from review notes when available. Do not paste full event JSON unless a human explicitly asks for it.

## Data Restraint

Keep notes short, local-only, and bounded. Mention the command behavior and artifact ref, not the full code or source text.

## Must Not Use For

- Do not use feedback as proof that a review finding is correct.
- Do not store raw diffs, raw source bodies, secrets, credentials, private reasoning, or long transcripts.
- Do not use feedback to bypass strict-critique findings or approval gates.
- Do not record speculative criticism without naming the command, target, and artifact when available.
- Do not treat summary counts as product truth without reading representative events.
