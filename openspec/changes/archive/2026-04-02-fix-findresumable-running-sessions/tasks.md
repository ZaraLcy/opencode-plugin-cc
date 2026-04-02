## 1. 修正 findResumable 排除 running sessions

- [x] 1.1 在 `plugins/opencode/scripts/lib/sessions.mjs` 的 `findResumable` 函數（第 39 行）的 `filter` 條件中加入 `&& s.status !== 'running'`，確認 findResumable excludes running sessions
- [x] 1.2 在 `plugins/opencode/tests/sessions.test.mjs` 新增測試：當有 `status: 'running'` 的 session 存在時，`findResumable` 應返回 `null`（running session is not returned as resumable）
- [x] 1.3 新增測試：`status: 'completed'` 的 session 仍應被返回（completed session is still resumable）
- [x] 1.4 執行 `npm test` 確認所有測試通過

## 2. 驗證與發布

- [x] 2.1 Commit 並 push 到 GitHub
- [x] 2.2 執行 `claude plugins install opencode@zaralcy-opencode` 更新安裝版本（或手動複製修改後的檔案到 cache）
