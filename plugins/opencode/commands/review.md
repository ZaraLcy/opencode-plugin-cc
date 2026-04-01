---
description: Ask opencode to review the current git changes
argument-hint: "[--base <git-ref>]"
context: fork
allowed-tools: Bash(node:*)
---

Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/opencode-companion.mjs" review $ARGUMENTS
```

Return the output verbatim. Do not summarise or add commentary.
If the command fails, surface the error message to the user.
