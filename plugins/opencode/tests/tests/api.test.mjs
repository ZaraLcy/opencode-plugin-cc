import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMessageBody, parseSessionResponse } from '../plugins/opencode/scripts/lib/api.mjs';

test('buildMessageBody wraps text in parts array', () => {
  const body = buildMessageBody('fix the bug');
  assert.deepEqual(body, { parts: [{ type: 'text', text: 'fix the bug' }] });
});

test('buildMessageBody includes model when provided', () => {
  const body = buildMessageBody('fix the bug', { model: 'anthropic/claude-sonnet-4-6' });
  assert.equal(body.model, 'anthropic/claude-sonnet-4-6');
});

test('parseSessionResponse extracts id and title', () => {
  const raw = { id: 'ses_abc123', title: 'My task', time: { created: 1234 } };
  const parsed = parseSessionResponse(raw);
  assert.equal(parsed.sessionId, 'ses_abc123');
  assert.equal(parsed.title, 'My task');
});
