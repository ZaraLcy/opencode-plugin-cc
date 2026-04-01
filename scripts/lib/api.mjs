/**
 * Builds the request body for POST /session/{id}/message.
 */
export function buildMessageBody(text, opts = {}) {
  const body = { parts: [{ type: 'text', text }] };
  if (opts.model) body.model = opts.model;
  if (opts.agent) body.agent = opts.agent;
  return body;
}

/**
 * Normalises a raw /session response into a simpler shape.
 */
export function parseSessionResponse(raw) {
  return { sessionId: raw.id, title: raw.title, createdAt: raw.time?.created };
}

/**
 * Creates a new opencode session. Returns { sessionId, title }.
 */
export async function createSession(baseUrl, title = 'Claude Code task') {
  const res = await fetch(`${baseUrl}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`POST /session failed: ${res.status}`);
  return parseSessionResponse(await res.json());
}

/**
 * Sends a message and collects the full NDJSON response as an array of lines.
 */
export async function sendMessageForeground(baseUrl, sessionId, text, opts = {}) {
  const res = await fetch(`${baseUrl}/session/${sessionId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildMessageBody(text, opts)),
  });
  if (!res.ok) throw new Error(`POST /session/${sessionId}/message failed: ${res.status}`);
  const body = await res.text();
  return body.split('\n').filter(Boolean);
}

/**
 * Gets session info.
 */
export async function getSession(baseUrl, sessionId) {
  const res = await fetch(`${baseUrl}/session/${sessionId}`);
  if (!res.ok) throw new Error(`GET /session/${sessionId} failed: ${res.status}`);
  return res.json();
}

/**
 * Aborts a running session.
 */
export async function abortSession(baseUrl, sessionId) {
  const res = await fetch(`${baseUrl}/session/${sessionId}/abort`, { method: 'POST' });
  if (!res.ok && res.status !== 404) throw new Error(`POST /session/${sessionId}/abort failed: ${res.status}`);
}
