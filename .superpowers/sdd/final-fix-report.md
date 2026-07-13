# Final whole-branch fix report

**Commit message:** `fix: session end states, showdown highlights, chip motion polish`  
**Date:** 2026-07-12  
**Verify:** `npm test` (47 passed) && `npm run build` (ok)

## Must fix

### 1. Game end: hero bust / sole survivor (§5.5)
- Added `getSessionOutcome(state)` in `src/engine/game.ts` (`victory` | `loss` | null):
  - Hero stack ≤ 0 at handOver/showdown → `loss`
  - Fewer than 2 seats with chips and hero alive → `victory`
  - Mid-hand (e.g. all-in stack 0) → null
- `gameStore`: `sessionOutcome` + `restartSession()` (createInitialTable + startHand)
- `startNewHand` blocked when session outcome is set (no AI-only hands)
- AI loop skips when `sessionOutcome` is set
- `ShowdownModal`: victory/loss copy + **重新开始** (vs 再来一手)
- Tests: `getSessionOutcome` suite in `game.test.ts`

### 2. Showdown best-five highlight
- Collect `WinnerInfo.bestFive` keys in `Table`
- Board + hole cards use `highlight` CSS only for matching best-five at showdown
- Modal lists best-five `CardView`s per winner with highlight

### 3. Light chip motion
- `ChipStack`: brief global `chipFly` class when amount increases
- Pot value: same brief `chipFly` when pot grows

## Nice
- `decideAction`: empty legal menu → `{ type: 'check' }` (passive) instead of fold
- `isActionLegal` raise: empty if-body → `return false` when no raise/allIn legal

## Files touched
- `src/engine/game.ts`, `src/engine/ai.ts`
- `src/store/gameStore.tsx`
- `src/ui/{ShowdownModal,Table,Seat,ChipStack}.tsx`
- `src/App.tsx`, `src/App.css`
- `src/engine/__tests__/{game,ai}.test.ts`
