### Task 6: AI 鍐崇瓥

**Files:**
- Create: `src/engine/ai.ts`
- Create: `src/engine/__tests__/ai.test.ts`

**Interfaces:**
- Consumes: `GameState`, `PlayerAction`, `getLegalActions`, `getRaiseBounds`, `evaluateSeven`
- Produces:
  - `export type AiDifficulty = 'tight' | 'standard' | 'loose'`
  - `export function decideAction(state: GameState, difficulty: AiDifficulty, rng?: () => number): PlayerAction`
  - 浠呬娇鐢?`state.seats[actionSeatIndex]` 鐨勫簳鐗?+ 鍏叡鐗岋紱绂佹璇诲彇鍏朵粬搴т綅 holeCards銆?
**鍐崇瓥澶х翰锛?*

1. 鍙?`legal = getLegalActions(state)`銆?2. 缈诲墠锛氱敤绠€鍖?chen 鍒嗘垨瀵瑰瓙/楂樺紶琛ㄥ緱 `strength 0..1`銆?3. 缈诲悗锛歚evaluateSeven(hole+board)` 鐨?category 鏄犲皠 strength锛涘惉鐗岀矖鐣ワ紙鍚岃姳鎶?涓ゅご椤烘娊锛?0.15銆?4. 闃堝€奸殢 difficulty锛歵ight 鏇撮珮寮冪墝绾匡紱loose 鏇翠綆銆?5. 鑻?strength 楂樹笖鍙?raise锛氫互 `min` 鎴?`min*2` 鎴?all-in锛堝皬姒傜巼锛夈€?6. 涓瓑锛歝all/check锛涗綆锛歠old锛堝彲 check 鍒?check锛夈€?7. 杈撳嚭蹇呴』鏄?legal 涓殑 action锛坮aise 鐨?amount 澶瑰湪 bounds 鍐咃級銆?
- [ ] **Step 1: 娴嬭瘯**

```ts
import { describe, it, expect } from 'vitest'
import { createInitialTable, startHand, getLegalActions } from '../game'
import { decideAction } from '../ai'

describe('ai', () => {
  it('returns a legal action', () => {
    let s = startHand(createInitialTable(), () => 0.42)
    // 鑻ラ潪 AI 琛屽姩锛宖old/call 鐩村埌 AI
    for (let i = 0; i < 10; i++) {
      const idx = s.actionSeatIndex
      if (idx !== null && s.seats[idx]!.isAI) break
      const legal = getLegalActions(s)
      s = applyActionNeeded(s, legal) // 娴嬭瘯鍐呰仈锛氫紭鍏?check/call
    }
    const idx = s.actionSeatIndex!
    expect(s.seats[idx]!.isAI).toBe(true)
    const action = decideAction(s, 'standard', () => 0.5)
    const legal = getLegalActions(s)
    expect(legal.some((a) => a.type === action.type)).toBe(true)
  })
})
```

瀹炵幇娴嬭瘯杈呭姪鏃剁洿鎺?import `applyAction`銆?
- [ ] **Step 2鈥?: 瀹炵幇銆佹祴閫氥€佹彁浜?*

```bash
npm test
git commit -m "feat(engine): difficulty-tiered AI decisions"
```

---

