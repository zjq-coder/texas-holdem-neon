# Task 2 Report: engine 类型与牌组

## Status

**Completed** — pure engine types + deck implemented with TDD; all tests green.

## What was done

### Files created

| Path | Purpose |
|------|---------|
| `src/engine/types.ts` | Core domain types: `Suit`, `Rank`, `Card`, plus game-state types used by later tasks (`Street`, `PlayerAction`, `Seat`, `Pot`, `WinnerInfo`, `GameState`) |
| `src/engine/deck.ts` | Deck factory, Fisher–Yates shuffle, card id encode/decode |
| `src/engine/__tests__/deck.test.ts` | Vitest coverage for create/shuffle/parse roundtrip |

### API surface (as specified)

- `export type Suit = 's' | 'h' | 'd' | 'c'`
- `export type Rank = 2|3|4|5|6|7|8|9|10|11|12|13|14`
- `export interface Card { rank: Rank; suit: Suit }`
- `export function createDeck(): Card[]`
- `export function shuffle(deck: Card[], rng?: () => number): Card[]`
- `export function cardId(c: Card): string` // e.g. `"As"`, `"Td"`
- `export function parseCard(id: string): Card`

Also exported helpers for composition: `SUITS`, `RANKS`.

### Implementation notes

- **createDeck**: cartesian product of 4 suits × 13 ranks → 52 cards.
- **shuffle**: Fisher–Yates on a copy (input not mutated); optional `rng` for deterministic tests (`() => 0.5`).
- **cardId / parseCard**: rank chars `A K Q J T 9..2` + suit char; `parseCard` rejects invalid length/rank/suit.

## TDD sequence

1. Wrote `deck.test.ts` only → `npm test` **failed** with `Cannot find module '../deck'`.
2. Implemented `types.ts` + `deck.ts`.
3. `npm test` **passed** (3/3).

## Test summary

```
✓ src/engine/__tests__/deck.test.ts (3 tests)
  - createDeck has 52 unique cards
  - shuffle preserves multiset
  - parseCard roundtrips

Test Files  1 passed (1)
     Tests  3 passed (3)
```

## Commit

```
feat(engine): add card types and shuffleable deck
```

Scope: `src/engine/**` only (per brief).

## Concerns / follow-ups

- `shuffle` with constant `rng` (`() => 0.5`) always swaps with a fixed relative index; fine for multiset preservation, not a randomness quality test.
- `parseCard` is strict (exactly 2 chars); no lowercase rank letters (`a`/`t`) supported — matches brief examples (`As`, `Td`, `2c`).
- Game-state types in `types.ts` are unused until later tasks; kept as specified for the shared contract.

## Verification commands

```bash
npm test
```
