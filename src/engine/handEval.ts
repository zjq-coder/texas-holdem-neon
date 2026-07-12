import type { Card } from './types'

/** 0 高牌 … 9 皇家同花顺 */
export type HandRankCategory = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface HandValue {
  category: HandRankCategory
  /** 比较向量：主牌与踢脚（不含 category，由 compare 先比 category） */
  ranks: number[]
  bestFive: Card[]
  name: string
}

const HAND_NAME_ZH: Record<HandRankCategory, string> = {
  0: '高牌',
  1: '一对',
  2: '两对',
  3: '三条',
  4: '顺子',
  5: '同花',
  6: '葫芦',
  7: '四条',
  8: '同花顺',
  9: '皇家同花顺',
}

export function handNameZh(category: HandRankCategory): string {
  return HAND_NAME_ZH[category]
}

export function compareHandValues(a: HandValue, b: HandValue): number {
  if (a.category !== b.category) return a.category - b.category
  const len = Math.max(a.ranks.length, b.ranks.length)
  for (let i = 0; i < len; i++) {
    const ra = a.ranks[i] ?? 0
    const rb = b.ranks[i] ?? 0
    if (ra !== rb) return ra - rb
  }
  return 0
}

/**
 * 评估 5–7 张牌中的最佳五张。
 * 少于 5 张抛错。
 */
export function evaluateSeven(cards: Card[]): HandValue {
  if (cards.length < 5) {
    throw new Error(`Need at least 5 cards, got ${cards.length}`)
  }
  if (cards.length === 5) {
    return evaluateFive(cards)
  }

  let best: HandValue | null = null
  for (const five of combinations(cards, 5)) {
    const value = evaluateFive(five)
    if (best === null || compareHandValues(value, best) > 0) {
      best = value
    }
  }
  return best!
}

function evaluateFive(cards: Card[]): HandValue {
  const sorted = [...cards].sort((a, b) => b.rank - a.rank)
  const rankValues = sorted.map((c) => c.rank)
  const isFlush = sorted.every((c) => c.suit === sorted[0].suit)

  const countByRank = new Map<number, number>()
  for (const r of rankValues) {
    countByRank.set(r, (countByRank.get(r) ?? 0) + 1)
  }

  /** [rank, count]，先按 count 降序，再按 rank 降序 */
  const groups = [...countByRank.entries()].sort(
    (a, b) => b[1] - a[1] || b[0] - a[0],
  )

  const straightHigh = getStraightHigh(rankValues)
  const isStraight = straightHigh !== null

  let category: HandRankCategory
  let ranks: number[]

  if (isStraight && isFlush) {
    category = straightHigh === 14 ? 9 : 8
    ranks = [straightHigh]
  } else if (groups[0][1] === 4) {
    category = 7
    ranks = [groups[0][0], groups[1][0]]
  } else if (groups[0][1] === 3 && groups[1]?.[1] === 2) {
    category = 6
    ranks = [groups[0][0], groups[1][0]]
  } else if (isFlush) {
    category = 5
    ranks = rankValues
  } else if (isStraight) {
    category = 4
    ranks = [straightHigh]
  } else if (groups[0][1] === 3) {
    category = 3
    ranks = [groups[0][0], ...groups.slice(1).map(([r]) => r)]
  } else if (groups[0][1] === 2 && groups[1]?.[1] === 2) {
    category = 2
    const highPair = Math.max(groups[0][0], groups[1][0])
    const lowPair = Math.min(groups[0][0], groups[1][0])
    ranks = [highPair, lowPair, groups[2][0]]
  } else if (groups[0][1] === 2) {
    category = 1
    ranks = [groups[0][0], ...groups.slice(1).map(([r]) => r)]
  } else {
    category = 0
    ranks = rankValues
  }

  return {
    category,
    ranks,
    bestFive: sorted,
    name: handNameZh(category),
  }
}

/** 五张牌的顺子高牌；wheel A-5 记为 5；非顺子返回 null */
function getStraightHigh(ranksDesc: number[]): number | null {
  const unique = [...new Set(ranksDesc)].sort((a, b) => b - a)
  if (unique.length !== 5) return null

  if (unique[0] - unique[4] === 4) {
    // 连续五张（因已 unique 且跨度 4）
    return unique[0]
  }

  // A-5-4-3-2 wheel
  if (
    unique[0] === 14 &&
    unique[1] === 5 &&
    unique[2] === 4 &&
    unique[3] === 3 &&
    unique[4] === 2
  ) {
    return 5
  }

  return null
}

function combinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = []
  const path: T[] = []

  function dfs(start: number): void {
    if (path.length === k) {
      result.push(path.slice())
      return
    }
    for (let i = start; i < arr.length; i++) {
      path.push(arr[i])
      dfs(i + 1)
      path.pop()
    }
  }

  dfs(0)
  return result
}
