```markdown
# texas-holdem-neon Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you how to contribute effectively to the `texas-holdem-neon` codebase, a TypeScript project built with Vite. You'll learn about the project's coding conventions, commit patterns, and the main workflows for adding features, fixing bugs, and refining the UI. The repository is organized for clarity and testability, with a strong emphasis on modular engine logic and a visually polished UI.

---

## Coding Conventions

- **File Naming:**  
  Use `camelCase` for file names.  
  Example:  
  ```
  src/engine/handEvaluator.ts
  src/ui/actionBar.tsx
  ```

- **Import Style:**  
  Use relative imports.  
  Example:  
  ```ts
  import { evaluateHand } from './handEvaluator'
  import ActionBar from '../ui/actionBar'
  ```

- **Export Style:**  
  Use named exports.  
  Example:  
  ```ts
  // src/engine/deck.ts
  export function createDeck() { ... }
  export function shuffle(deck: Card[]) { ... }
  ```

- **Commit Messages:**  
  Follow [Conventional Commits](https://www.conventionalcommits.org/).  
  Prefixes: `feat`, `fix`, `chore`, `test`, `style`  
  Example:  
  ```
  feat: add showdown modal for end of round
  fix: correct pot calculation for split hands
  ```

---

## Workflows

### Engine Feature With Tests

**Trigger:** When adding a new core game logic feature (e.g., deck, hand evaluation, pots, AI).  
**Command:** `/new-engine-feature`

1. Create or update the implementation file in `src/engine/`.
2. Create or update the corresponding test file in `src/engine/__tests__/`.
3. Use named exports for new functions or classes.
4. Ensure all new logic is covered by unit tests.

**Example:**
```ts
// src/engine/handRanker.ts
export function rankHand(hand: Card[]): number { ... }
```
```ts
// src/engine/__tests__/handRanker.test.ts
import { rankHand } from '../handRanker'

test('ranks a royal flush highest', () => {
  expect(rankHand(royalFlush)).toBeGreaterThan(rankHand(straightFlush))
})
```

---

### UI Component Addition

**Trigger:** When introducing a new UI feature or screen (e.g., ActionBar, Table, Tutorial, ShowdownModal).  
**Command:** `/add-ui-component`

1. Create new component file(s) in `src/ui/` (use `.tsx` for React components).
2. Create or update CSS module(s) in `src/styles/`.
3. Update `src/App.tsx` or `src/store/gameStore.tsx` to integrate the new component.

**Example:**
```tsx
// src/ui/showdownModal.tsx
export function ShowdownModal(props) { ... }
```
```css
/* src/styles/showdownModal.css */
.modal { box-shadow: 0 0 20px neon; }
```
```tsx
// src/App.tsx
import { ShowdownModal } from './ui/showdownModal'
```

---

### Engine Bugfix With Test Update

**Trigger:** When fixing a bug in engine logic (e.g., pots, game state, AI) and verifying with tests.  
**Command:** `/fix-engine-bug`

1. Update the implementation file(s) in `src/engine/`.
2. Update or add test file(s) in `src/engine/__tests__/` to cover the bugfix.
3. Ensure all tests pass.

**Example:**
```ts
// src/engine/potManager.ts
export function distributePot(players, pot) { ... /* bugfix here */ }
```
```ts
// src/engine/__tests__/potManager.test.ts
test('splits pot correctly for tied hands', () => { ... })
```

---

### UI Style Polish

**Trigger:** When improving or polishing the visual appearance of the UI (e.g., neon glow, animations, chip motion).  
**Command:** `/polish-ui-style`

1. Update CSS files in `src/styles/`.
2. Update related UI component files in `src/ui/`.
3. Optionally update `src/App.css` or `src/App.tsx` for global styles or integration.

**Example:**
```css
/* src/styles/actionBar.css */
.button { animation: glow 1s infinite alternate; }
```
```tsx
// src/ui/actionBar.tsx
import './actionBar.css'
```

---

## Testing Patterns

- **Framework:** [Vitest](https://vitest.dev/)
- **Test File Pattern:** `*.test.ts`
- **Location:** Tests for engine logic are placed in `src/engine/__tests__/`.
- **Example:**
  ```ts
  // src/engine/__tests__/deck.test.ts
  import { createDeck } from '../deck'

  test('creates a deck of 52 cards', () => {
    expect(createDeck()).toHaveLength(52)
  })
  ```
- **Run tests:**  
  ```
  npm run test
  ```

---

## Commands

| Command             | Purpose                                                        |
|---------------------|----------------------------------------------------------------|
| /new-engine-feature | Start a new engine feature with corresponding unit tests        |
| /add-ui-component   | Add a new UI component with CSS and integration                |
| /fix-engine-bug     | Fix a bug in the engine and update/add relevant tests          |
| /polish-ui-style    | Refine or enhance the UI's visual style and animations         |
```
