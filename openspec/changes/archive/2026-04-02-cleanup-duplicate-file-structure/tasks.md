## 1. 刪除頂層重複目錄

- [x] 1.1 刪除頂層 `agents/` 目錄（含 `opencode-rescue.md`），確認 plugin source of truth 僅在 `plugins/opencode/agents/`
- [x] 1.2 刪除頂層 `scripts/` 目錄（含所有 `.mjs` 檔案與 `lib/` 子目錄），確認 single source of truth for plugin files
- [x] 1.3 刪除頂層 `skills/` 目錄（含 `opencode-result-handling/`）
- [x] 1.4 刪除頂層 `commands/` 目錄（含 `rescue.md`、`review.md`、`setup.md`）

## 2. 驗證

- [x] 2.1 確認頂層不存在 `agents/`、`scripts/`、`skills/`、`commands/` 目錄（no duplicate directories at root）
- [x] 2.2 確認 `plugins/opencode/` 內容完整，未遺漏任何檔案
- [x] 2.3 執行 `npm test` 確認測試通過
- [x] 2.4 Commit 並 push 變更
