### Task 9: 鐗屾 UI 缁勪欢锛堢粨鏋勶級

**Files:**
- Create: `src/ui/Card.tsx`, `src/ui/Seat.tsx`, `src/ui/ChipStack.tsx`, `src/ui/ActionBar.tsx`, `src/ui/Table.tsx`
- Create: `src/styles/card.module.css`, `src/styles/table.module.css`, `src/styles/actionBar.module.css`
- Modify: `src/App.tsx` 鈥?playing 鐩镐綅娓叉煋 `Table` + `ActionBar`

**Interfaces:**
- `CardView({ card: Card | null; faceDown?: boolean; highlight?: boolean; className?: string })`
- `SeatView({ seat: Seat; isActing: boolean; showCards: boolean })` 鈥?showCards 褰?hero 鎴?showdown
- `ActionBar({ state, onAction })` 鈥?浠?`isHeroTurn` 鏃跺惎鐢紱鍔犳敞婊戞潯鐢?`getRaiseBounds`
- `Table({ state })` 鈥?妞渾妗屻€? 搴х粷瀵瑰畾浣嶃€佷腑澶?community + pot 鎬婚

**搴т綅鍑犱綍锛圕SS锛夛細** 瀹瑰櫒 `position: relative; aspect-ratio: 16/10`锛涘骇浣嶇敤鐧惧垎姣?top/left锛孒ero 搴曢儴涓ぎ銆?
鐗岄潰锛欳SS 缁樺埗 rank/suit锛堢孩蹇冩柟鍧楃敤 `#ff4d6d`锛岄粦妗冩鑺辩敤杩戠櫧锛夛紱鑳岄潰鐢ㄥ搧绾㈤潚缃戞牸銆?
- [ ] **Step 1: 瀹炵幇 Card / Seat / ChipStack / ActionBar / Table**
- [ ] **Step 2: 鎺ョ嚎 App锛屽幓鎺変复鏃惰皟璇曟寜閽?*
- [ ] **Step 3: 娴忚鍣ㄩ獙鏀跺竷灞€ + 鎻愪氦**

```bash
git commit -m "feat(ui): poker table seats cards and action bar"
```

---

