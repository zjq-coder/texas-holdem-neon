import { describe, it, expect } from 'vitest'
import { parseCard } from '../deck'
import { evaluateSeven, compareHandValues, handNameZh } from '../handEval'

const C = (...ids: string[]) => ids.map(parseCard)

describe('handEval', () => {
  it('detects royal flush', () => {
    const h = evaluateSeven(C('As', 'Ks', 'Qs', 'Js', 'Ts', '2d', '3c'))
    expect(h.name).toMatch(/皇家同花顺/)
    expect(h.category).toBe(9)
  })

  it('detects wheel straight A-5', () => {
    const h = evaluateSeven(C('As', '2d', '3c', '4h', '5s', '9d', '9c'))
    expect(h.name).toMatch(/顺子/)
    expect(h.category).toBe(4)
    expect(h.ranks[0]).toBe(5)
  })

  it('four of a kind beats full house', () => {
    const quads = evaluateSeven(C('Ah', 'Ad', 'Ac', 'As', 'Kd', '2c', '3h'))
    const boat = evaluateSeven(C('Kh', 'Kd', 'Kc', 'Qs', 'Qd', '2c', '3h'))
    expect(compareHandValues(quads, boat)).toBeGreaterThan(0)
  })

  it('pair kicker decides', () => {
    const a = evaluateSeven(C('Ah', 'Kd', '2c', '2s', '3h', '7d', '9c'))
    const b = evaluateSeven(C('Qh', 'Jd', '2c', '2s', '3h', '7d', '9c'))
    // 公共对2，比踢脚 — 用各自7张
    expect(compareHandValues(a, b)).toBeGreaterThan(0)
  })

  it('flush beats straight', () => {
    const flush = evaluateSeven(C('2h', '5h', '9h', 'Jh', 'Kh', '3c', '4d'))
    const straight = evaluateSeven(C('6c', '7d', '8s', '9h', 'Td', '2c', '3h'))
    expect(compareHandValues(flush, straight)).toBeGreaterThan(0)
  })

  it('handNameZh maps all categories', () => {
    expect(handNameZh(9)).toBe('皇家同花顺')
    expect(handNameZh(8)).toBe('同花顺')
    expect(handNameZh(7)).toBe('四条')
    expect(handNameZh(6)).toBe('葫芦')
    expect(handNameZh(5)).toBe('同花')
    expect(handNameZh(4)).toBe('顺子')
    expect(handNameZh(3)).toBe('三条')
    expect(handNameZh(2)).toBe('两对')
    expect(handNameZh(1)).toBe('一对')
    expect(handNameZh(0)).toBe('高牌')
  })

  it('throws when fewer than 5 cards', () => {
    expect(() => evaluateSeven(C('As', 'Kd', '2c', '3h'))).toThrow()
  })

  it('equal hands compare as 0', () => {
    const a = evaluateSeven(C('Ah', 'Kd', 'Qc', 'Js', '9h', '2d', '3c'))
    const b = evaluateSeven(C('Ad', 'Kh', 'Qs', 'Jc', '9d', '2h', '3s'))
    expect(compareHandValues(a, b)).toBe(0)
  })
})
