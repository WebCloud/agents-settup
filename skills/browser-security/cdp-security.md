# CDP Security

## Chrome DevTools Protocol Exposure

CDP gives full browser control — navigation, JS execution, cookie access, file system access. It MUST NOT be exposed outside the container.

## Binding Rules

```
--remote-debugging-address=127.0.0.1
--remote-debugging-port=9222
```

- **127.0.0.1 ONLY**: CDP listens on loopback. Not `0.0.0.0`, not the container's network interface.
- **Port 9222**: Standard CDP port. Only agent-browser daemon connects to it (runs as `app` user on same container).

## Verification

```bash
# From inside container — should work
curl -s http://127.0.0.1:9222/json/version | jq .Browser

# From outside container — should NOT be reachable
# Cloud Run only exposes containerPort (8080), not 9222
curl -s http://browser-service.run.app:9222/ # Connection refused
```

## Session Isolation

Each agent-browser session gets:

- Separate browser context (isolated cookies, localStorage, IndexedDB, cache)
- Unique session name (`--session <name>`)
- No shared state between sessions

```bash
# Two isolated sessions
agent-browser --session user-a open https://site.com
agent-browser --session user-b open https://site.com
# user-a's cookies are invisible to user-b
```

## CDP Endpoint Protection

The browser service HTTP API proxies CDP commands — it does NOT expose raw CDP:

```
Client → HTTP POST /sessions/:id/execute → BrowserService → agent-browser CLI → CDP → Chrome
```

Direct CDP WebSocket access is never exposed. The HTTP API:

1. Validates session ownership
2. Rate-limits commands
3. Logs all operations
4. Restricts to agent-browser command vocabulary (no raw CDP protocol access)

## What CDP Can Do (Why It's Dangerous)

| CDP Domain           | Capability           | Risk           |
| -------------------- | -------------------- | -------------- |
| `Page.navigate`      | Navigate to any URL  | SSRF           |
| `Runtime.evaluate`   | Execute arbitrary JS | XSS/data exfil |
| `Network.getCookies` | Read all cookies     | Session hijack |
| `IO.read`            | Read files from disk | Data exfil     |
| `Browser.getVersion` | Fingerprint Chrome   | Info leak      |

This is why CDP must be localhost-only and behind our HTTP API layer.
