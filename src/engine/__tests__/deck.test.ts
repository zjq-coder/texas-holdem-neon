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
