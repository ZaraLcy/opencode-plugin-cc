---
description: Check opencode installation and server status
argument-hint: "[--enable-server|--stop-server]"
context: fork
allowed-tools: Bash(node:*)
---

Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/opencode-companion.mjs" setup --json
```

Present the output clearly.
If opencode is not installed, instruct the user to run: npm install -g @openai/opencode

If `--enable-server` is in $ARGUMENTS, also run:
```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/opencode-companion.mjs" server start
```

If `--stop-server` is in $ARGUMENTS, run:
```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/opencode-companion.mjs" server stop
```
