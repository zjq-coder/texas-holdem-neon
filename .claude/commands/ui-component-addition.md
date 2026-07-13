---
name: ui-component-addition
description: Workflow command scaffold for ui-component-addition in texas-holdem-neon.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /ui-component-addition

Use this workflow when working on **ui-component-addition** in `texas-holdem-neon`.

## Goal

Adds new UI components with supporting CSS modules and updates to App or store files.

## Common Files

- `src/ui/*.tsx`
- `src/styles/*.css`
- `src/App.tsx`
- `src/store/gameStore.tsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create new component file(s) in src/ui/
- Create or update CSS module(s) in src/styles/
- Update src/App.tsx or src/store/gameStore.tsx to integrate the component

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.