import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePortFromOutput } from '../scripts/lib/server.mjs';

test('parsePortFromOutput extracts port from opencode serve log', () => {
  const line = 'OpenCode server started at http://127.0.0.1:4567';
  assert.equal(parsePortFromOutput(line), 4567);
});

test('parsePortFromOutput returns null for unmatched lines', () => {
  assert.equal(parsePortFromOutput('some other log line'), null);
});
