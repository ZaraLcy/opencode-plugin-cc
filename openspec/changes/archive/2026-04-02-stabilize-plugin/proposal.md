## Why

Plugin 目前有三個穩定性問題：agent 路徑靠硬綁 marketplace 名稱的 glob（換 fork 就壞）、版本永遠是 `0.1.0` 導致 `claude plugins update` 永遠說「already latest」、測試目錄在 repo 根層卻測試 `plugins/opencode/` 的程式碼（位置語意不一致）。

## What Changes

- **修 agent 路徑**：`opencode-rescue.md` 改用 `CLAUDE_PLUGIN_ROOT` fallback 或 PATH 查找，不再寫死 marketplace slug
- **版本 bump 策略**：建立 `scripts/bump-version.sh`，每次 push 前執行，自動更新 `plugins/opencode/package.json` 的 patch version
- **移動測試目錄**：將 `tests/` 移入 `plugins/opencode/tests/`，更新 `package.json` 的 `test` script 路徑

## Non-Goals

- 不改變任何 plugin 對外行為
- 不導入 CI/CD 自動化版本管理（手動 bump 已足夠）
- 不修改 `opencode-companion.mjs` 邏輯

## Capabilities

### New Capabilities

- `plugin-version-management`: 定義版本號如何維護與更新

### Modified Capabilities

- `plugin-source-layout`: 測試目錄位置的 requirement 變更（從根層移至 `plugins/opencode/tests/`）

## Impact

- Affected specs: `plugin-source-layout`（修改）、`plugin-version-management`（新增）
- Affected code:
  - `plugins/opencode/agents/opencode-rescue.md` — 修正路徑查找邏輯
  - `plugins/opencode/package.json` — 版本號更新
  - `scripts/bump-version.sh` — 新增（repo 根層，開發工具）
  - `tests/` → `plugins/opencode/tests/` — 移動目錄
  - `package.json`（根層）— 更新 `test` script 路徑
