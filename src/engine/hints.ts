import type { GameState } from './types'
import { getLegalActions, isHeroTurn } from './game'
import { preflopStrength, postflopStrength } from './ai'

/** Strength of hero hole + board (no other seats' cards). */
function heroStrength(state: GameState, hole: NonNullable<GameState['seats'][0]['holeCards']>): number {
  if (state.street === 'preflop' || state.communityCards.length === 0) {
    return preflopStrength(hole[0]!, hole[1]!)
  }
  return postflopStrength(hole, state.communityCards)
}

/**
 * One-line Chinese practice hint from hero hand strength + legal options.
 * Advisory only — never auto-acts.
 */
export function suggestHint(state: GameState): string {
  if (state.street === 'showdown' || state.street === 'handOver') {
    return '本手已结束，等待下一手。'
  }

  const hero = state.seats.find((s) => s.isHero)
  if (!hero) {
    return '暂无提示。'
  }
  if (hero.folded) {
    return '你已弃牌，等待本手结束。'
  }
  if (!hero.holeCards || hero.holeCards.length < 2) {
    return '等待发牌…'
  }

  const strength = heroStrength(state, hero.holeCards)
  const legal = isHeroTurn(state) ? getLegalActions(state) : []
  const canCheck = legal.some((a) => a.type === 'check')
  const canCall = legal.some((a) => a.type === 'call')
  const canRaise = legal.some((a) => a.type === 'raise' || a.type === 'allIn')

  // Strong (pair+ / premium preflop range)
  if (strength >= 0.72) {
    if (canRaise) return '牌力很强，建议加注施压。'
    if (canCall) return '牌力很强，建议跟注。'
    if (canCheck) return '牌力很强，可过牌观察。'
    return '牌力很强，可积极行动。'
  }

  // Good made hand / solid starting hand
  if (strength >= 0.5) {
    if (canRaise) return '牌力较好，可考虑小加注或跟注。'
    if (canCall) return '牌力中等偏上，建议跟注。'
    if (canCheck) return '牌力较好，建议过牌控池。'
    return '牌力较好，可谨慎进攻。'
  }

  // Medium — call/check range
  if (strength >= 0.32) {
    if (canCheck) return '牌力一般，建议过牌。'
    if (canCall) return '牌力一般，可谨慎跟注，注意底池赔率。'
    return '牌力一般，谨慎行动。'
  }

  // Weak
  if (canCheck) return '牌力较弱，建议过牌；不要主动加注。'
  if (canCall || legal.some((a) => a.type === 'fold')) {
    return '牌力较弱，建议弃牌。'
  }
  return '牌力较弱，优先保本。'
}
