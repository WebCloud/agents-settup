---
name: cdp-session
description: Use Chrome DevTools Protocol with agent-browser for browser testing, debugging, and persistent interactive sessions.
allowed-tools: Bash(bun:*), Bash(agent-browser:*)
---

# CDP Session for Testing

Use Chrome DevTools Protocol (CDP) to interact with a browser for testing and debugging.

## Quick Start

```bash
# 1. Launch Chrome with CDP enabled
bun ~/.agents/skills/agent-browser/scripts/cdp.ts          # Port 9222 (default)
bun ~/.agents/skills/agent-browser/scripts/cdp.ts 9333     # Custom port
bun ~/.agents/skills/agent-browser/scripts/cdp.ts --headless  # Headless mode

# 2. Connect with agent-browser
agent-browser --cdp 9222 open https://example.com

# 3. Check available commands
agent-browser --help
```

## What is CDP?

Chrome DevTools Protocol allows programmatic control of Chrome/Chromium browsers. When Chrome runs with `--remote-debugging-port`, it exposes a WebSocket endpoint that tools can connect to.

## Chrome for Testing

This script uses [Chrome for Testing](https://developer.chrome.com/blog/chrome-for-testing), installed at `~/code/.better-coding-agents/tools/chrome/`.

The script automatically:

- Finds the installed Chrome for Testing binary
- Enables remote debugging on the specified port
- Uses a dedicated user data directory (`~/.chrome-cdp-profile`)
- Skips first-run dialogs and default browser prompts

## When to Use

- **Debugging test failures** - Connect to see what the browser sees
- **Exploring web apps** - Navigate Linear, Slack, or target apps interactively
- **Step-by-step automation** - Commands persist between calls
- **Inspecting state** - Check network requests, cookies, console logs

## Tips

- **Port conflicts**: If 9222 is busy, use another port
- **Multiple sessions**: Run multiple Chrome instances on different ports
- **Persistence**: Browser stays open between commands - useful for debugging
- **Combine with agent-browser**: Use `snapshot -i` to see interactive elements with refs
