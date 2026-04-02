import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSSELines, extractText, renderSetupReport } from '../plugins/opencode/scripts/lib/render.mjs';

test('parseSSELines extracts text events from ndjson stream', async () => {
  const lines = [
    '{"type":"step_start","sessionID":"ses_abc","part":{}}',
    '{"type":"text","sessionID":"ses_abc","part":{"text":"Hello world"}}',
    '{"type":"text","sessionID":"ses_abc","part":{"text":"!"}}',
    '{"type":"step_finish","sessionID":"ses_abc","part":{"reason":"stop"}}',
  ];
  const events = await parseSSELines(lines);
  assert.equal(events.filter(e => e.type === 'text').length, 2);
});

test('extractText joins all text parts', () => {
  const parts = [
    { type: 'text', text: 'Hello ' },
    { type: 'step-start' },
    { type: 'text', text: 'world' },
  ];
  assert.equal(extractText(parts), 'Hello world');
});

test('renderSetupReport formats ready state', () => {
  const info = { ready: true, codex: { detail: 'opencode 1.3.13' }, sessionRuntime: { mode: 'serve', port: 4567 } };
  const out = renderSetupReport(info);
  assert.match(out, /ready/i);
  assert.match(out, /4567/);
});

test('renderSetupReport formats not-ready state with install hint', () => {
  const info = { ready: false, opencode: { available: false } };
  const out = renderSetupReport(info);
  assert.match(out, /npm install -g @openai\/opencode/i);
});
