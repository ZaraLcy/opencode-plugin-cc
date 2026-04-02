## 1. 修正 Agent script path（用 PATH 安裝 companion script 而非依賴 cache 路徑）

- [x] 1.1 修改 `plugins/opencode/agents/opencode-rescue.md`：將 Bash 指令從固定 glob `~/.claude/plugins/cache/zaralcy-opencode/opencode/*/scripts/opencode-companion.mjs` 改為廣 glob `~/.claude/plugins/cache/**/opencode-companion.mjs`（不含 marketplace slug），確認 agent script path is installation-agnostic
- [x] 1.2 在 `plugins/opencode/package.json` 加入 `bin` 欄位：`"opencode-companion": "scripts/opencode-companion.mjs"`，讓 PATH 安裝（用 PATH 安裝 companion script 而非依賴 cache 路徑）成為可能
- [x] 1.3 更新 `opencode-rescue.md` 的 Bash 指令：優先用 `command -v opencode-companion` 查 PATH，找不到時 fallback 到廣 glob

## 2. 版本 Bump 腳本（Patch 版本手動 bump，不用 semver 自動化工具）

- [x] 2.1 建立 `scripts/bump-version.mjs`：讀取 `plugins/opencode/package.json`，將 patch 版號 +1（patch 版本手動 bump，不用 semver 自動化工具），寫回檔案，console.log 新舊版本號，確認 version bump script exists
- [x] 2.2 執行 `node scripts/bump-version.mjs` 確認 `plugins/opencode/package.json` version 從 `0.1.0` 變為 `0.1.1`，驗證 version change is visible to plugin system

## 3. 移動測試目錄（測試移入 plugins/opencode/tests/，single source of truth for plugin files）

- [x] 3.1 將 `tests/` 整個目錄移至 `plugins/opencode/tests/`，確認 single source of truth for plugin files（tests co-located with plugin source）
- [x] 3.2 更新 5 個測試檔的 import 路徑：從 `../plugins/opencode/scripts/lib/` 改回 `../scripts/lib/`（相對路徑因 tests co-located 而縮短）
- [x] 3.3 更新根層 `package.json` 的 `test` script：從 `node --test tests/*.test.mjs` 改為 `node --test plugins/opencode/tests/*.test.mjs`
- [x] 3.4 執行 `npm test` 確認 16 個測試全部通過

## 4. 驗證與發布

- [x] 4.1 執行 `claude plugins update opencode@zaralcy-opencode` 驗證新版號被 plugin 系統識別（或確認 `installed_plugins.json` 版本已更新）
- [x] 4.2 執行一次 `opencode:rescue` agent 確認路徑修正有效（companion script 直接執行成功；agent 掛住是 findResumable 不過濾 running session 的獨立 bug）
- [x] 4.3 Commit 所有變更並 push 到 GitHub
