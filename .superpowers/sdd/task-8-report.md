# Task 8 Report: React store 与可玩循环

## Status
**DONE**

## Deliverables
| Path | Action |
|------|--------|
| `src/store/gameStore.tsx` | Created |
| `src/App.tsx` | Modified — Provider + debug UI |
| `src/engine/ai.ts` | Fixed Rank/`1` TS error so `npm run build` passes |

## API (`GameProvider` / `useGame`)
- `state: GameState` — `createInitialTable` / `startHand` / `applyAction`
- `settings: Settings` — `loadSettings` / `saveSettings` via `updateSettings`
- `phase: 'start' | 'tutorial' | 'playing' | 'showdown'`
- `dispatchPlayerAction(action)` — only when `isHeroTurn`
- `startNewHand()` — `startHand(state)` → phase `playing`
- `startGame(fromTutorial?)` — if tutorial pending → `tutorial`; else fresh table + hand → `playing`
- `markTutorialDone()` — persists `tutorialDone: true`

## AI loop
1. `useEffect` on `actionSeatIndex` / street / log length / difficulty / speed
2. Runs only when `phase === 'playing'`, street not `handOver`/`showdown`, actor `isAI`
3. Delay = `650ms * {slow:1.6, normal:1, fast:0.35}` then `decideAction` + `applyAction`
4. Timeout cleaned on re-run; Hero never auto-acts
5. When street hits showdown/handOver while playing → phase `showdown`

## Debug UI (App)
- street / pot / board / hole / acting / log
- legal action buttons when hero turn
- start / skip tutorial / next hand
- difficulty + animationSpeed controls

## Commits
- `feat: wire game store with AI auto-act loop`

## Build
```
npm run build → OK (tsc -b && vite build)
npm test → 41 passed
```

## Concerns
- Debug UI only; Task 9 replaces with Table/ActionBar.
- StrictMode may schedule/cancel AI timers twice in dev (cleanup handles it).
- Raise button uses min legal amount only (no slider yet).
