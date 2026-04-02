import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildReviewPrompt } from '../plugins/opencode/scripts/lib/git.mjs';

test('buildReviewPrompt includes diff in prompt', () => {
  const prompt = buildReviewPrompt('diff --git a/foo.js\n+added line');
  assert.match(prompt, /diff --git/);
  assert.match(prompt, /review/i);
});

test('buildReviewPrompt handles empty diff', () => {
  const prompt = buildReviewPrompt('');
  assert.match(prompt, /no changes/i);
});
