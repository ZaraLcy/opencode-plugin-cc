### Requirement: Version bump script exists

The repository SHALL include a `scripts/bump-version.mjs` script that increments the patch version in `plugins/opencode/package.json`.

#### Scenario: Running bump-version increments patch

- **WHEN** developer runs `node scripts/bump-version.mjs`
- **THEN** the patch component of `plugins/opencode/package.json` version SHALL be incremented by 1

#### Scenario: Version change is visible to plugin system

- **WHEN** the bumped version is pushed to GitHub and user runs `claude plugins update`
- **THEN** the plugin system SHALL detect a new version and update the installed plugin

## Requirements


<!-- @trace
source: stabilize-plugin
updated: 2026-04-02
code:
  - package.json
  - plugins/opencode/agents/opencode-rescue.md
  - tests/api.test.mjs
  - tests/server.test.mjs
  - tests/render.test.mjs
  - tests/sessions.test.mjs
  - .claude-plugin/marketplace.json
  - plugins/opencode/package.json
  - tests/git.test.mjs
  - scripts/bump-version.mjs
-->

### Requirement: Version bump script exists

The repository SHALL include a `scripts/bump-version.mjs` script that increments the patch version in `plugins/opencode/package.json`.

#### Scenario: Running bump-version increments patch

- **WHEN** developer runs `node scripts/bump-version.mjs`
- **THEN** the patch component of `plugins/opencode/package.json` version SHALL be incremented by 1

#### Scenario: Version change is visible to plugin system

- **WHEN** the bumped version is pushed to GitHub and user runs `claude plugins update`
- **THEN** the plugin system SHALL detect a new version and update the installed plugin