/**
 * Parses an array of NDJSON lines (opencode --format json output) into event objects.
 */
export async function parseSSELines(lines) {
  return lines
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);
}

/**
 * Extracts and concatenates all text content from a parts array.
 * Handles REST API format: [{type:"text", text:"..."}, ...]
 */
export function extractText(parts) {
  return parts
    .filter(p => p.type === 'text' && p.text)
    .map(p => p.text)
    .join('');
}

/**
 * Formats the setup report for display to the user.
 */
export function renderSetupReport(info) {
  const lines = [];
  if (info.ready) {
    lines.push('opencode is ready.');
    if (info.sessionRuntime?.port) {
      lines.push(`Server: running on port ${info.sessionRuntime.port}`);
    } else {
      lines.push('Server: not started (will start on first task)');
    }
    if (info.codex?.detail) lines.push(`Version: ${info.codex.detail}`);
  } else {
    lines.push('opencode is NOT ready.');
    if (info.opencode?.available === false) {
      lines.push('opencode is not installed.');
      lines.push('Install it with: npm install -g @openai/opencode');
    }
  }
  return lines.join('\n');
}

/**
 * Formats a completed task result for display.
 */
export function renderTaskResult({ sessionId, text, startedAt, completedAt }) {
  const duration = startedAt && completedAt
    ? `${Math.round((new Date(completedAt) - new Date(startedAt)) / 1000)}s`
    : 'unknown';
  return `[opencode · session ${sessionId} · ${duration}]\n\n${text}`;
}

/**
 * Formats a background job confirmation.
 */
export function renderBackgroundJobStart(sessionId) {
  return [
    `opencode task started in background.`,
    `Session ID: ${sessionId}`,
    `Check status:  /opencode:status ${sessionId}`,
    `Get result:    /opencode:result ${sessionId}`,
  ].join('\n');
}
