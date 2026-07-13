# Task 12 Report: 音效与最终验收

## Status
**DONE**

## Deliverables
| Path | Action |
|------|--------|
| `src/audio/sfx.ts` | Create — Web Audio short beeps: `playDeal` / `playChip` / `playWin`; no-op when `settings.sfx === false` |
| `src/store/gameStore.tsx` | Modify — map `lastActionLog` deltas to SFX (deal / chip / win) |

## Behavior
- **playDeal**: hand start, flop/turn/river, run-out board
- **playChip**: blinds, call, raise, all-in
- **playWin**: fold-win (`赢得`) / showdown (`摊牌结束`)
- SFX gated via `loadSettings().sfx`; AudioContext missing (SSR/jsdom) → silent no-op
- Cursor resets when `startHand` replaces the log

## Acceptance (mental verify)
1. Full hand playable (fold-win or showdown) — engine + store loop intact  
2. Side pots covered in `pots.test.ts` / `game.test.ts` all-in paths  
3. Neon UI + animations (prior tasks CSS)  
4. Tutorial + hints toggle (Settings / Tutorial)  
5. Chinese UI throughout  

## Tests
```
Test Files  5 passed (5)
     Tests  41 passed (41)
```

## Build
```
npm run build → OK (tsc -b && vite build)
```

## Commits
- `feat: sfx and final acceptance polish`
