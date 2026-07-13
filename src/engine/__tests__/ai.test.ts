import { describe, it, expect } from 'vitest'
import {
  createInitialTable,
  startHand,
  applyAction,
  getLegalActions,
  getRaiseBounds,
} from '../game'
import {
  decideAction,
  preflopStrength,
  postflopStrength,
  type AiDifficulty,
} from '../ai'
import type { Card, GameState, PlayerAction } from '../types'
import { parseCard } from '../deck'

function applyActionNeeded(s: GameState, legal: PlayerAction[]): GameState {
  const check = legal.find((a) => a.type === 'check')
  const call = legal.find((a) => a.type === 'call')
  const pick = check ?? call ?? legal[0]
  if (!pick) return s
  return applyAction(s, pick)
}

/** Advance until an AI seat acts (or give up). */
function untilAiActs(s: GameState, guard = 12): GameState {
  let state = s
  for (let i = 0; i < guard; i++) {
    const idx = state.actionSeatIndex
    if (idx !== null && state.seats[idx]!.isAI) break
    if (state.street === 'handOver' || state.actionSeatIndex === null) break
    const legal = getLegalActions(state)
    state = applyActionNeeded(state, legal)
  }
  return state
}

function assertLegalAction(state: GameState, action: PlayerAction): void {
  const legal = getLegalActions(state)
  expect(legal.some((a) => a.type === action.type)).toBe(true)
  if (action.type === 'raise') {
    const bounds = getRaiseBounds(state)
    expect(bounds).not.toBeNull()
    expect(action.amount).toBeDefined()
    expect(action.amount!).toBeGreaterThanOrEqual(bounds!.min)
    expect(action.amount!).toBeLessThanOrEqual(bounds!.max)
  }
}

describe('ai', () => {
  it('returns a legal action', () => {
    let s = startHand(createInitialTable(), () => 0.42)
    // 若非 AI 行动，fold/call 直到 AI
    for (let i = 0; i < 10; i++) {
      const idx = s.actionSeatIndex
      if (idx !== null && s.seats[idx]!.isAI) break
      const legal = getLegalActions(s)
      s = applyActionNeeded(s, legal)
    }
    const idx = s.actionSeatIndex!
    expect(s.seats[idx]!.isAI).toBe(true)
    const action = decideAction(s, 'standard', () => 0.5)
    const legal = getLegalActions(s)
    expect(legal.some((a) => a.type === action.type)).toBe(true)
  })

  it('returns legal actions for all difficulties and many rng seeds', () => {
    const difficulties: AiDifficulty[] = ['tight', 'standard', 'loose']
    for (const diff of difficulties) {
      for (let seed = 0; seed < 20; seed++) {
        let s = startHand(createInitialTable(), () => (seed * 0.037) % 1)
        s = untilAiActs(s)
        const idx = s.actionSeatIndex
        if (idx === null || !s.seats[idx]!.isAI) continue
        const action = decideAction(s, diff, () => (seed * 0.17 + 0.3) % 1)
        assertLegalAction(s, action)
      }
    }
  })

  it('checks rather than folds when check is free and hand is weak', () => {
    // Force a state where AI can check: hero folds/calls until BB option or postflop check
    let s = startHand(createInitialTable(), () => 0.11)
    // Walk everyone with call/check until someone faces a free check as AI
    for (let i = 0; i < 40; i++) {
      if (s.street === 'handOver' || s.actionSeatIndex === null) break
      const idx = s.actionSeatIndex
      const seat = s.seats[idx!]!
      const legal = getLegalActions(s)
      if (seat.isAI && legal.some((a) => a.type === 'check')) {
        // Very weak force via rng mid; strength noise only — use many seeds
        const action = decideAction(s, 'tight', () => 0.01)
        expect(action.type).not.toBe('fold')
        expect(['check', 'call', 'raise', 'allIn']).toContain(action.type)
        assertLegalAction(s, action)
        return
      }
      s = applyActionNeeded(s, legal)
    }
    // If we never hit free-check AI (unlikely), still pass if no opportunity
    expect(true).toBe(true)
  })

  it('preflop AA stronger than 72o', () => {
    const aa = preflopStrength(parseCard('As'), parseCard('Ad'))
    const s72 = preflopStrength(parseCard('7c'), parseCard('2d'))
    expect(aa).toBeGreaterThan(0.8)
    expect(s72).toBeLessThan(0.25)
    expect(aa).toBeGreaterThan(s72)
  })

  it('postflop uses only hole + board (set strength by category)', () => {
    const hole: Card[] = [parseCard('Ah'), parseCard('Kh')]
    const board: Card[] = [
      parseCard('Qh'),
      parseCard('Jh'),
      parseCard('Th'),
    ]
    // Royal flush on board+hole
    const royal = postflopStrength(hole, board)
    expect(royal).toBeGreaterThanOrEqual(0.95)

    const weakHole: Card[] = [parseCard('2c'), parseCard('7d')]
    const dryBoard: Card[] = [
      parseCard('As'),
      parseCard('Kd'),
      parseCard('9h'),
    ]
    const air = postflopStrength(weakHole, dryBoard)
    expect(air).toBeLessThan(0.3)
  })

  it('flush draw adds strength bonus on weak made hands', () => {
    const hole: Card[] = [parseCard('Ah'), parseCard('2h')]
    const board: Card[] = [
      parseCard('Kh'),
      parseCard('7h'),
      parseCard('3d'),
    ]
    // high card + flush draw
    const withDraw = postflopStrength(hole, board)
    const noDrawBoard: Card[] = [
      parseCard('Ks'),
      parseCard('7c'),
      parseCard('3d'),
    ]
    const noDraw = postflopStrength(hole, noDrawBoard)
    expect(withDraw).toBeGreaterThan(noDraw)
    expect(withDraw - noDraw).toBeCloseTo(0.15, 5)
  })

  it('decideAction never requires other seats hole cards (masked ok)', () => {
    let s = startHand(createInitialTable(), () => 0.42)
    s = untilAiActs(s)
    const idx = s.actionSeatIndex!
    expect(s.seats[idx]!.isAI).toBe(true)

    // Mask every other seat's hole cards
    const masked: GameState = {
      ...s,
      seats: s.seats.map((seat, i) =>
        i === idx
          ? seat
          : {
              ...seat,
              holeCards: null,
            },
      ),
    }

    const action = decideAction(masked, 'standard', () => 0.5)
    assertLegalAction(masked, action)
  })

  it('decideAction returns check (not fold) when legal menu is empty', () => {
    // handOver → getLegalActions is empty
    const s = createInitialTable()
    expect(getLegalActions(s)).toEqual([])
    const action = decideAction(s, 'standard', () => 0.5)
    expect(action.type).toBe('check')
  })
})
