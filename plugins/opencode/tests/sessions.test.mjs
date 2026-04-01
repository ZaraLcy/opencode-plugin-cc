import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Override CONFIG_DIR for tests
process.env.OPENCODE_PLUGIN_DIR = join(tmpdir(), `opencode-plugin-test-${Date.now()}`);

const { saveSession, loadSession, findResumable, markCompleted } = await import('../scripts/lib/sessions.mjs');

before(async () => {
  await mkdir(process.env.OPENCODE_PLUGIN_DIR, { recursive: true });
});

after(async () => {
  await rm(process.env.OPENCODE_PLUGIN_DIR, { recursive: true, force: true });
});

test('saveSession writes JSON file', async () => {
  await saveSession('ses_test1', { prompt: 'fix bug', claudeSessionId: 'claude_abc', status: 'running' });
  const loaded = await loadSession('ses_test1');
  assert.equal(loaded.prompt, 'fix bug');
  assert.equal(loaded.sessionId, 'ses_test1');
});

test('loadSession throws on missing session', async () => {
  await assert.rejects(() => loadSession('ses_missing'), { code: 'ENOENT' });
});

test('findResumable returns latest session for claudeSessionId', async () => {
  await saveSession('ses_old', { prompt: 'old task', claudeSessionId: 'claude_xyz', status: 'completed', startedAt: '2026-04-01T10:00:00Z' });
  await saveSession('ses_new', { prompt: 'new task', claudeSessionId: 'claude_xyz', status: 'completed', startedAt: '2026-04-01T11:00:00Z' });
  const found = await findResumable('claude_xyz');
  assert.equal(found.sessionId, 'ses_new');
});

test('findResumable returns null when no matching session', async () => {
  const found = await findResumable('claude_nonexistent');
  assert.equal(found, null);
});

test('markCompleted updates session status', async () => {
  await saveSession('ses_mark', { prompt: 'task', claudeSessionId: 'claude_abc', status: 'running' });
  await markCompleted('ses_mark');
  const loaded = await loadSession('ses_mark');
  assert.equal(loaded.status, 'completed');
});
