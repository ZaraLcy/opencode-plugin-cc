## Context

Plugin 安裝後放在 `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`。Agent 需要找到同目錄的 `scripts/opencode-companion.mjs`，但 Claude Code 目前不注入 `CLAUDE_PLUGIN_ROOT` 環境變數，導致 agent 必須自己找路徑。

目前的 workaround 是 glob `~/.claude/plugins/cache/zaralcy-opencode/opencode/*/scripts/opencode-companion.mjs`，hardcode 了 marketplace slug `zaralcy-opencode`，fork 或換 marketplace 就會失效。

## Goals / Non-Goals

**Goals:**
- Agent 路徑查找在任意 marketplace/fork 下皆有效
- 版本更新流程可重複執行（一條指令）
- 測試目錄與被測程式碼位置一致

**Non-Goals:**
- 不實作自動 CI 版本 bump
- 不修改 companion script 邏輯

## Decisions

### 用 PATH 安裝 companion script 而非依賴 cache 路徑

agent 在 `package.json` 的 `bin` 欄位註冊 `opencode-companion`，安裝時 Claude Code 若支援 bin 連結則自動放入 PATH；不支援時 fallback 到 glob（`~/.claude/plugins/cache/**/opencode-companion.mjs`），比現在的固定路徑更廣。

**Alternatives considered:**
- *固定路徑 glob（現況）*：`~/.claude/plugins/cache/zaralcy-opencode/opencode/*/...`。簡單，但 marketplace slug 硬編碼，fork 必壞。
- *等 CLAUDE_PLUGIN_ROOT 由官方注入*：理想方案，但依賴 Anthropic 修改 Claude Code，時程不確定。
- *全域 PATH 安裝（npm install -g）*：需要使用者額外執行指令，安裝體驗差。

結論：用 `package.json` bin + 廣 glob fallback，不需使用者額外操作，且在 fork 下仍有效。

### Patch 版本手動 bump，不用 semver 自動化工具

每次有改動時執行 `node scripts/bump-version.mjs`（或 shell script），自動讀取 `plugins/opencode/package.json`，將 patch 版號 +1 並寫回。

**Alternatives considered:**
- *npm version patch*：會在 repo 根層 package.json 操作，但 install 來源是 `plugins/opencode/package.json`，需要特別指定路徑，容易混淆。
- *git tag 觸發*：過度複雜，這是個人 plugin。

結論：最小化的 Node.js script，只改 `plugins/opencode/package.json`，操作明確。

### 測試移入 plugins/opencode/tests/

測試的 import 路徑原本指向 `../scripts/lib/`，現在已改成 `../plugins/opencode/scripts/lib/`（上個 change 的副作用）。移入後路徑變回 `../scripts/lib/`，語意更清晰，且 plugin install 時也能帶上測試。

## Risks / Trade-offs

- [bin 欄位 Claude Code 不支援] → Fallback glob 仍有效，只是比 bin 路徑稍脆
- [廣 glob 可能匹配到多個版本目錄] → shell glob 展開按字母序，`*` 會取最新版號目錄（版號字串排序在大多數情況正確）；可用 `ls -v` sort 改善，但目前可接受
