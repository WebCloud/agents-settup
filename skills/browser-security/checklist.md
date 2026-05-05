# Defense-in-Depth Verification Checklist

## Layer 1: Container

- [ ] Chrome runs as `chrome` user (uid 999), not root
- [ ] App runs as `app` user (uid 1000), not root
- [ ] `/app` directory owned by `app` with 750 permissions
- [ ] Chrome user cannot read `/proc/{app-pid}/environ` (verify with `su chrome -c "cat /proc/1/environ"` — should fail)
- [ ] No setuid binaries except those required by Chrome
- [ ] `--security-opt=no-new-privileges` applied

## Layer 2: Network

- [ ] VPC firewall rule blocks egress to `169.254.169.254/32` (metadata)
- [ ] VPC firewall rule blocks egress to `10.0.0.0/8` (private class A)
- [ ] VPC firewall rule blocks egress to `172.16.0.0/12` (private class B)
- [ ] VPC firewall rule blocks egress to `192.168.0.0/16` (private class C)
- [ ] Chrome `--host-resolver-rules` blocks `169.254.169.254` and `metadata.google.internal`
- [ ] From inside container: `curl http://169.254.169.254/` fails
- [ ] From inside container: `curl https://example.com` succeeds (internet works)

## Layer 3: Chrome

- [ ] All production launch flags applied (see chrome-hardening.md)
- [ ] `--remote-debugging-address=127.0.0.1` — CDP on localhost only
- [ ] `--renderer-process-limit=4` — bounded renderers
- [ ] `--js-flags=--max-old-space-size=512` — V8 heap limited
- [ ] `--disable-extensions` — no extension loading
- [ ] `--disable-background-networking` — no phone-home

## Layer 4: CDP

- [ ] Port 9222 NOT exposed in Cloud Run service config (only 8080)
- [ ] CDP WebSocket not accessible from outside container
- [ ] `curl http://<service-url>:9222/` returns connection refused
- [ ] All CDP access goes through HTTP API layer

## Layer 5: Service

- [ ] Browser service has NO database credentials in env
- [ ] Browser service has NO API keys (Gemini, Firecrawl, etc.)
- [ ] Browser service requires IAM authentication (no `allUsers` invoker)
- [ ] Embeds service account has `roles/run.invoker` on browser service
- [ ] `containerConcurrency: 1` enforced (one browser per instance)
- [ ] Health check endpoint (`/health`) returns Chrome + daemon status
- [ ] Session timeout enforced (idle sessions reaped)

## Layer 6: agent-browser Built-in

- [ ] `AGENT_BROWSER_CONTENT_BOUNDARIES=1` set in production
- [ ] Domain allowlist configured for expected target domains
- [ ] Action policy configured if destructive actions should be gated
- [ ] `AGENT_BROWSER_MAX_OUTPUT` set to prevent context flooding
- [ ] Auth vault key (`AGENT_BROWSER_ENCRYPTION_KEY`) set if using stored credentials

## Verification Script

```bash
#!/bin/bash
echo "=== Security Verification ==="

# Container
echo -n "Chrome user exists: "
id chrome 2>/dev/null && echo "PASS" || echo "FAIL"

echo -n "App user exists: "
id app 2>/dev/null && echo "PASS" || echo "FAIL"

# Network
echo -n "Metadata blocked: "
curl -s --max-time 2 http://169.254.169.254/ > /dev/null 2>&1 && echo "FAIL" || echo "PASS"

# Chrome
echo -n "CDP on localhost: "
curl -s http://127.0.0.1:9222/json/version > /dev/null 2>&1 && echo "PASS (reachable)" || echo "FAIL (not running)"

echo -n "CDP not on 0.0.0.0: "
curl -s http://0.0.0.0:9222/json/version > /dev/null 2>&1 && echo "FAIL (exposed!)" || echo "PASS"

echo "=== Done ==="
```
