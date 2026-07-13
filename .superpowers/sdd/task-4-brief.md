### Task 4: 杈规睜 pots

**Files:**
- Create: `src/engine/pots.ts`
- Create: `src/engine/__tests__/pots.test.ts`

**Interfaces:**
- Consumes: `Seat`, `Pot` from `types.ts`
- Produces:
  - `export function computePots(seats: Pick<Seat,'id'|'totalBetThisHand'|'folded'>[]): Pot[]`
  - 瑙勫垯锛氭寜 `totalBetThisHand` 鍒嗗眰锛涘純鐗岃€呯殑绛圭爜杩涘叆姹犱絾 `eligibleSeatIds` 涓嶅惈寮冪墝鑰咃紱`amount` 涓鸿灞傛€荤鐮併€?
- [ ] **Step 1: 鍐欏け璐ユ祴璇?*

```ts
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
    // a 鍏ㄤ笅 50, b/c 鍚?100
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
```

- [ ] **Step 2鈥?: 瀹炵幇銆佹祴閫氥€佹彁浜?*

瀹炵幇锛氭敹闆嗘墍鏈夋鎶曞叆妗ｄ綅鎺掑簭鍘婚噸锛岄€愬眰璁＄畻 delta 脳 浠嶆湁璧勬牸鐨勬姇鍏ヤ汉鏁帮紙鍚凡寮冧絾鎶曞叆鈮ヨ灞傝€呰础鐚噾棰濓級銆?
```bash
npm test
git add src/engine/pots.ts src/engine/__tests__/pots.test.ts
git commit -m "feat(engine): compute main and side pots"
```

---

