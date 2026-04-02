## ADDED Requirements

### Requirement: Single source of truth for plugin files

The repository SHALL contain plugin files only under `plugins/opencode/`.
Root-level `agents/`, `scripts/`, `skills/`, and `commands/` directories SHALL NOT exist.

#### Scenario: Plugin install uses plugins/opencode/

- **WHEN** Claude Code installs the plugin from the repository
- **THEN** it SHALL read files from `plugins/opencode/` only

#### Scenario: No duplicate directories at root

- **WHEN** a developer inspects the repository root
- **THEN** they SHALL NOT find `agents/`, `scripts/`, `skills/`, or `commands/` directories at the top level
