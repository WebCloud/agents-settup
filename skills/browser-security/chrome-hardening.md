# Chrome Hardening

## Production Launch Flags

```typescript
const CHROME_FLAGS = [
  "--headless", // No display server needed
  "--disable-setuid-sandbox", // Gen2 microVM provides isolation — setuid sandbox unnecessary and breaks in containers
  "--disable-dev-shm-usage", // Use /tmp instead of /dev/shm (limited in containers)
  "--disable-gpu", // No GPU in Cloud Run
  "--disable-extensions", // No extension loading — reduces attack surface
  "--disable-background-networking", // No background network requests (update checks, safe browsing)
  "--disable-sync", // No Chrome Sync
  "--disable-translate", // No Google Translate
  "--disable-default-apps", // No default apps/bookmarks
  "--no-first-run", // Skip first-run wizard
  "--disable-component-update", // No component updater — deterministic builds
  "--renderer-process-limit=4", // Limit renderer processes to prevent resource exhaustion
  "--js-flags=--max-old-space-size=512", // V8 heap limit per renderer (512MB)
  "--remote-debugging-address=127.0.0.1", // CRITICAL: CDP only on localhost
  "--host-resolver-rules=MAP 169.254.169.254 ~NOTFOUND, MAP metadata.google.internal ~NOTFOUND",
  // ^ SSRF protection: block metadata endpoint at DNS level
];
```

## Flag Categories

### Isolation

- `--disable-setuid-sandbox`: Safe in Gen2 (microVM provides hardware isolation). Required because container doesn't have setuid binary.
- `--disable-extensions`: No extension code execution.
- `--renderer-process-limit=4`: Caps parallel renderers. Each page gets a process; this limits memory blast radius.

### Resource Control

- `--disable-dev-shm-usage`: Docker default `/dev/shm` is 64MB. This flag uses `/tmp` instead.
- `--js-flags=--max-old-space-size=512`: Per-renderer V8 heap limit. With 4 renderers, worst case = 2GB V8 memory.
- `--disable-gpu`: No GPU API calls — eliminates WebGL attack surface.

### Network Hardening

- `--disable-background-networking`: Prevents Chrome from phoning home (safe browsing, update checks, etc.)
- `--host-resolver-rules`: DNS-level SSRF protection. `~NOTFOUND` causes Chrome to treat the hostname as unresolvable.
- `--remote-debugging-address=127.0.0.1`: CDP bound to loopback only.

### Determinism

- `--no-first-run`, `--disable-default-apps`, `--disable-sync`, `--disable-translate`, `--disable-component-update`: Prevent any first-run behavior or background updates that could change behavior between deploys.

## Sandbox Modes

| Mode                   | Flag                       | When                                                                  |
| ---------------------- | -------------------------- | --------------------------------------------------------------------- |
| No sandbox             | `--no-sandbox`             | NEVER in production                                                   |
| Disable setuid sandbox | `--disable-setuid-sandbox` | Use this — Gen2 provides VM isolation                                 |
| Full sandbox           | (default)                  | Only works if setuid binary installed — not recommended in containers |

## Chrome Installation (Dockerfile)

```dockerfile
# Install Chrome dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    && rm -rf /var/lib/apt/lists/*
```
