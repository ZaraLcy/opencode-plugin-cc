## ADDED Requirements

### Requirement: findResumable excludes running sessions

The `findResumable` function SHALL NOT return sessions with `status === 'running'`.
Only sessions with `status` other than `'running'` SHALL be considered resumable.

#### Scenario: Running session is not returned as resumable

- **WHEN** `findResumable` is called and a session exists with matching `claudeSessionId` and `status: 'running'`
- **THEN** that session SHALL NOT be returned

#### Scenario: Completed session is still resumable

- **WHEN** `findResumable` is called and a session exists with matching `claudeSessionId` and `status: 'completed'`
- **THEN** that session SHALL be returned as the resumable candidate
