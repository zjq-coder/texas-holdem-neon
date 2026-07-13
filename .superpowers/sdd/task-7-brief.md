### Task 7: 鎻愮ず hints + settings 鎸佷箙鍖?
**Files:**
- Create: `src/engine/hints.ts`
- Create: `src/store/settings.ts`

**Interfaces:**
- Produces:
  - `export function suggestHint(state: GameState): string` 鈥?涓€鍙ヤ腑鏂囧缓璁?  - `export interface Settings { difficulty: AiDifficulty; sfx: boolean; animationSpeed: 'slow'|'normal'|'fast'; hintsEnabled: boolean; tutorialDone: boolean; playerName: string }`
  - `export const defaultSettings: Settings`
  - `export function loadSettings(): Settings`
  - `export function saveSettings(s: Settings): void` 鈥?key `poker.settings` 涓?`poker.tutorialDone` 鍙悎骞惰繘涓€涓?JSON

- [ ] **Step 1鈥?: 瀹炵幇 hints锛堝熀浜庢墜鐗屽己搴︽枃妗堬級涓?settings 璇诲啓锛涙棤寮哄埗鍗曟祴锛涙墜鍔ㄥ湪 node 涓彲娴?load 榛樿鍊?*

```ts
// settings.ts 鏍稿績
const KEY = 'poker.settings'
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaultSettings }
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    return { ...defaultSettings }
  }
}
```

- [ ] **Step 4: 鎻愪氦**

```bash
git add src/engine/hints.ts src/store/settings.ts
git commit -m "feat: practice hints and localStorage settings"
```

---

