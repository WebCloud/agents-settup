---
name: browser-security
description: Browser sandboxing, CDP security, SSRF prevention, container isolation, and inter-service auth. Use when implementing browser automation services, hardening Chrome containers, or reviewing browser security.
allowed-tools: Bash, Read, Grep, Glob
---

# Browser Security

Defense-in-depth for self-hosted Chrome in Cloud Run containers.

## Threat Model

| Threat                  | Vector                                      | Mitigation                                       |
| ----------------------- | ------------------------------------------- | ------------------------------------------------ |
| **SSRF**                | Chrome fetches internal metadata/services   | VPC firewall + Chrome resolver rules             |
| **Secrets leakage**     | Chrome process reads env vars               | Separate user (chrome uid:999 has no env access) |
| **CDP exposure**        | Remote debugging port accessible externally | Bind to 127.0.0.1 only                           |
| **Resource exhaustion** | Chrome OOM / CPU spike                      | containerConcurrency:1 + memory/CPU limits       |
| **XSS via Chrome**      | Malicious page JS escalates                 | Separate container = no app secrets reachable    |
| **Session hijacking**   | Shared browser state between users          | Session isolation per agent-browser `--session`  |

## Defense Layers

```
Cloud Run Gen2 microVM (hardware isolation)
  └─ Container (process namespace isolation)
       ├─ App user (uid 1000) — has secrets, runs agent-browser daemon
       ├─ Chrome user (uid 999) — NO secrets, sandboxed
       └─ VPC firewall — blocks metadata + private IPs
            └─ Chrome resolver rules — blocks metadata hostnames
                 └─ agent-browser built-in — domain allowlist, action policy
```

## agent-browser Built-in Security (v0.15.0+)

In addition to container-level isolation, agent-browser provides opt-in security features:

- **Content boundaries**: `AGENT_BROWSER_CONTENT_BOUNDARIES=1` — wraps page output in nonce-tagged markers to prevent prompt injection
- **Domain allowlist**: `AGENT_BROWSER_ALLOWED_DOMAINS="example.com,*.example.com"` — restricts navigation, sub-resource requests, WebSocket/EventSource
- **Action policy**: `AGENT_BROWSER_ACTION_POLICY=./policy.json` — gates destructive actions (`{"default":"deny","allow":["navigate","snapshot","click"]}`)
- **Output limits**: `AGENT_BROWSER_MAX_OUTPUT=50000` — prevents context flooding from large pages
- **Auth vault**: Encrypted credential storage with `AGENT_BROWSER_ENCRYPTION_KEY` — LLM never sees passwords

## Quick Reference

| Topic                  | File                                             |
| ---------------------- | ------------------------------------------------ |
| Chrome launch flags    | [chrome-hardening.md](chrome-hardening.md)       |
| Docker user separation | [container-isolation.md](container-isolation.md) |
| Cloud Run Gen2 config  | [cloud-run-browser.md](cloud-run-browser.md)     |
| SSRF prevention        | [network-security.md](network-security.md)       |
| CDP binding/isolation  | [cdp-security.md](cdp-security.md)               |
| Inter-service auth     | [service-auth.md](service-auth.md)               |
| Verification checklist | [checklist.md](checklist.md)                     |
