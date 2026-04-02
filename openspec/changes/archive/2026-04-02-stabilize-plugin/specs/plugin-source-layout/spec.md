## MODIFIED Requirements

### Requirement: Single source of truth for plugin files

The repository SHALL contain plugin files only under `plugins/opencode/`.
Root-level `agents/`, `scripts/`, `skills/`, and `commands/` directories SHALL NOT exist.
Tests SHALL reside at `plugins/opencode/tests/`.

#### Scenario: Plugin install uses plugins/opencode/

- **WHEN** Claude Code installs the plugin from the repository
- **THEN** it SHALL read files from `plugins/opencode/` only

#### Scenario: No duplicate directories at root

- **WHEN** a developer inspects the repository root
- **THEN** they SHALL NOT find `agents/`, `scripts/`, `skills/`, or `commands/` directories at the top level

#### Scenario: Tests are co-located with plugin source

- **WHEN** a developer runs tests
- **THEN** tests SHALL be found at `plugins/opencode/tests/` and SHALL import from `../scripts/lib/`

## ADDED Requirements

### Requirement: Agent script path is installation-agnostic

The `opencode-rescue` agent SHALL locate `opencode-companion.mjs` without hardcoding the marketplace slug or repository name.

#### Scenario: Agent runs after fresh install from any fork

- **WHEN** the plugin is installed from any GitHub fork or marketplace
- **THEN** the agent SHALL successfully invoke `opencode-companion.mjs`

#### Scenario: Fallback glob covers multiple installed versions

- **WHEN** multiple versions of the plugin exist in the cache
- **THEN** the agent SHALL invoke the companion script from one of the installed versions without error
