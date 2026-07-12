# Task 11 Report: 开始屏、设置、摊牌、教程

## Status
**DONE**

## Deliverables
| Path | Action |
|------|--------|
| `src/ui/StartScreen.tsx` | Create — 霓虹德州 / 开始牌局 / 教程模式 |
| `src/ui/Tutorial.tsx` | Create — 4-step overlay mask (0..3), 跳过/完成 |
| `src/ui/SettingsPanel.tsx` | Create — difficulty / sfx / animationSpeed / hintsEnabled + 关闭 |
| `src/ui/ShowdownModal.tsx` | Create — winners + handName + 再来一手 |
| `src/ui/HandRankGuide.tsx` | Create — collapsible 10 ranks (含高牌) ZH |
| `src/store/gameStore.tsx` | Modify — `openTutorial()` |
| `src/App.tsx` | Modify — phase wire, top-bar 教程/设置, hints via `isHeroTurn` |
| `src/App.css` | Modify — neon styles for all new surfaces |

## Behavior
- phase: `start` → StartScreen; `tutorial` → Tutorial → `markTutorialDone` + `startGame(true)`; `playing`/`showdown` → table
- Top bar: 教程 (overlay), 设置 (panel)
- Hint strip: `hintsEnabled && isHeroTurn`
- ShowdownModal when `street === 'handOver' && winners`

## Commits
- `feat(ui): start screen tutorial settings and showdown`

## Build
```
npm run build → OK (tsc -b && vite build)
```
