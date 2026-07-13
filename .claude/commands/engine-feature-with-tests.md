---
name: engine-feature-with-tests
description: Workflow command scaffold for engine-feature-with-tests in texas-holdem-neon.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /engine-feature-with-tests

Use this workflow when working on **engine-feature-with-tests** in `texas-holdem-neon`.

## Goal

Implements a new engine feature or module, always with corresponding unit tests.

## Common Files

- `src/engine/*.ts`
- `src/engine/__tests__/*.test.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update implementation file in src/engine/
- Create or update corresponding test file in src/engine/__tests__/

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.