# Task 9 Report: 牌桌 UI 组件（结构）

## Status
**DONE**

## Deliverables
| Path | Action |
|------|--------|
| `src/ui/Card.tsx` | Created — `CardView` rank/suit face, neon-grid back |
| `src/ui/Seat.tsx` | Created — `SeatView` name/stack/hole/bet, acting pulse |
| `src/ui/ChipStack.tsx` | Created — street bet chip label |
| `src/ui/ActionBar.tsx` | Created — fold / check·call / raise slider + 1/2 pot, pot, all-in |
| `src/ui/Table.tsx` | Created — oval felt, 6 seats, board + pot, simple showdown overlay |
| `src/styles/card.module.css` | Created |
| `src/styles/table.module.css` | Created |
| `src/styles/actionBar.module.css` | Created |
| `src/App.tsx` | Modified — start / tutorial / playing+showdown screens |
| `src/App.css` | Modified — play shell, top bar, CTAs, hint strip |

## Layout
- Stage `aspect-ratio: 16/10`; seats via % top/left
- `seats[0]` hero bottom center → seat1 BL, seat2 TL, seat3 top, seat4 TR, seat5 BR
- Center: street tag, 5 community slots, gold pot total
- Acting seat: `pulse-ring`; hero hole cards cyan highlight
- Chinese labels throughout

## App phases
- `start`: 霓虹德州 + 开始牌局 (+ 跳过教程 if needed)
- `tutorial`: short Chinese intro → startGame(true)
- `playing` / `showdown`: Table + ActionBar; hints when `settings.hintsEnabled`; showdown overlay + 再来一手
- Top bar: brand + blinds only (settings deferred to task 11)
- Only `dispatchPlayerAction` / `startGame` / `startNewHand` / `markTutorialDone`

## Commits
- `feat(ui): poker table seats cards and action bar`

## Build
```
npm run build → OK (tsc -b && vite build)
```

## Concerns
- Visual polish / neon rail refinement left to Task 10
- Settings panel not in chrome yet (Task 11)
- Showdown overlay is minimal (winner lines + next hand)
