import type { Pot, Seat } from './types'

type SeatBet = Pick<Seat, 'id' | 'totalBetThisHand' | 'folded'>

/**
 * 按 totalBetThisHand 分层构建主池与边池。
 * 弃牌者的筹码进入池金额，但不进入 eligibleSeatIds。
 */
export function computePots(seats: SeatBet[]): Pot[] {
  const levels = [
    ...new Set(
      seats
        .map((s) => s.totalBetThisHand)
        .filter((n) => n > 0),
    ),
  ].sort((a, b) => a - b)

  const pots: Pot[] = []
  let prev = 0

  for (const level of levels) {
    const delta = level - prev
    if (delta <= 0) {
      prev = level
      continue
    }

    const contributors = seats.filter((s) => s.totalBetThisHand >= level)
    if (contributors.length === 0) {
      prev = level
      continue
    }

    const amount = delta * contributors.length
    const eligibleSeatIds = contributors
      .filter((s) => !s.folded)
      .map((s) => s.id)

    // 无人有资格赢取时仍保留池金额（仅弃牌者投入）— 金额仍需归池
    pots.push({ amount, eligibleSeatIds })
    prev = level
  }

  return pots
}
