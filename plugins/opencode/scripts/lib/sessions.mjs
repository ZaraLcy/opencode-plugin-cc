import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

function getConfigDir() {
  return process.env.OPENCODE_PLUGIN_DIR ?? join(homedir(), '.opencode-plugin');
}

function sessionsDir() {
  return join(getConfigDir(), 'sessions');
}

async function ensureDirs() {
  await mkdir(sessionsDir(), { recursive: true });
}

export async function saveSession(sessionId, data) {
  await ensureDirs();
  const record = { ...data, sessionId, startedAt: data.startedAt ?? new Date().toISOString() };
  await writeFile(join(sessionsDir(), `${sessionId}.json`), JSON.stringify(record, null, 2));
}

export async function loadSession(sessionId) {
  const content = await readFile(join(sessionsDir(), `${sessionId}.json`), 'utf-8');
  return JSON.parse(content);
}

export async function findResumable(claudeSessionId) {
  await ensureDirs();
  const files = (await readdir(sessionsDir())).filter(f => f.endsWith('.json'));
  if (files.length === 0) return null;
  const sessions = await Promise.all(
    files.map(async f => {
      const content = await readFile(join(sessionsDir(), f), 'utf-8');
      return JSON.parse(content);
    })
  );
  const matching = sessions
    .filter(s => s.claudeSessionId === claudeSessionId)
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  return matching[0] ?? null;
}

export async function markCompleted(sessionId) {
  const record = await loadSession(sessionId);
  record.status = 'completed';
  record.completedAt = new Date().toISOString();
  await writeFile(join(sessionsDir(), `${sessionId}.json`), JSON.stringify(record, null, 2));
}

export async function markFailed(sessionId, error) {
  let record;
  try { record = await loadSession(sessionId); } catch { record = { sessionId }; }
  record.status = 'failed';
  record.error = String(error);
  record.completedAt = new Date().toISOString();
  await writeFile(join(sessionsDir(), `${sessionId}.json`), JSON.stringify(record, null, 2));
}
