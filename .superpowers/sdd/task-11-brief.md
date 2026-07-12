### Task 11: 寮€濮嬪睆銆佽缃€佹憡鐗屻€佹暀绋?
**Files:**
- Create: `src/ui/StartScreen.tsx`, `src/ui/SettingsPanel.tsx`, `src/ui/ShowdownModal.tsx`, `src/ui/Tutorial.tsx`, `src/ui/HandRankGuide.tsx`
- Modify: `src/store/gameStore.tsx`, `src/App.tsx`

**琛屼负锛?*

- StartScreen锛氭爣棰樸€岄湏铏瑰痉宸炪€嶃€佹寜閽€屽紑濮嬬墝灞€銆嶃€屾暀绋嬫ā寮忋€嶃€?- Tutorial锛? 姝ラ伄缃╋紝`step` 0..3锛屽畬鎴?璺宠繃 鈫?`markTutorialDone` + `startGame`銆?- SettingsPanel锛氶毦搴︺€侀煶鏁堛€佸姩鐢婚€熷害銆佹彁绀哄紑鍏炽€佸叧闂寜閽€?- HandRankGuide锛氬彲鎶樺彔涔濈鐗屽瀷銆?- ShowdownModal锛氬綋 `state.street === 'handOver' && winners` 鏄剧ず缁撴灉锛涖€屽啀鏉ヤ竴鎵嬨€嶁啋 `startNewHand`銆?- 鎻愮ず鏉★細`settings.hintsEnabled && isHeroTurn` 鏃舵樉绀?`suggestHint(state)`銆?
- [ ] **Step 1: 瀹炵幇涓婅堪缁勪欢骞舵帴鍏?phase 鍒囨崲**
- [ ] **Step 2: 璧伴€氭暀绋嬪洓姝?+ 瀹屾暣涓€鎵嬬粨绠?*
- [ ] **Step 3: 鎻愪氦**

```bash
git commit -m "feat(ui): start screen tutorial settings and showdown"
```

---

