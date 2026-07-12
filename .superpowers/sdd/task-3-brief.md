### Task 3: 鐗屽瀷璇勪及 handEval

**Files:**
- Create: `src/engine/handEval.ts`
- Create: `src/engine/__tests__/handEval.test.ts`

**Interfaces:**
- Consumes: `Card` from `types.ts` / `parseCard` from `deck.ts`
- Produces:
  - `export type HandRankCategory = 0|1|2|3|4|5|6|7|8|9` // high..royal
  - `export interface HandValue { category: HandRankCategory; ranks: number[]; bestFive: Card[]; name: string }`
  - `export function evaluateSeven(cards: Card[]): HandValue` // 5鈥? 寮犲潎鍙紝鍙栨渶浣?5
  - `export function compareHandValues(a: HandValue, b: HandValue): number` // >0 a 鑳?  - `export function handNameZh(category: HandRankCategory): string`

鐗屽瀷 category锛歚9` 鐨囧鍚岃姳椤?鈥?`0` 楂樼墝锛堝疄鐜板唴鍥哄畾鏄犲皠琛級銆?
- [ ] **Step 1: 鍐欏け璐ユ祴璇曪紙瑕嗙洊鍏抽敭杈圭晫锛?*

```ts
import { describe, it, expect } from 'vitest'
import { parseCard } from '../deck'
import { evaluateSeven, compareHandValues } from '../handEval'

const C = (...ids: string[]) => ids.map(parseCard)

describe('handEval', () => {
  it('detects royal flush', () => {
    const h = evaluateSeven(C('As', 'Ks', 'Qs', 'Js', 'Ts', '2d', '3c'))
    expect(h.name).toMatch(/鐨囧鍚岃姳椤?)
  })

  it('detects wheel straight A-5', () => {
    const h = evaluateSeven(C('As', '2d', '3c', '4h', '5s', '9d', '9c'))
    expect(h.name).toMatch(/椤哄瓙/)
  })

  it('four of a kind beats full house', () => {
    const quads = evaluateSeven(C('Ah', 'Ad', 'Ac', 'As', 'Kd', '2c', '3h'))
    const boat = evaluateSeven(C('Kh', 'Kd', 'Kc', 'Qs', 'Qd', '2c', '3h'))
    expect(compareHandValues(quads, boat)).toBeGreaterThan(0)
  })

  it('pair kicker decides', () => {
    const a = evaluateSeven(C('Ah', 'Kd', '2c', '2s', '3h', '7d', '9c'))
    const b = evaluateSeven(C('Qh', 'Jd', '2c', '2s', '3h', '7d', '9c'))
    // 鍏叡瀵?锛屾瘮韪㈣剼 鈥?鐢ㄥ悇鑷?寮?    expect(compareHandValues(a, b)).toBeGreaterThan(0)
  })

  it('flush beats straight', () => {
    const flush = evaluateSeven(C('2h', '5h', '9h', 'Jh', 'Kh', '3c', '4d'))
    const straight = evaluateSeven(C('6c', '7d', '8s', '9h', 'Td', '2c', '3h'))
    expect(compareHandValues(flush, straight)).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: 杩愯纭澶辫触**

```bash
npm test -- src/engine/__tests__/handEval.test.ts
```

Expected: FAIL module not found

- [ ] **Step 3: 瀹炵幇 evaluateSeven**

绠楁硶瑕佺偣锛?1. 鑻?`cards.length < 5` throw銆?2. 鏋氫妇鎵€鏈?5 寮犵粍鍚堬紙C(7,5)=21锛夛紝瀵规瘡缁勬墦鍒嗗彇鏈€澶с€?3. 鍗曠粍 5 寮犺瘎鍒嗭細缁熻 rank 棰戞涓庡悓鑺憋紱椤哄瓙鍚?A-2-3-4-5锛坵heel锛岄珮鐗岃 5锛夈€?4. `ranks` 涓烘瘮杈冨悜閲忥紙鍏?category锛屽啀涓荤墝锛屽啀韪㈣剼锛夈€?5. `name` 鐢ㄤ腑鏂囷細`handNameZh`銆?
- [ ] **Step 4: 娴嬭瘯閫氳繃骞舵彁浜?*

```bash
npm test
git add src/engine/handEval.ts src/engine/__tests__/handEval.test.ts
git commit -m "feat(engine): evaluate 7-card hands with Chinese names"
```

---

