#!/usr/bin/env bun
/**
 * Launch Chrome for Testing with CDP (Chrome DevTools Protocol) enabled.
 *
 * Usage:
 *   bun .claude/skills/agent-browser/scripts/cdp.ts [port] [--headless]
 *
 * Examples:
 *   bun .claude/skills/agent-browser/scripts/cdp.ts          # Port 9222, headed
 *   bun .claude/skills/agent-browser/scripts/cdp.ts 9333     # Port 9333, headed
 *   bun .claude/skills/agent-browser/scripts/cdp.ts --headless
 *   bun .claude/skills/agent-browser/scripts/cdp.ts 9333 --headless
 */

import { spawn } from "bun";
import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CHROME_BASE = join(homedir(), "code/.better-coding-agents/tools/chrome");

async function findChromeBinary(): Promise<string> {
  if (!existsSync(CHROME_BASE)) {
    console.error(`Chrome for Testing not found at ${CHROME_BASE}`);
    console.error(
      "Install it from: https://developer.chrome.com/blog/chrome-for-testing",
    );
    process.exit(1);
  }

  // Find the version directory (e.g., mac_arm-144.0.7559.59)
  const entries = await Array.fromAsync(
    new Bun.Glob("mac_arm-*/chrome-mac-arm64").scan({
      cwd: CHROME_BASE,
      onlyFiles: false,
    }),
  );

  if (entries.length === 0) {
    console.error("No Chrome for Testing installation found");
    process.exit(1);
  }

  // Use the first (or latest) version found
  const chromePath = join(
    CHROME_BASE,
    entries[0],
    "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
  );

  if (!existsSync(chromePath)) {
    console.error(`Chrome binary not found at ${chromePath}`);
    process.exit(1);
  }

  return chromePath;
}

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const headless = args.includes("--headless");
  const portArg = args.find((arg) => !arg.startsWith("--"));
  const port = portArg ? parseInt(portArg, 10) : 9222;

  if (isNaN(port)) {
    console.error(`Invalid port: ${portArg}`);
    process.exit(1);
  }

  const chromeBinary = await findChromeBinary();
  const userDataDir = join(homedir(), ".chrome-cdp-profile");

  const chromeArgs = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
  ];

  if (headless) {
    chromeArgs.unshift("--headless");
  }

  console.log(
    `Starting Chrome for Testing on CDP port ${port}${headless ? " (headless)" : ""}...`,
  );
  console.log(`Connect with: agent-browser --cdp ${port} open <url>`);

  const proc = spawn([chromeBinary, ...chromeArgs], {
    stdout: "inherit",
    stderr: "inherit",
  });

  // Handle clean shutdown
  process.on("SIGINT", () => {
    proc.kill();
    process.exit(0);
  });

  await proc.exited;
}

main();
