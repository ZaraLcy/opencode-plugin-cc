## Why

Repo 頂層的 `agents/`、`scripts/`、`skills/`、`commands/` 目錄與 `plugins/opencode/` 子目錄內容完全重複。Claude Code 安裝 plugin 時只讀取 `plugins/opencode/`，頂層目錄不會被使用，卻每次修改都要同步兩個地方，容易漏改。

## What Changes

- 刪除頂層的 `agents/`、`scripts/`、`skills/`、`commands/` 目錄（共 4 個目錄）
- `plugins/opencode/` 成為唯一的 plugin source of truth
- 更新 `package.json`（如有 scripts 路徑參照頂層目錄）

## Non-Goals

- 不改變任何 plugin 行為或邏輯
- 不移動或重組 `plugins/opencode/` 內部結構
- 不更動 `openspec/`、`tests/`、`.claude/` 等其他目錄

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none)

## Impact

- Affected code:
  - `agents/opencode-rescue.md` → 刪除
  - `scripts/` → 整個目錄刪除
  - `skills/opencode-result-handling/` → 整個目錄刪除
  - `commands/rescue.md`、`commands/review.md`、`commands/setup.md` → 刪除
  - `package.json` → 確認無頂層路徑參照
