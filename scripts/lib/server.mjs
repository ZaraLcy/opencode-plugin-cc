import { readFile, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { spawn } from 'node:child_process';

function getConfigDir() {
  return process.env.OPENCODE_PLUGIN_DIR ?? join(homedir(), '.config', 'opencode-plugin');
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
export async function startServer(port = 4567) {
  const existing = await getServerStatus();
  if (existing.running) return existing;

  return new Promise((resolve, reject) => {
    const child = spawn('opencode', ['serve', '--port', String(port)], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) reject(new Error('opencode serve did not start within 10 seconds'));
    }, 10_000);

    function onData(data) {
      const lines = String(data).split('\n');
      for (const line of lines) {
        const p = parsePortFromOutput(line);
        if (p) {
          resolved = true;
          clearTimeout(timeout);
          const record = { pid: child.pid, port: p, startedAt: new Date().toISOString() };
          writeFile(serverFile(), JSON.stringify(record, null, 2))
            .then(() => resolve({ running: true, ...record }))
            .catch(reject);
          child.stdout.removeListener('data', onData);
          child.stderr.removeListener('data', onData);
        }
      }
    }

    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('error', reject);
    child.unref();
  });
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
