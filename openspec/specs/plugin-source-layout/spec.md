### Requirement: Single source of truth for plugin files

The repository SHALL contain plugin files only under `plugins/opencode/`.
Root-level `agents/`, `scripts/`, `skills/`, and `commands/` directories SHALL NOT exist.

#### Scenario: Plugin install uses plugins/opencode/

- **WHEN** Claude Code installs the plugin from the repository
- **THEN** it SHALL read files from `plugins/opencode/` only

#### Scenario: No duplicate directories at root

- **WHEN** a developer inspects the repository root
- **THEN** they SHALL NOT find `agents/`, `scripts/`, `skills/`, or `commands/` directories at the top level

## Requirements


<!-- @trace
source: cleanup-duplicate-file-structure
updated: 2026-04-02
code:
  - .opencode/skills/spectra-archive/SKILL.md
  - skills/opencode-result-handling/index.md
  - .opencode/commands/spectra-archive.md
  - .opencode/skills/spectra-debug/SKILL.md
  - tests/server.test.mjs
  - scripts/lib/render.mjs
  - .opencode/commands/spectra-apply.md
  - .opencode/skills/spectra-ask/SKILL.md
  - .opencode/commands/spectra-ingest.md
  - .spectra.yaml
  - GEMINI.md
  - tests/api.test.mjs
  - .opencode/skills/spectra-apply/SKILL.md
  - scripts/lib/sessions.mjs
  - .opencode/commands/spectra-audit.md
  - CLAUDE.md
  - .opencode/commands/spectra-ask.md
  - scripts/run-background-task.mjs
  - tests/git.test.mjs
  - scripts/lib/api.mjs
  - tests/render.test.mjs
  - .opencode/commands/spectra-debug.md
  - commands/review.md
  - scripts/opencode-companion.mjs
  - tests/sessions.test.mjs
  - commands/setup.md
  - .opencode/skills/spectra-ingest/SKILL.md
  - .opencode/skills/spectra-discuss/SKILL.md
  - .opencode/skills/spectra-propose/SKILL.md
  - .opencode/commands/spectra-discuss.md
  - agents/opencode-rescue.md
  - commands/rescue.md
  - scripts/lib/git.mjs
  - .opencode/skills/spectra-audit/SKILL.md
  - AGENTS.md
  - scripts/lib/server.mjs
  - .opencode/commands/spectra-propose.md
-->

### Requirement: Single source of truth for plugin files

The repository SHALL contain plugin files only under `plugins/opencode/`.
Root-level `agents/`, `scripts/`, `skills/`, and `commands/` directories SHALL NOT exist.

#### Scenario: Plugin install uses plugins/opencode/

- **WHEN** Claude Code installs the plugin from the repository
- **THEN** it SHALL read files from `plugins/opencode/` only

#### Scenario: No duplicate directories at root

- **WHEN** a developer inspects the repository root
- **THEN** they SHALL NOT find `agents/`, `scripts/`, `skills/`, or `commands/` directories at the top level