# Task 10 Report: 赛博霓虹视觉与动效

## Status
**DONE**

## Deliverables
| Path | Action |
|------|--------|
| `src/styles/animations.css` | Enhanced — deal-in, flip-in, pulse-ring, neon-flow, pot-pulse + global utilities |
| `src/styles/table.module.css` | Polished — neon rail (linear + conic bloom), acting pulse, pot gold glow |
| `src/styles/card.module.css` | dealIn / flipIn classes; stronger hero cyan highlight |
| `src/styles/global.css` | Ambient void radial gradients |
| `src/styles/actionBar.module.css` | Magenta neon hover on all action / preset buttons |
| `src/styles/tokens.css` | Stronger gold glow token |
| `src/App.css` | Play-shell vignette + ambient radials |
| `src/ui/Card.tsx` | `enter` (`deal` \| `flip` \| `none`) + `delayMs` props |
| `src/ui/Seat.tsx` | Hole cards use deal-in (staggered) |
| `src/ui/Table.tsx` | Community cards use flip-in (rotateY); remount keys on deal |

## Spec checklist
1. **电弧桌沿** — `felt::before` magenta→cyan linear-gradient + `neon-flow`; outer conic bloom
2. **行动座位** — `seatActing` → `pulse-ring` (cyan + magenta bloom)
3. **Hero 手牌** — `highlight` → `var(--glow-cyan)`
4. **发牌 / 翻牌** — class-based `dealIn` / `flipIn` (rotateY)
5. **底池** — Display (Orbitron) + gold text-shadow + `pot-pulse`
6. **reduced-motion** — global kill-switch; all motion opt-in via classes
7. **Ambient void** — body + play-shell radials + fixed vignette
8. **Action buttons** — magenta neon hover base + per-action accents

## Commits
- `style: cyber neon table glow and card animations`

## Build
```
npm run build → OK (tsc -b && vite build)
```

## Notes
- No separate `NeonRail.tsx` — rail kept as CSS pseudo-elements on `.felt` (cleaner, no layout impact)
- Gameplay / store / engine untouched
