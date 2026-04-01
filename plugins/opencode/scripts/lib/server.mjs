import { readFile, writeFile, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { spawn } from 'node:child_process';

function getConfigDir() {
  return process.env.OPENCODE_PLUGIN_DIR ?? join(homedir(), '.opencode-plugin');
}

function serverFile() {
  return join(getConfigDir(), 'server.json');
}

/**
 * Parses the port number from opencode serve stdout/stderr.
 * Handles lines like: "OpenCode server started at http://127.0.0.1:4567"
 */
export function parsePortFromOutput(line) {
  const match = line.match(/:(\d{4,5})\s*$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Returns current server status from server.json.
 */
export async function getServerStatus() {
  try {
    const data = JSON.parse(await readFile(serverFile(), 'utf-8'));
    try {
      process.kill(data.pid, 0);
      return { running: true, pid: data.pid, port: data.port, startedAt: data.startedAt };
    } catch {
      await unlink(serverFile()).catch(() => {});
      return { running: false };
    }
  } catch {
    return { running: false };
  }
}

/**
 * Starts opencode serve. Idempotent — returns existing status if already running.
 */
async function waitForHttp(url, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return true; // server is up
    } catch { /* not ready yet */ }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

export async function startServer(port = 4567) {
  const existing = await getServerStatus();
  if (existing.running) return existing;

  const child = spawn('opencode', ['serve', '--port', String(port)], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();

  const baseUrl = `http://127.0.0.1:${port}`;
  const ready = await waitForHttp(`${baseUrl}/session`);
  if (!ready) throw new Error(`opencode serve did not start within 15 seconds on port ${port}`);

  const record = { pid: child.pid, port, startedAt: new Date().toISOString() };
  await mkdir(getConfigDir(), { recursive: true });
  await writeFile(serverFile(), JSON.stringify(record, null, 2));
  return { running: true, ...record };
}

/**
 * Stops the running server.
 */
export async function stopServer() {
  const status = await getServerStatus();
  if (!status.running) return;
  process.kill(status.pid, 'SIGTERM');
  await unlink(serverFile()).catch(() => {});
}
