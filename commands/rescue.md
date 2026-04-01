---
description: Delegate investigation, a fix request, or follow-up work to opencode
argument-hint: "[--background|--foreground] [--resume|--fresh] [--model <provider/model>] <task description>"
context: fork
allowed-tools: Bash(node:*), AskUserQuestion
---

Route this request to the `opencode:opencode-rescue` subagent.
Return the subagent's output verbatim.

Raw user request:
$ARGUMENTS

Execution mode:
- If `--background` is present, run the subagent in the background.
- If `--foreground` is present, run foreground.
- If neither flag is present, default to foreground.
- `--background` and `--foreground` are execution flags for Claude Code. Do not forward them to `task`.
- `--model` is a runtime flag. Preserve it for the forwarded call.
- If `--resume` is present, do not check for resumable sessions.
- If `--fresh` is present, do not check for resumable sessions.
- Otherwise, check for a resumable session:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/opencode-companion.mjs" task-resume-candidate --json
```

If `available: true`, use `AskUserQuestion` exactly once:
- If the user's request sounds like a follow-up ("continue", "keep going", "resume"), put `Continue current opencode session (Recommended)` first.
- Otherwise put `Start a new session (Recommended)` first.
- If user chooses continue, add `--resume` before forwarding.
- If user chooses new, add `--fresh` before forwarding.

Operating rules:
- Do not paraphrase, summarise, or add commentary around the output.
- If opencode is missing or the server fails to start, stop and tell the user to run `/opencode:setup`.
