BASE 393bc1e44d6c3ea4c5864362a13f276c1630c762
HEAD cfdd984450c83d71e3c3a44a732218a0213fa2c2

cfdd984 feat(engine): add card types and shuffleable deck
 src/engine/__tests__/deck.test.ts | 24 ++++++++++++
 src/engine/deck.ts                | 79 +++++++++++++++++++++++++++++++++++++++
 src/engine/types.ts               | 67 +++++++++++++++++++++++++++++++++
 3 files changed, 170 insertions(+)
diff --git a/src/engine/__tests__/deck.test.ts b/src/engine/__tests__/deck.test.ts
new file mode 100644
index 0000000..d563880
--- /dev/null
+++ b/src/engine/__tests__/deck.test.ts
@@ -0,0 +1,24 @@
+import { describe, it, expect } from 'vitest'
+import { createDeck, shuffle, parseCard, cardId } from '../deck'
+
+describe('deck', () => {
+  it('createDeck has 52 unique cards', () => {
+    const d = createDeck()
+    expect(d).toHaveLength(52)
+    const ids = new Set(d.map(cardId))
+    expect(ids.size).toBe(52)
+  })
+
+  it('shuffle preserves multiset', () => {
+    const d = createDeck()
+    const s = shuffle(d, () => 0.5)
+    expect(s).toHaveLength(52)
+    expect(new Set(s.map(cardId)).size).toBe(52)
+  })
+
+  it('parseCard roundtrips', () => {
+    expect(cardId(parseCard('As'))).toBe('As')
+    expect(cardId(parseCard('Td'))).toBe('Td')
+    expect(parseCard('2c')).toEqual({ rank: 2, suit: 'c' })
+  })
+})
diff --git a/src/engine/deck.ts b/src/engine/deck.ts
new file mode 100644
index 0000000..47a78a5
--- /dev/null
+++ b/src/engine/deck.ts
@@ -0,0 +1,79 @@
+import type { Card, Rank, Suit } from './types'
+
+export const SUITS: readonly Suit[] = ['s', 'h', 'd', 'c'] as const
+
+export const RANKS: readonly Rank[] = [
+  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
+] as const
+
+const RANK_TO_CHAR: Record<Rank, string> = {
+  2: '2',
+  3: '3',
+  4: '4',
+  5: '5',
+  6: '6',
+  7: '7',
+  8: '8',
+  9: '9',
+  10: 'T',
+  11: 'J',
+  12: 'Q',
+  13: 'K',
+  14: 'A',
+}
+
+const CHAR_TO_RANK: Record<string, Rank> = {
+  '2': 2,
+  '3': 3,
+  '4': 4,
+  '5': 5,
+  '6': 6,
+  '7': 7,
+  '8': 8,
+  '9': 9,
+  T: 10,
+  J: 11,
+  Q: 12,
+  K: 13,
+  A: 14,
+}
+
+export function createDeck(): Card[] {
+  const deck: Card[] = []
+  for (const suit of SUITS) {
+    for (const rank of RANKS) {
+      deck.push({ rank, suit })
+    }
+  }
+  return deck
+}
+
+/** Fisher鈥揧ates shuffle. Does not mutate the input deck. */
+export function shuffle(deck: Card[], rng: () => number = Math.random): Card[] {
+  const result = deck.slice()
+  for (let i = result.length - 1; i > 0; i--) {
+    const j = Math.floor(rng() * (i + 1))
+    ;[result[i], result[j]] = [result[j], result[i]]
+  }
+  return result
+}
+
+export function cardId(c: Card): string {
+  return `${RANK_TO_CHAR[c.rank]}${c.suit}`
+}
+
+export function parseCard(id: string): Card {
+  if (id.length !== 2) {
+    throw new Error(`Invalid card id: ${id}`)
+  }
+  const rankChar = id[0]
+  const suitChar = id[1]
+  const rank = CHAR_TO_RANK[rankChar]
+  if (rank === undefined) {
+    throw new Error(`Invalid rank in card id: ${id}`)
+  }
+  if (suitChar !== 's' && suitChar !== 'h' && suitChar !== 'd' && suitChar !== 'c') {
+    throw new Error(`Invalid suit in card id: ${id}`)
+  }
+  return { rank, suit: suitChar }
+}
diff --git a/src/engine/types.ts b/src/engine/types.ts
new file mode 100644
index 0000000..6c0adfc
--- /dev/null
+++ b/src/engine/types.ts
@@ -0,0 +1,67 @@
+export type Suit = 's' | 'h' | 'd' | 'c'
+
+export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14
+
+export interface Card {
+  rank: Rank
+  suit: Suit
+}
+
+export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'handOver'
+
+export type PlayerActionType = 'fold' | 'check' | 'call' | 'raise' | 'allIn'
+
+export interface PlayerAction {
+  type: PlayerActionType
+  /** raise: 鏈鎬绘姇鍏ョ洰鏍囷紙鍚凡鎶曞叆锛夛紱allIn 鍙渷鐣?*/
+  amount?: number
+}
+
+export interface Seat {
+  id: string
+  name: string
+  isHero: boolean
+  isAI: boolean
+  stack: number
+  holeCards: Card[] | null
+  betThisStreet: number
+  totalBetThisHand: number
+  folded: boolean
+  allIn: boolean
+  sittingOut: boolean
+}
+
+export interface Pot {
+  amount: number
+  eligibleSeatIds: string[]
+}
+
+export interface WinnerInfo {
+  seatId: string
+  amount: number
+  handName?: string
+  bestFive?: Card[]
+}
+
+export interface GameState {
+  seats: Seat[]
+  communityCards: Card[]
+  deck: Card[]
+  street: Street
+  pots: Pot[]
+  /** 褰撳墠琛岄渶瑕佽窡鍒扮殑鏈涓嬫敞棰?*/
+  currentBet: number
+  /** 鏈鏈€灏忓姞娉ㄥ閲?*/
+  minRaise: number
+  actionSeatIndex: number | null
+  dealerIndex: number
+  sbIndex: number
+  bbIndex: number
+  handNumber: number
+  smallBlind: number
+  bigBlind: number
+  winners: WinnerInfo[] | null
+  lastActionLog: string[]
+  /** 鏈墜鏄惁宸插彂杩囨墜鐗?*/
+  holeCardsDealt: boolean
+}
