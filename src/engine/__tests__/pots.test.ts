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

  it('three-tier side pots for staggered all-ins 30/50/100', () => {
    // a all-in 30, b all-in 50, c calls 100 — three contribution tiers
    const seats = [
      { id: 'a', totalBetThisHand: 30, folded: false },
      { id: 'b', totalBetThisHand: 50, folded: false },
      { id: 'c', totalBetThisHand: 100, folded: false },
    ]
    const pots = computePots(seats)

    expect(pots).toHaveLength(3)
    // main: 30 × 3
    expect(pots[0]).toEqual({ amount: 90, eligibleSeatIds: ['a', 'b', 'c'] })
    // side1: (50-30) × 2
    expect(pots[1]).toEqual({ amount: 40, eligibleSeatIds: ['b', 'c'] })
    // side2: (100-50) × 1
    expect(pots[2]).toEqual({ amount: 50, eligibleSeatIds: ['c'] })

    const totalContributed = seats.reduce((s, p) => s + p.totalBetThisHand, 0)
    const totalPots = pots.reduce((s, p) => s + p.amount, 0)
    expect(totalPots).toBe(totalContributed)
  })
})
