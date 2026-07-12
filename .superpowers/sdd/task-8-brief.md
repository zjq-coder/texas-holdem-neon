### Task 8: React store 涓庡彲鐜╁惊鐜?
**Files:**
- Create: `src/store/gameStore.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces context锛?  - `state: GameState`
  - `settings: Settings`
  - `phase: 'start' | 'tutorial' | 'playing' | 'showdown'`
  - `dispatchPlayerAction(action: PlayerAction): void`
  - `startNewHand(): void`
  - `startGame(fromTutorial?: boolean): void`
  - `updateSettings(partial: Partial<Settings>): void`
  - `markTutorialDone(): void`

**AI 寰幆锛?* `useEffect` 渚濊禆 `state.actionSeatIndex` + street锛涜嫢褰撳墠搴ф槸 AI 涓?`street` 闈?`handOver`/`showdown` 灞曠ず鏈燂紝鍒?`delay = base * speedMul` 鍚?`decideAction` + `applyAction`銆侶ero 琛屽姩涓嶈嚜鍔ㄣ€?
- [ ] **Step 1: 瀹炵幇 GameProvider**

```tsx
// 浼唬鐮佺粨鏋?function reduce(state, action) { return applyAction(state, action) }

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(loadSettings)
  const [table, setTable] = useState(() => createInitialTable())
  const [phase, setPhase] = useState<'start' | 'tutorial' | 'playing'>('start')
  // ...
}
```

- [ ] **Step 2: App 鎺ュ叆 Provider锛涗复鏃惰皟璇?UI锛氭樉绀?street銆佸簳姹犮€佸悎娉曟寜閽函鏂囧瓧**

纭繚鏃犳牱寮忎篃鑳斤細寮€濮?鈫?startHand 鈫?鐐?call/fold 鈫?AI 鑷姩璧板畬缈诲墠銆?
- [ ] **Step 3: 鎵嬪姩楠岃瘉 + 鎻愪氦**

```bash
npm run dev
# 鎵嬪姩鎵撳畬涓€鎵?git add src/store/gameStore.tsx src/App.tsx
git commit -m "feat: wire game store with AI auto-act loop"
```

---

