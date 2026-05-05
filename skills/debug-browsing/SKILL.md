---
name: debug-browsing
description: Diagnose browsing agent session failures, loops, and tool/runtime issues using trace output, Convex logs, and browsingEvents verification. Use when asked to debug browsing sessions, inspect stuck loops, or explain why a browsing run failed.
allowed-tools: Bash(bun:*), Bash(cd:*), Bash(rg:*), Bash(sed:*)
---

# Debug Browsing Session

## When To Use

Use this skill when the user asks to investigate a browsing-agent run, session trace, or repeated/stuck browsing behavior.

## Progressive Disclosure

Read `resources/debug-browsing.md` for the complete procedure. Keep this file as the canonical operational playbook.

## Default Execution Pattern

1. If no session ID is provided, run trace with `--latest`.
2. Produce a concise timeline of actions and failures.
3. Identify root cause (looping, missing context, tool failure, bridge/write failure, timeout).
4. Validate Convex logs and `browsingEvents` for write-path integrity.
5. Recommend specific code/process fixes with priority.
