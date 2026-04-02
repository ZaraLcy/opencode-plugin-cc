## Problem

`opencode:rescue` agent 在執行 task 時會長時間掛住（17+ 分鐘），最終無回應。

## Root Cause

`findResumable`（`scripts/lib/sessions.mjs:28`）在尋找可復用的 session 時，不過濾 `status`，會返回任何 `claudeSessionId` 匹配的 session，包含仍在 `running` 狀態的 session。

Companion script 拿到這個 running session 後，呼叫 `sendMessageForeground` 向同一個 session POST 新訊息。由於 opencode server 已在處理該 session 的舊任務，回應永遠不回來，導致 `fetch` 無限等待。

## Proposed Solution

在 `findResumable` 的 filter 條件中加入 `s.status !== 'running'`，只返回已完成（`completed`）或失敗（`failed`）的 session。

```js
// sessions.mjs:39 — before
.filter(s => s.claudeSessionId === claudeSessionId)

// after
.filter(s => s.claudeSessionId === claudeSessionId && s.status !== 'running')
```

## Non-Goals

- 不改變其他 session 管理邏輯
- 不加 timeout 機制（另一層防護，不在本次範圍）
- 不修改 `sendMessageForeground` 的行為

## Success Criteria

- 執行 `opencode:rescue` agent 時，若有 `running` 狀態的舊 session，companion 會建立新 session 而非重用
- Agent 在合理時間內（< 60 秒）回傳結果，不再掛住

## Impact

- Affected code: `plugins/opencode/scripts/lib/sessions.mjs`
