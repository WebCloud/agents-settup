# Container Isolation

## User Separation

Two non-root users with different privileges:

```dockerfile
# Create chrome user (uid 999) — runs Chrome, has NO secrets
RUN groupadd -r chrome --gid=999 && \
    useradd -r -g chrome --uid=999 --home-dir=/home/chrome --shell=/bin/bash chrome && \
    mkdir -p /home/chrome && chown chrome:chrome /home/chrome

# Create app user (uid 1000) — runs Bun server + agent-browser daemon, has secrets
RUN groupadd -r app --gid=1000 && \
    useradd -r -g app --uid=1000 --home-dir=/home/app --shell=/bin/bash app && \
    mkdir -p /home/app && chown app:app /home/app
```

## Why Two Users

- **Chrome (uid 999)**: Runs the browser process. Since it executes arbitrary page JavaScript, it must NOT have access to environment variables containing secrets. Linux process isolation ensures `chrome` user cannot read `app` user's environment.
- **App (uid 1000)**: Runs the Bun HTTP server and agent-browser daemon. Has access to env secrets (service auth tokens, etc.). Communicates with Chrome via CDP on localhost.

## Filesystem Permissions

```dockerfile
# Chrome gets its own temp/cache dirs
RUN mkdir -p /tmp/chrome-data /tmp/chrome-cache && \
    chown chrome:chrome /tmp/chrome-data /tmp/chrome-cache

# App owns the application directory
COPY --chown=app:app . /app
WORKDIR /app

# Chrome cannot read /app
RUN chmod 750 /app
```

## Process Launch

```dockerfile
# Entrypoint script runs as root briefly, then drops to app user
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
```

```bash
#!/bin/bash
# entrypoint.sh

# Start Chrome as chrome user (backgrounded)
su -s /bin/bash chrome -c "chromium \
  --headless \
  --disable-setuid-sandbox \
  --remote-debugging-address=127.0.0.1 \
  --remote-debugging-port=9222 \
  ${CHROME_FLAGS}" &

# Wait for Chrome CDP to be ready
until curl -s http://127.0.0.1:9222/json/version > /dev/null 2>&1; do
  sleep 0.1
done

# Start app server as app user
exec su -s /bin/bash app -c "bun run start"
```

## Security Properties

| Property                          | Enforcement                                                     |
| --------------------------------- | --------------------------------------------------------------- |
| Chrome can't read secrets         | Different UID — `chrome` can't read `app`'s /proc/{pid}/environ |
| Chrome can't write app files      | /app owned by `app` with 750 permissions                        |
| No privilege escalation           | `--security-opt=no-new-privileges` in Cloud Run                 |
| Process namespace isolation       | Cloud Run Gen2 provides per-instance microVM                    |
| No root processes in steady state | Entrypoint drops to `app` user after Chrome launch              |
