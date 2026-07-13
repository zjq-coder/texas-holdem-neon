### Task 5: 娓告垙鐘舵€佹満 game.ts

**Files:**
- Create: `src/engine/game.ts`
- Create: `src/engine/__tests__/game.test.ts`

**Interfaces:**
- Consumes: `types`, `deck`, `handEval`, `pots`
- Produces:
  - `export const DEFAULT_STACK = 10_000`
  - `export const DEFAULT_SB = 50`
  - `export const DEFAULT_BB = 100`
  - `export function createInitialTable(heroName?: string): GameState` 鈥?6 搴э紝Hero 涓?index 0 鎴栧簳閮ㄧ害瀹?index 3锛涘缓璁?**Hero 鍥哄畾 seats[0]**锛孶I 鍐嶆槧灏勫埌搴曞骇銆?  - `export function startHand(state: GameState, rng?: () => number): GameState`
  - `export function getLegalActions(state: GameState): PlayerAction[]` 鈥?瀵?`actionSeatIndex`锛況aise 鐢ㄥ彲閫?amount 鑼冨洿鍏冩暟鎹細鍚屾椂 export `export function getRaiseBounds(state): { min: number; max: number } | null` 鍏朵腑 min/max 涓烘湰琛楁€绘姇鍏ョ洰鏍囥€?  - `export function applyAction(state: GameState, action: PlayerAction): GameState`
  - `export function isHeroTurn(state: GameState): boolean`

**琛屼负缁嗚妭锛堝繀椤婚伒瀹堬級锛?*

1. `startHand`锛氱Щ闄?`stack===0` 涓?`sittingOut`锛涘簞瀹朵綅 `dealerIndex = (prev+1)%n`锛堣烦杩?sittingOut锛夛紱璁?sb/bb锛涙敹鐩诧紙涓嶈冻鍒?all-in锛夛紱娲楃墝鍙戞瘡浜?2 寮狅紱`street=preflop`锛沗currentBet=bb`锛沗minRaise=bb`锛涜鍔ㄤ汉涓?bb 涓嬩竴浣嶆湭寮冩湭鍧愬嚭銆?2. `applyAction`锛氭牎楠屽悎娉曪紱鏇存柊 stack/bet锛涜嫢琛楃粨鏉熷垯鍙戝叕鍏辩墝鎴栬繘鍏?showdown銆?3. 琛楃粨鏉熸潯浠讹細姣忎綅鏈純闈?all-in 鐜╁鏈 `betThisStreet === currentBet` 涓旈兘宸茶鍔ㄨ嚦灏戜竴娆★紙澶х洸缈诲墠鏈熸潈锛氳嫢鏃犱汉鍔犳敞锛屽ぇ鐩茶繕鍙?check/raise 鈥斺€?鐢?`playersActedThisStreet` Set 鎴?`pendingToAct` 璁℃暟瀹炵幇锛夈€?4. 鍏ㄥ憳 all-in 鎴栧彧鍓?鈮? 浜哄彲琛屽姩锛氳窇瀹屽叕鍏辩墝鑷?5 寮?鈫?showdown銆?5. 鍙墿 1 浜烘湭寮冿細鐩存帴 `handOver`锛岃鐜╁璧㈠叏閮?`pots`锛堢敤 `computePots`锛夈€?6. showdown锛氬姣忎釜 pot锛屽湪 eligible 涓?`evaluateSeven` 姣旂墝锛涘钩鍒嗘椂濂囨暟绛圭爜缁欐渶闈犲簞瀹跺乏渚х殑鑾疯儨鑰咃紙浠?dealer 涓嬩竴浣嶈捣鎵級銆?7. 闈炴硶 action锛歚return state`锛堝紩鐢ㄧ浉绛夋垨娣辩瓑鍧囧彲锛屾祴璇曠敤缁撴灉瀛楁鍒ゆ柇鏈彉锛夈€?
- [ ] **Step 1: 鍐欏け璐ユ祴璇曪紙鏍稿績璺緞锛?*

```ts
import { describe, it, expect } from 'vitest'
import {
  createInitialTable,
  startHand,
  applyAction,
  getLegalActions,
  DEFAULT_BB,
} from '../game'

// 鍥哄畾 RNG锛氭€绘槸杩斿洖 0锛屼娇 shuffle 鍙噸澶嶏紙鎴栨敞鍏ュ凡娲楃墝鐘舵€佺殑娴嬭瘯杈呭姪锛?function rngSeq(values: number[]) {
  let i = 0
  return () => values[i++ % values.length]!
}

describe('game', () => {
  it('createInitialTable has 6 seats and hero', () => {
    const s = createInitialTable('浣?)
    expect(s.seats).toHaveLength(6)
    expect(s.seats.filter((x) => x.isHero)).toHaveLength(1)
    expect(s.seats.every((x) => x.stack === 10_000)).toBe(true)
  })

  it('startHand posts blinds and deals 2 cards', () => {
    let s = createInitialTable()
    s = startHand(s, () => 0.1)
    expect(s.street).toBe('preflop')
    expect(s.seats.every((x) => x.holeCards?.length === 2)).toBe(true)
    const sb = s.seats[s.sbIndex]!
    const bb = s.seats[s.bbIndex]!
    expect(sb.betThisStreet).toBe(s.smallBlind)
    expect(bb.betThisStreet).toBe(s.bigBlind)
  })

  it('fold folds hero and may end hand if all others fold chain', () => {
    let s = startHand(createInitialTable(), () => 0.2)
    // 灏嗚鍔ㄨ浆鍒?hero锛氬惊鐜?fold AI until hero or hand over
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
    // 鎵€鏈変汉 call 鎴?check 鐩村埌缈荤墝
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
})
```

- [ ] **Step 2: 杩愯纭澶辫触**

```bash
npm test -- src/engine/__tests__/game.test.ts
```

- [ ] **Step 3: 瀹炵幇 game.ts**

寤鸿鍐呴儴杈呭姪锛?- `nextActiveSeat(state, fromExclusive): number | null`
- `activeContenders(state)` 鈥?鏈純鐗屼笖鏈?sittingOut
- `canStillAct(seat)` 鈥?鏈純鏈?all-in 鏈?sittingOut
- `streetComplete` / `advanceStreet` / `runoutAndShowdown` / `awardPots`

AI 鍚嶅瓧鍥哄畾锛歚['VEX','NOVA','GHOST','PULSE','HEX']`銆?
- [ ] **Step 4: 娴嬮€氬苟鎻愪氦**

```bash
npm test
git add src/engine/game.ts src/engine/__tests__/game.test.ts
git commit -m "feat(engine): NLHE hand state machine with blinds and streets"
```

---

