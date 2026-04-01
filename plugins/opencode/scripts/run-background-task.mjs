#!/usr/bin/env node
// Called by companion as: node run-background-task.mjs <baseUrl> <sessionId> <prompt...>
import { sendMessageForeground } from './lib/api.mjs';
import { parseSSELines, extractText } from './lib/render.mjs';
import { markCompleted, markFailed } from './lib/sessions.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

const [, , baseUrl, sessionId, ...promptParts] = process.argv;
const prompt = promptParts.join(' ');

function getConfigDir() {
  return process.env.OPENCODE_PLUGIN_DIR ?? join(homedir(), '.opencode-plugin');
}

try {
  const lines = await sendMessageForeground(baseUrl, sessionId, prompt);
  const outputFile = join(getConfigDir(), 'sessions', `${sessionId}.output.ndjson`);
  await mkdir(join(getConfigDir(), 'sessions'), { recursive: true });
  await writeFile(outputFile, lines.join('\n'));
  await markCompleted(sessionId);
} catch (err) {
  await markFailed(sessionId, err).catch(() => {});
  process.exit(1);
}
