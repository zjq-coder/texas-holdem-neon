import type { Card, GameState, PlayerAction } from './types'
import { getLegalActions, getRaiseBounds } from './game'
import { evaluateSeven } from './handEval'

export type AiDifficulty = 'tight' | 'standard' | 'loose'

/** Fold / raise / all-in strength lines by difficulty. */
const THRESHOLDS: Record<
  AiDifficulty,
  { fold: number; raise: number; allIn: number }
> = {
  // Tight: higher fold line, needs stronger hands to raise
  tight: { fold: 0.45, raise: 0.72, allIn: 0.92 },
  standard: { fold: 0.32, raise: 0.62, allIn: 0.88 },
  loose: { fold: 0.18, raise: 0.52, allIn: 0.82 },
}

/** Map hand category 0..9 → base strength 0..1. */
const CATEGORY_STRENGTH: readonly number[] = [
  0.15, // high card
  0.35, // pair
  0.5, // two pair
  0.62, // trips
  0.72, // straight
  0.78, // flush
  0.85, // full house
  0.92, // quads
  0.96, // straight flush
  1.0, // royal
]

function highCardChenPoints(rank: number): number {
  if (rank === 14) return 10
  if (rank === 13) return 8
  if (rank === 12) return 7
  if (rank === 11) return 6
  return rank / 2
}

/**
 * Simplified Chen formula → strength in [0, 1].
 * Only uses the acting seat's two hole cards.
 */
export function preflopStrength(c1: Card, c2: Card): number {
  const hi = c1.rank >= c2.rank ? c1 : c2
  const lo = c1.rank >= c2.rank ? c2 : c1
  const suited = c1.suit === c2.suit
  const pair = c1.rank === c2.rank

  let score: number
  if (pair) {
    score = Math.max(5, highCardChenPoints(hi.rank) * 2)
  } else {
    score = highCardChenPoints(hi.rank)
    if (suited) score += 2
    const gap = hi.rank - lo.rank - 1
    if (gap === 0) score += 1
    else if (gap === 1) score -= 1
    else if (gap === 2) score -= 2
    else if (gap === 3) score -= 4
    else score -= 5
    // Very low kicker with unconnected high card is weaker
    if (lo.rank <= 7 && gap >= 3) score -= 1
  }

  // Chen scores roughly 0..20 (AA ≈ 20)
  return Math.max(0, Math.min(1, score / 20))
}

/** Four to a flush among hole + board. */
function hasFlushDraw(hole: Card[], board: Card[]): boolean {
  const counts = new Map<string, number>()
  for (const c of [...hole, ...board]) {
    counts.set(c.suit, (counts.get(c.suit) ?? 0) + 1)
  }
  for (const n of counts.values()) {
    if (n === 4) return true
  }
  return false
}

/**
 * Open-ended straight draw: 4 consecutive ranks present among unique ranks,
 * not already a made straight of 5.
 */
function hasOpenEndedStraightDraw(hole: Card[], board: Card[]): boolean {
  const ranks = [...new Set([...hole, ...board].map((c) => c.rank))].sort(
    (a, b) => a - b,
  )
  // Wheel: A-2-3-4 counts as OESD toward 5
  const expanded =
    ranks.includes(14) && !ranks.includes(1) ? [1, ...ranks] : ranks

  for (let i = 0; i <= expanded.length - 4; i++) {
    const window = expanded.slice(i, i + 4)
    if (window[3]! - window[0]! === 3 && new Set(window).size === 4) {
      return true
    }
  }
  return false
}

/**
 * Postflop strength from own hole + board only.
 * Category via evaluateSeven; flush/OESD draws add +0.15 when weak made hand.
 */
export function postflopStrength(hole: Card[], board: Card[]): number {
  const cards = [...hole, ...board]
  if (cards.length < 5) {
    // Should not happen postflop; fall back to preflop-ish on hole only
    return hole.length === 2 ? preflopStrength(hole[0]!, hole[1]!) : 0.2
  }

  const hv = evaluateSeven(cards)
  let strength = CATEGORY_STRENGTH[hv.category] ?? 0.15

  // Draw bonus only when made hand is weak (high card / one pair)
  if (hv.category <= 1) {
    if (hasFlushDraw(hole, board) || hasOpenEndedStraightDraw(hole, board)) {
      strength += 0.15
    }
  }

  return Math.max(0, Math.min(1, strength))
}

function handStrength(state: GameState, hole: Card[]): number {
  if (state.street === 'preflop' || state.communityCards.length === 0) {
    return preflopStrength(hole[0]!, hole[1]!)
  }
  // Board only — never other seats' hole cards
  return postflopStrength(hole, state.communityCards)
}

function pickPassive(legal: PlayerAction[]): PlayerAction {
  const check = legal.find((a) => a.type === 'check')
  if (check) return check
  const call = legal.find((a) => a.type === 'call')
  if (call) return call
  const fold = legal.find((a) => a.type === 'fold')
  if (fold) return fold
  return legal[0]!
}

function pickRaiseOrFallback(
  state: GameState,
  legal: PlayerAction[],
  strength: number,
  thr: { allIn: number },
  rng: () => number,
): PlayerAction {
  const canRaise = legal.some((a) => a.type === 'raise')
  const canAllIn = legal.some((a) => a.type === 'allIn')

  // Small chance of all-in with monster
  if (strength >= thr.allIn && canAllIn && rng() < 0.2) {
    return { type: 'allIn' }
  }

  if (canRaise) {
    const bounds = getRaiseBounds(state)
    if (bounds) {
      const r = rng()
      let amount: number
      if (r < 0.12 && strength >= thr.allIn) {
        amount = bounds.max
      } else if (r < 0.5) {
        // Double min raise target, clamped
        amount = Math.min(bounds.max, bounds.min * 2)
      } else {
        amount = bounds.min
      }
      amount = Math.max(bounds.min, Math.min(bounds.max, amount))
      return { type: 'raise', amount }
    }
  }

  if (canAllIn && strength >= thr.allIn) {
    return { type: 'allIn' }
  }

  return pickPassive(legal)
}

/**
 * Choose an action for the current actor.
 * Uses only `seats[actionSeatIndex].holeCards` + `communityCards` (no peeking).
 * Returned action is always among legal actions (raise amount within bounds).
 */
export function decideAction(
  state: GameState,
  difficulty: AiDifficulty,
  rng: () => number = Math.random,
): PlayerAction {
  const legal = getLegalActions(state)
  if (legal.length === 0) {
    return { type: 'fold' }
  }

  const idx = state.actionSeatIndex
  if (idx === null) {
    return pickPassive(legal)
  }

  const seat = state.seats[idx]!
  // Only this seat's hole cards — never read other seats
  const hole = seat.holeCards
  if (!hole || hole.length < 2) {
    return pickPassive(legal)
  }

  const thr = THRESHOLDS[difficulty]
  let strength = handStrength(state, hole)
  // Small random noise so play is not fully deterministic
  strength = Math.max(0, Math.min(1, strength + (rng() - 0.5) * 0.1))

  const canCheck = legal.some((a) => a.type === 'check')

  // Strong → raise / all-in
  if (strength >= thr.raise) {
    return pickRaiseOrFallback(state, legal, strength, thr, rng)
  }

  // Medium → call / check (loose may semi-bluff raise occasionally)
  if (strength >= thr.fold) {
    if (difficulty === 'loose' && strength >= thr.raise - 0.12 && rng() < 0.15) {
      const raised = pickRaiseOrFallback(state, legal, strength, thr, rng)
      if (raised.type === 'raise' || raised.type === 'allIn') return raised
    }
    return pickPassive(legal)
  }

  // Weak → check if free, else fold
  if (canCheck) {
    return { type: 'check' }
  }
  const fold = legal.find((a) => a.type === 'fold')
  return fold ?? pickPassive(legal)
}
