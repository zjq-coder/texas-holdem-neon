### Task 1: 椤圭洰鑴氭墜鏋朵笌璁捐 tokens

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/styles/animations.css`

**Interfaces:**
- Consumes: 鏃?- Produces: 鍙?`npm run dev` 鐨勭┖澹筹紱CSS 鍙橀噺 `--void`, `--felt`, `--magenta`, `--cyan`, `--gold`, `--smoke`

- [ ] **Step 1: 鍒濆鍖?Vite React-TS 椤圭洰**

鍦ㄤ粨搴撴牴鐩綍锛堝凡鏈?`docs/` 涓?`.git`锛夋墽琛岋細

```bash
npm create vite@latest . -- --template react-ts
```

鑻ユ彁绀虹洰褰曢潪绌猴紝閫夋嫨瑕嗙洊/鍚堝苟锛涗繚鐣?`docs/` 涓庡凡鏈?git 鍘嗗彶銆傜劧鍚庯細

```bash
npm install
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: 閰嶇疆 Vitest**

鍦?`vite.config.ts` 涓細

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

`package.json` scripts 澧炲姞锛?
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: 鍐欏叆 design tokens 涓庡叏灞€鏍峰紡**

`src/styles/tokens.css`:

```css
:root {
  --void: #07060b;
  --felt: #0b1f1a;
  --felt-edge: #050f0c;
  --magenta: #ff2bd6;
  --cyan: #2de2e6;
  --gold: #f5c542;
  --smoke: #a8a4b8;
  --text: #f2f0f7;
  --danger: #ff4d6d;
  --radius-lg: 24px;
  --font-display: "Orbitron", "Rajdhani", system-ui, sans-serif;
  --font-body: "Noto Sans SC", "Segoe UI", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --glow-magenta: 0 0 12px rgba(255, 43, 214, 0.65), 0 0 28px rgba(255, 43, 214, 0.35);
  --glow-cyan: 0 0 12px rgba(45, 226, 230, 0.65), 0 0 28px rgba(45, 226, 230, 0.35);
  --glow-gold: 0 0 10px rgba(245, 197, 66, 0.55);
}
```

`src/styles/global.css`锛氬紩鍏?Google Fonts锛圤rbitron銆丯oto Sans SC銆丣etBrains Mono锛夈€乣body` 鑳屾櫙 `--void`銆佷腑鏂囬粯璁?`font-family: var(--font-body)`銆佸叏灞?`#root` 甯冨眬銆?
`src/styles/animations.css`锛氶鐣?`@keyframes deal-in`, `chip-fly`, `pulse-ring`, `neon-flow`锛涘苟鍔狅細

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: 鏈€灏?App 澹?*

`src/App.tsx` 娓叉煋灞呬腑鏍囬銆岄湏铏瑰痉宸炪€嶄笌鍓爣棰樸€孋YBER HOLD'EM銆嶏紝鑳屾櫙鍏ㄥ睆 void銆俙main.tsx` 寮曞叆 `tokens.css` / `global.css` / `animations.css`銆?
- [ ] **Step 5: 楠岃瘉涓庢彁浜?*

```bash
npm run dev
npm test
```

Expected: 椤甸潰鍙紑锛涙祴璇?0 涓篃鍙€氳繃銆?
```bash
git add package.json package-lock.json vite.config.ts tsconfig*.json index.html src
git commit -m "chore: scaffold Vite React TS with neon design tokens"
```

---

