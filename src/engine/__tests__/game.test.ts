import { describe, it, expect } from 'vitest'
import {
  createInitialTable,
  startHand,
  applyAction,
  getLegalActions,
  getRaiseBounds,
  isHeroTurn,
  DEFAULT_BB,
  DEFAULT_SB,
  DEFAULT_STACK,
} from '../game'
import type { GameState } from '../types'

function rngSeq(values: number[]) {
  let i = 0
  return () => values[i++ % values.length]!
}

/** Drive a hand by always choosing call/check when possible. */
function autoCallCheck(s: GameState, guard = 80): GameState {
  let state = s
  for (let i = 0; i < guard; i++) {
    if (state.street === 'handOver' || state.street === 'showdown') break
    if (state.actionSeatIndex === null) break
    const legal = getLegalActions(state)
    const call = legal.find((a) => a.type === 'call')
    const check = legal.find((a) => a.type === 'check')
    const pick = call ?? check ?? legal[0]
    if (!pick) break
    state = applyAction(state, pick)
  }
  return state
}

function foldAllUntil(state: GameState, pred: (s: GameState) => boolean, guard = 20): GameState {
  let s = state
  for (let i = 0; i < guard; i++) {
    if (pred(s)) break
    if (s.street === 'handOver') break
    if (s.actionSeatIndex === null) break
    const legal = getLegalActions(s)
    const fold = legal.find((a) => a.type === 'fold')
    s = applyAction(s, fold ?? legal[0]!)
  }
  return s
}

describe('game', () => {
  it('createInitialTable has 6 seats and hero', () => {
    const s = createInitialTable('你')
    expect(s.seats).toHaveLength(6)
    expect(s.seats.filter((x) => x.isHero)).toHaveLength(1)
    expect(s.seats[0]!.isHero).toBe(true)
    expect(s.seats.every((x) => x.stack === DEFAULT_STACK)).toBe(true)
    expect(s.seats.slice(1).map((x) => x.name)).toEqual([
      'VEX',
      'NOVA',
      'GHOST',
      'PULSE',
      'HEX',
    ])
    expect(s.smallBlind).toBe(DEFAULT_SB)
    expect(s.bigBlind).toBe(DEFAULT_BB)
  })

  it('startHand posts blinds and deals 2 cards', () => {
    let s = createInitialTable()
    s = startHand(s, () => 0.1)
    expect(s.street).toBe('preflop')
    expect(s.holeCardsDealt).toBe(true)
    expect(s.seats.every((x) => x.holeCards?.length === 2)).toBe(true)
    const sb = s.seats[s.sbIndex]!
    const bb = s.seats[s.bbIndex]!
    expect(sb.betThisStreet).toBe(s.smallBlind)
    expect(bb.betThisStreet).toBe(s.bigBlind)
    expect(s.currentBet).toBe(s.bigBlind)
    expect(s.minRaise).toBe(s.bigBlind)
    // 6-max: dealer advances from 5 → 0; SB=1 BB=2; UTG=3
    expect(s.dealerIndex).toBe(0)
    expect(s.sbIndex).toBe(1)
    expect(s.bbIndex).toBe(2)
    expect(s.actionSeatIndex).toBe(3)
  })

  it('fold folds hero and may end hand if all others fold chain', () => {
    let s = startHand(createInitialTable(), () => 0.2)
    for (let i = 0; i < 12; i++) {
      if (s.street === 'handOver') break
      const seat = s.actionSeatIndex
      if (seat === null) break
      if (s.seats[seat]!.isHero) {
        s = applyAction(s, { type: 'fold' })
        expect(s.seats[seat]!.folded).toBe(true)
        break
      }
      const legal = getLegalActions(s)
      const fold = legal.find((a) => a.type === 'fold')
      s = applyAction(s, fold ?? legal[0]!)
    }
  })

  it('check/call path reaches flop when all call bb', () => {
    let s = startHand(createInitialTable(), () => 0.3)
    for (let guard = 0; guard < 40; guard++) {
      if (s.street !== 'preflop') break
      if (s.actionSeatIndex === null) break
      const legal = getLegalActions(s)
      const call = legal.find((a) => a.type === 'call')
      const check = legal.find((a) => a.type === 'check')
      s = applyAction(s, call ?? check ?? legal[0]!)
    }
    expect(s.street).toBe('flop')
    expect(s.communityCards).toHaveLength(3)
  })

  it('illegal action leaves state unchanged', () => {
    const s = startHand(createInitialTable(), () => 0.4)
    const before = s
    // check is illegal when facing a bet (UTG faces BB)
    const next = applyAction(s, { type: 'check' })
    expect(next).toBe(before)
    expect(next.seats[next.actionSeatIndex!]?.betThisStreet).toBe(
      before.seats[before.actionSeatIndex!]?.betThisStreet,
    )
  })

  it('isHeroTurn true only when hero must act', () => {
    let s = startHand(createInitialTable(), () => 0.5)
    // First actor is seat 3 (AI), not hero
    expect(isHeroTurn(s)).toBe(false)
    // Fold to hero at seat 0 — need action to reach hero
    // Order: 3,4,5,0(hero)...
    s = applyAction(s, { type: 'fold' })
    s = applyAction(s, { type: 'fold' })
    s = applyAction(s, { type: 'fold' })
    expect(s.actionSeatIndex).toBe(0)
    expect(isHeroTurn(s)).toBe(true)
  })

  it('BB option: without raise BB may check preflop', () => {
    let s = startHand(createInitialTable(), rngSeq([0.11]))
    // All call to BB: seats 3,4,5,0,1 call; then BB (2) can check
    for (let i = 0; i < 5; i++) {
      const legal = getLegalActions(s)
      const call = legal.find((a) => a.type === 'call')
      s = applyAction(s, call ?? legal[0]!)
    }
    expect(s.actionSeatIndex).toBe(s.bbIndex)
    const legal = getLegalActions(s)
    expect(legal.some((a) => a.type === 'check')).toBe(true)
    s = applyAction(s, { type: 'check' })
    expect(s.street).toBe('flop')
  })

  it('getRaiseBounds returns min/max as street total targets', () => {
    const s = startHand(createInitialTable(), () => 0.6)
    // UTG faces 100, min raise to 200
    const bounds = getRaiseBounds(s)
    expect(bounds).not.toBeNull()
    expect(bounds!.min).toBe(DEFAULT_BB * 2)
    expect(bounds!.max).toBe(DEFAULT_STACK)
  })

  it('raise reopens action; street advances after full orbit', () => {
    let s = startHand(createInitialTable(), () => 0.7)
    // UTG raises to 300
    s = applyAction(s, { type: 'raise', amount: 300 })
    expect(s.currentBet).toBe(300)
    expect(s.minRaise).toBe(200)
    // Everyone must respond; fold all others except force calls then
    // Just fold everyone else → hand over uncontested
    s = foldAllUntil(s, (st) => st.street === 'handOver')
    expect(s.street).toBe('handOver')
    expect(s.winners?.length).toBe(1)
  })

  it('uncontested pot awards chips to last player', () => {
    let s = startHand(createInitialTable(), () => 0.8)
    const raiser = s.actionSeatIndex!
    s = applyAction(s, { type: 'raise', amount: 200 })
    while (s.street !== 'handOver' && s.actionSeatIndex !== null) {
      const legal = getLegalActions(s)
      const fold = legal.find((a) => a.type === 'fold')
      s = applyAction(s, fold!)
    }
    expect(s.street).toBe('handOver')
    const winner = s.winners![0]!
    expect(winner.seatId).toBe(s.seats[raiser]!.id)
    // SB 50 + BB 100 + raise 200 from raiser who already... wait raise to 200 means
    // raiser put 200 total; SB+BB still in. Winner gets pot.
    expect(winner.amount).toBeGreaterThan(0)
    const winnerSeat = s.seats.find((x) => x.id === winner.seatId)!
    expect(winnerSeat.stack).toBe(DEFAULT_STACK - 200 + winner.amount)
  })

  it('full call-check runout reaches handOver with board of 5', () => {
    let s = startHand(createInitialTable(), () => 0.15)
    s = autoCallCheck(s, 120)
    expect(s.street).toBe('handOver')
    expect(s.communityCards).toHaveLength(5)
    expect(s.winners).not.toBeNull()
    expect(s.winners!.length).toBeGreaterThanOrEqual(1)
    // Chip conservation: total stacks == 6 * DEFAULT_STACK
    const total = s.seats.reduce((sum, seat) => sum + seat.stack, 0)
    expect(total).toBe(SEAT_COUNT_STACKS)
  })

  it('all-in preflop runs out board to showdown', () => {
    let s = startHand(createInitialTable(), () => 0.22)
    // UTG all-in
    s = applyAction(s, { type: 'allIn' })
    // Everyone else calls
    for (let guard = 0; guard < 30; guard++) {
      if (s.street === 'handOver') break
      if (s.actionSeatIndex === null) break
      const legal = getLegalActions(s)
      const call = legal.find((a) => a.type === 'call')
      const allIn = legal.find((a) => a.type === 'allIn')
      s = applyAction(s, call ?? allIn ?? legal[0]!)
    }
    expect(s.street).toBe('handOver')
    expect(s.communityCards).toHaveLength(5)
    const total = s.seats.reduce((sum, seat) => sum + seat.stack, 0)
    expect(total).toBe(6 * DEFAULT_STACK)
  })

  it('short stack all-in builds side pot path without losing chips', () => {
    let s = createInitialTable()
    // Make seat 3 short
    s = {
      ...s,
      seats: s.seats.map((seat, i) =>
        i === 3 ? { ...seat, stack: 150 } : { ...seat },
      ),
    }
    s = startHand(s, () => 0.33)
    // seat 3 is UTG with 150 — all-in
    expect(s.actionSeatIndex).toBe(3)
    s = applyAction(s, { type: 'allIn' })
    expect(s.seats[3]!.allIn).toBe(true)
    expect(s.seats[3]!.totalBetThisHand).toBe(150)

    // Others call
    for (let guard = 0; guard < 40; guard++) {
      if (s.street === 'handOver') break
      if (s.actionSeatIndex === null) break
      const legal = getLegalActions(s)
      const call = legal.find((a) => a.type === 'call')
      const check = legal.find((a) => a.type === 'check')
      s = applyAction(s, call ?? check ?? legal[0]!)
    }
    expect(s.street).toBe('handOver')
    const total = s.seats.reduce((sum, seat) => sum + seat.stack, 0)
    expect(total).toBe(5 * DEFAULT_STACK + 150)
  })

  it('startHand marks zero-stack as sittingOut and skips them', () => {
    let s = createInitialTable()
    s = {
      ...s,
      seats: s.seats.map((seat, i) =>
        i === 4 ? { ...seat, stack: 0 } : { ...seat },
      ),
    }
    s = startHand(s, () => 0.41)
    expect(s.seats[4]!.sittingOut).toBe(true)
    expect(s.seats[4]!.holeCards).toBeNull()
    // Active players have cards
    expect(
      s.seats.filter((x) => !x.sittingOut).every((x) => x.holeCards?.length === 2),
    ).toBe(true)
  })

  it('second hand advances dealer button', () => {
    let s = startHand(createInitialTable(), () => 0.12)
    expect(s.dealerIndex).toBe(0)
    // Fold everyone to end hand quickly
    s = foldAllUntil(s, (st) => st.street === 'handOver')
    expect(s.street).toBe('handOver')
    s = startHand(s, () => 0.13)
    expect(s.dealerIndex).toBe(1)
    expect(s.handNumber).toBe(2)
  })
})

const SEAT_COUNT_STACKS = 6 * DEFAULT_STACK
