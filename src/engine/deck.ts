import type { Card, Rank, Suit } from './types'

export const SUITS: readonly Suit[] = ['s', 'h', 'd', 'c'] as const

export const RANKS: readonly Rank[] = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
] as const

const RANK_TO_CHAR: Record<Rank, string> = {
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: 'T',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
}

const CHAR_TO_RANK: Record<string, Rank> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
}

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit })
    }
  }
  return deck
}

/** Fisher–Yates shuffle. Does not mutate the input deck. */
export function shuffle(deck: Card[], rng: () => number = Math.random): Card[] {
  const result = deck.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function cardId(c: Card): string {
  return `${RANK_TO_CHAR[c.rank]}${c.suit}`
}

export function parseCard(id: string): Card {
  if (id.length !== 2) {
    throw new Error(`Invalid card id: ${id}`)
  }
  const rankChar = id[0]
  const suitChar = id[1]
  const rank = CHAR_TO_RANK[rankChar]
  if (rank === undefined) {
    throw new Error(`Invalid rank in card id: ${id}`)
  }
  if (suitChar !== 's' && suitChar !== 'h' && suitChar !== 'd' && suitChar !== 'c') {
    throw new Error(`Invalid suit in card id: ${id}`)
  }
  return { rank, suit: suitChar }
}
