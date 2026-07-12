import { describe, it, expect } from 'vitest'
import { computePots } from '../pots'

describe('computePots', () => {
  it('single main pot when even contributions', () => {
    const pots = computePots([
      { id: 'a', totalBetThisHand: 100, folded: false },
      { id: 'b', totalBetThisHand: 100, folded: false },
    ])
    expect(pots).toEqual([{ amount: 200, eligibleSeatIds: ['a', 'b'] }])
  })

  it('side pot when one all-in short', () => {
    // a 全下 50, b/c 各 100
    const pots = computePots([
      { id: 'a', totalBetThisHand: 50, folded: false },
      { id: 'b', totalBetThisHand: 100, folded: false },
      { id: 'c', totalBetThisHand: 100, folded: false },
    ])
    expect(pots).toHaveLength(2)
    expect(pots[0]).toEqual({ amount: 150, eligibleSeatIds: ['a', 'b', 'c'] })
    expect(pots[1]).toEqual({ amount: 100, eligibleSeatIds: ['b', 'c'] })
  })

  it('folded player chips in pot but not eligible', () => {
    const pots = computePots([
      { id: 'a', totalBetThisHand: 100, folded: true },
      { id: 'b', totalBetThisHand: 100, folded: false },
      { id: 'c', totalBetThisHand: 100, folded: false },
    ])
    expect(pots[0].amount).toBe(300)
    expect(pots[0].eligibleSeatIds).toEqual(['b', 'c'])
  })
})
