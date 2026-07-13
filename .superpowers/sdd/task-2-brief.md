### Task 2: engine 绫诲瀷涓庣墝缁?
**Files:**
- Create: `src/engine/types.ts`
- Create: `src/engine/deck.ts`
- Create: `src/engine/__tests__/deck.test.ts`

**Interfaces:**
- Consumes: 鏃?- Produces:
  - `export type Suit = 's' | 'h' | 'd' | 'c'`
  - `export type Rank = 2|3|4|5|6|7|8|9|10|11|12|13|14`
  - `export interface Card { rank: Rank; suit: Suit }`
  - `export function createDeck(): Card[]`
  - `export function shuffle(deck: Card[], rng?: () => number): Card[]`
  - `export function cardId(c: Card): string` // e.g. "As", "Td"
  - `export function parseCard(id: string): Card`

- [ ] **Step 1: 鍐欏け璐ユ祴璇?*

`src/engine/__tests__/deck.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { createDeck, shuffle, parseCard, cardId } from '../deck'

describe('deck', () => {
  it('createDeck has 52 unique cards', () => {
    const d = createDeck()
    expect(d).toHaveLength(52)
    const ids = new Set(d.map(cardId))
    expect(ids.size).toBe(52)
  })

  it('shuffle preserves multiset', () => {
    const d = createDeck()
    const s = shuffle(d, () => 0.5)
    expect(s).toHaveLength(52)
    expect(new Set(s.map(cardId)).size).toBe(52)
  })

  it('parseCard roundtrips', () => {
    expect(cardId(parseCard('As'))).toBe('As')
    expect(cardId(parseCard('Td'))).toBe('Td')
    expect(parseCard('2c')).toEqual({ rank: 2, suit: 'c' })
  })
})
```

- [ ] **Step 2: 杩愯纭澶辫触**

```bash
npm test
```

Expected: FAIL cannot find module `../deck`

- [ ] **Step 3: 瀹炵幇 types + deck**

`types.ts` 鎸夎鏍煎畾涔?`Suit`, `Rank`, `Card`锛屼互鍙婂悗缁細鐢ㄥ埌鐨勶細

```ts
export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'handOver'

export type PlayerActionType = 'fold' | 'check' | 'call' | 'raise' | 'allIn'

export interface PlayerAction {
  type: PlayerActionType
  /** raise: 鏈鎬绘姇鍏ョ洰鏍囷紙鍚凡鎶曞叆锛夛紱allIn 鍙渷鐣?*/
  amount?: number
}

export interface Seat {
  id: string
  name: string
  isHero: boolean
  isAI: boolean
  stack: number
  holeCards: Card[] | null
  betThisStreet: number
  totalBetThisHand: number
  folded: boolean
  allIn: boolean
  sittingOut: boolean
}

export interface Pot {
  amount: number
  eligibleSeatIds: string[]
}

export interface WinnerInfo {
  seatId: string
  amount: number
  handName?: string
  bestFive?: Card[]
}

export interface GameState {
  seats: Seat[]
  communityCards: Card[]
  deck: Card[]
  street: Street
  pots: Pot[]
  /** 褰撳墠琛楅渶瑕佽窡鍒扮殑鏈涓嬫敞棰?*/
  currentBet: number
  /** 鏈鏈€灏忓姞娉ㄥ閲?*/
  minRaise: number
  actionSeatIndex: number | null
  dealerIndex: number
  sbIndex: number
  bbIndex: number
  handNumber: number
  smallBlind: number
  bigBlind: number
  winners: WinnerInfo[] | null
  lastActionLog: string[]
  /** 鏈墜鏄惁宸插彂杩囨墜鐗?*/
  holeCardsDealt: boolean
}
```

`deck.ts`锛歚RANKS`, `SUITS` 鐢熸垚 52 寮狅紱Fisher鈥揧ates `shuffle`锛沗cardId` 鐢?`A,K,Q,J,T,9..2` + suit 瀛楃銆?
- [ ] **Step 4: 娴嬭瘯閫氳繃骞舵彁浜?*

```bash
npm test
git add src/engine
git commit -m "feat(engine): add card types and shuffleable deck"
```

---

