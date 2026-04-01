#!/usr/bin/env node
import { getServerStatus, startServer, stopServer } from './lib/server.mjs';
import { createSession, sendMessageForeground, abortSession } from './lib/api.mjs';
import { saveSession, loadSession, findResumable, markCompleted, markFailed } from './lib/sessions.mjs';
import { extractText, renderSetupReport, renderTaskResult, renderBackgroundJobStart } from './lib/render.mjs';
import { collectDiff, buildReviewPrompt } from './lib/git.mjs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const SCRIPT_DIR = fileURLToPath(new URL('.', import.meta.url));

function getConfigDir() {
  return process.env.OPENCODE_PLUGIN_DIR ?? join(homedir(), '.opencode-plugin');
}

const BOOLEAN_FLAGS = new Set(['fresh', 'background', 'foreground', 'write', 'json', 'resume']);

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      if (!BOOLEAN_FLAGS.has(key) && next && !next.startsWith('--')) {
        flags[key] = next; i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(argv[i]);
    }
  }
  return { flags, positional };
}

// ── subcommands ────────────────────────────────────────────────────────────

async function cmdSetup(flags) {
  let opencodeAvailable = false;
  let opencodeVersion = 'unknown';
  try {
    const { stdout } = await execFileAsync('opencode', ['--version']);
    opencodeVersion = stdout.trim();
    opencodeAvailable = true;
  } catch { /* not installed */ }

  const serverStatus = await getServerStatus();
  const info = {
    ready: opencodeAvailable,
    opencode: { available: opencodeAvailable },
    codex: { detail: `opencode ${opencodeVersion}` },
    sessionRuntime: serverStatus.running
      ? { mode: 'serve', port: serverStatus.port }
      : { mode: 'idle' },
  };

  if (flags.json) {
    console.log(JSON.stringify(info, null, 2));
  } else {
    console.log(renderSetupReport(info));
  }
}

async function cmdServerStart(flags) {
  const port = flags.port ? parseInt(flags.port, 10) : 4567;
  const status = await startServer(port);
  console.log(JSON.stringify(status));
}

async function cmdTask(flags, prompt) {
  if (!prompt) { console.error('Error: prompt required'); process.exit(1); }

  const serverStatus = await startServer();
  const baseUrl = `http://127.0.0.1:${serverStatus.port}`;
  const claudeSessionId = process.env.CLAUDE_SESSION_ID ?? 'unknown';
  const isBackground = flags.background === true;

  let sessionId;
  if (flags.session && flags.session !== true) {
    sessionId = flags.session;
  } else if (!flags.fresh) {
    const resumable = await findResumable(claudeSessionId);
    if (resumable) sessionId = resumable.sessionId;
  }

  if (!sessionId) {
    const { sessionId: newId } = await createSession(baseUrl, prompt.slice(0, 80));
    sessionId = newId;
  }

  await saveSession(sessionId, { prompt, claudeSessionId, status: 'running' });

  if (isBackground) {
    const bgScript = join(SCRIPT_DIR, 'run-background-task.mjs');
    const child = spawn(process.execPath, [bgScript, baseUrl, sessionId, prompt], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env },
    });
    child.unref();
    console.log(renderBackgroundJobStart(sessionId));
    return;
  }

  const startedAt = new Date().toISOString();
  try {
    const parts = await sendMessageForeground(baseUrl, sessionId, prompt);
    const text = extractText(parts);
    const completedAt = new Date().toISOString();
    await markCompleted(sessionId);
    console.log(renderTaskResult({ sessionId, text, startedAt, completedAt }));
  } catch (err) {
    await markFailed(sessionId, err);
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

async function cmdReview(flags) {
  const base = typeof flags.base === 'string' ? flags.base : 'HEAD';
  const diff = await collectDiff(base);
  const prompt = buildReviewPrompt(diff);

  const serverStatus = await startServer();
  const baseUrl = `http://127.0.0.1:${serverStatus.port}`;
  const { sessionId } = await createSession(baseUrl, 'Code review');
  const claudeSessionId = process.env.CLAUDE_SESSION_ID ?? 'unknown';
  await saveSession(sessionId, { prompt: '[review]', claudeSessionId, status: 'running' });

  const startedAt = new Date().toISOString();
  const parts = await sendMessageForeground(baseUrl, sessionId, prompt);
  const text = extractText(parts);
  const completedAt = new Date().toISOString();
  await markCompleted(sessionId);
  console.log(renderTaskResult({ sessionId, text, startedAt, completedAt }));
}

async function cmdStatus(sessionId) {
  if (!sessionId) { console.error('Error: session-id required'); process.exit(1); }
  const record = await loadSession(sessionId).catch(() => null);
  if (!record) { console.log(`Session ${sessionId} not found.`); return; }
  console.log(`Status:    ${record.status}\nSession:   ${sessionId}\nStarted:   ${record.startedAt}${record.completedAt ? `\nCompleted: ${record.completedAt}` : ''}${record.error ? `\nError:     ${record.error}` : ''}`);
}

async function cmdResult(sessionId) {
  if (!sessionId) { console.error('Error: session-id required'); process.exit(1); }
  const outputFile = join(getConfigDir(), 'sessions', `${sessionId}.output.ndjson`);
  try {
    const content = await readFile(outputFile, 'utf-8');
    const events = await parseSSELines(content.split('\n'));
    console.log(extractText(events));
  } catch {
    console.error(`No result found for session ${sessionId}. It may still be running.`);
    process.exit(1);
  }
}

async function cmdCancel(sessionId) {
  if (!sessionId) { console.error('Error: session-id required'); process.exit(1); }
  const serverStatus = await getServerStatus();
  if (!serverStatus.running) { console.log('Server is not running.'); return; }
  const baseUrl = `http://127.0.0.1:${serverStatus.port}`;
  await abortSession(baseUrl, sessionId);
  await markFailed(sessionId, 'cancelled by user');
  console.log(`Session ${sessionId} cancelled.`);
}

async function cmdResumeCandidate() {
  const claudeSessionId = process.env.CLAUDE_SESSION_ID ?? 'unknown';
  const candidate = await findResumable(claudeSessionId);
  console.log(JSON.stringify({ available: !!candidate, sessionId: candidate?.sessionId ?? null }));
}

function usage() {
  console.log([
    'Usage:',
    '  opencode-companion.mjs setup [--json]',
    '  opencode-companion.mjs server start [--port N] | stop',
    '  opencode-companion.mjs task [--background] [--session <id>|--fresh] <prompt>',
    '  opencode-companion.mjs review [--base <ref>]',
    '  opencode-companion.mjs status <session-id>',
    '  opencode-companion.mjs result <session-id>',
    '  opencode-companion.mjs cancel <session-id>',
    '  opencode-companion.mjs task-resume-candidate --json',
  ].join('\n'));
}

// ── dispatch ───────────────────────────────────────────────────────────────

const [, , subcommand, ...rest] = process.argv;
const { flags, positional } = parseArgs(rest);

switch (subcommand) {
  case 'setup':   await cmdSetup(flags); break;
  case 'server':
    if (positional[0] === 'start') { await cmdServerStart(flags); }
    else if (positional[0] === 'stop') { await stopServer(); console.log('Server stopped.'); }
    break;
  case 'task':    await cmdTask(flags, positional.join(' ')); break;
  case 'review':  await cmdReview(flags); break;
  case 'status':  await cmdStatus(positional[0]); break;
  case 'result':  await cmdResult(positional[0]); break;
  case 'cancel':  await cmdCancel(positional[0]); break;
  case 'task-resume-candidate': await cmdResumeCandidate(); break;
  default:        usage(); process.exit(1);
}
