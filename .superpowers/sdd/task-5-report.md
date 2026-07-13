# Task 5 Report: 游戏状态机 game.ts

## Status
**DONE**

## Deliverables
| Path | Action |
|------|--------|
| `src/engine/game.ts` | Created |
| `src/engine/__tests__/game.test.ts` | Created |
| `src/engine/types.ts` | Extended (`actedThisStreet: boolean[]`) |

## API
- `DEFAULT_STACK = 10_000`, `DEFAULT_SB = 50`, `DEFAULT_BB = 100`
- `createInitialTable(heroName?)` — 6 seats, Hero `seats[0]`, AI names VEX/NOVA/GHOST/PULSE/HEX
- `startHand(state, rng?)` — sittingOut busts, advance dealer, blinds, deal 2, UTG acts
- `getLegalActions(state)` / `getRaiseBounds(state)` — raise min/max = 本街总投入目标
- `applyAction(state, action)` — illegal → same reference; street advance / runout / award
- `isHeroTurn(state)`

## Behavior covered
1. Blinds (short → all-in), HU dealer=SB
2. Street complete via `actedThisStreet` + matched `currentBet` (BB option)
3. Full raise reopens action; incomplete all-in does not clear acted flags
4. Uncontested fold-out → `handOver` + `computePots` award
5. All-in / ≤1 actor → runout to 5 board → showdown
6. Showdown per pot via `evaluateSeven`; odd chips to winner closest left of dealer
7. Chip conservation asserts on multi-way and short-stack paths

## Commits
- (see git) `feat(engine): NLHE hand state machine with blinds and streets`

## Tests
```
npm test
✓ deck.test.ts (3)
✓ pots.test.ts (4)
✓ handEval.test.ts (8)
✓ game.test.ts (15)
Total: 30 passed
```

### game.test.ts cases
- createInitialTable shape / AI names
- startHand blinds + deal + positions (D0/SB1/BB2/UTG3)
- fold hero path
- all call → flop
- illegal check unchanged (reference)
- isHeroTurn
- BB option check → flop
- getRaiseBounds
- raise then folds uncontested
- uncontested pot stack math
- call/check to handOver + 5 board + chip sum
- preflop all-in runout
- short stack 150 side-pot path chip sum
- sittingOut skip
- dealer advances hand 2

## Concerns
- No burn cards (deal directly from deck); fine for fairness with shuffle.
- Incomplete-raise re-open rights simplified: short all-in does not reset `actedThisStreet`; players still must match via `betThisStreet < currentBet`.
- `raise` legal list only when full min-raise affordable; short uses `allIn` (also accepts raise amount === max).
- Live `pots` refreshed after actions but cleared after award; UI should use `winners` at `handOver`.
- Heads-up blinds implemented but not unit-tested with only 2 in-hand players.

---

## Fix notes (Critical/Important pot eligibility)

### Problems fixed
1. **`awardUncontested` summed all pots blindly** — short all-in could receive empty-eligible side pots when others folded after building a side layer.
2. **Showdown `continue` on empty eligible** — pot chips were dropped instead of refunded.
3. **Missing uncalled excess return** — fold-out left overbet chips incorrectly in the pot.

### Fix behavior
- `returnUncalledExcess`: return `maxBet - secondMax` to the unique highest contributor before pot build.
- `awardUncontested`: refresh pots → **per pot**:
  - 1 eligible → that seat
  - 0 eligible → `refundPotToContributors` (equal split of layer; odd chips dealer-left)
  - never dump empty side pot onto short all-in
- `showdown`: empty eligible (or no evaluable hand) → refund contributors, never `continue` drop.
- `Pot.contributorSeatIds` added in `computePots` / `types.ts` for refunds.

### New / updated tests
- short all-in + side pot + free folds → **per-seat** stacks (seat3=600; seat4/5 each −400+250)
- empty-eligible pot conservation (total conserved; side 500 not to short stack)
- incomplete all-in does not clear `actedThisStreet`
- uncontested fold-out stack includes uncalled return
- pots: empty-eligible side pot shape

### Commit
`fix(engine): award pots by eligibility and conserve chips`

### Test output
```
npm test
✓ src/engine/__tests__/pots.test.ts (5 tests)
✓ src/engine/__tests__/deck.test.ts (3 tests)
✓ src/engine/__tests__/handEval.test.ts (8 tests)
✓ src/engine/__tests__/game.test.ts (18 tests)

Test Files  4 passed (4)
     Tests  34 passed (34)
```
