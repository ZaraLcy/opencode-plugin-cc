---
name: opencode-result-handling
description: Internal guidance for presenting opencode companion output to the user
type: internal
---

When presenting output from the opencode companion script:

1. **Return verbatim.** Do not summarise, paraphrase, or add commentary before or after the companion output.

2. **Event stream noise.** The companion strips raw SSE events and returns only the final text. If you see raw JSON lines (`{"type":"text",...}`), the companion failed to parse — surface the raw output and note the parsing failure.

3. **Error messages.** If the companion exits with a non-zero code, show the stderr message and suggest running `/opencode:setup` to diagnose.

4. **Background job confirmation.** If the output contains "Session ID:", the task is running in the background. Tell the user the session ID and that they can check status with `/opencode:status <id>` and retrieve results with `/opencode:result <id>`.
