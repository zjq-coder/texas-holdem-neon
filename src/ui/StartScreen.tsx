import { useGame } from '../store/gameStore'

export function StartScreen() {
  const { startGame, openTutorial } = useGame()

  return (
    <main className="app-shell start-shell">
      <div className="start-glow" aria-hidden />
      <h1 className="app-title">皇家德州</h1>
      <p className="app-subtitle">TEXAS HOLD&apos;EM</p>
      <p className="start-blurb">六人桌 · 无限注 · 绿毡金框 · 你 vs 五位对手</p>
      <div className="start-actions">
        <button
          type="button"
          className="primary-cta"
          onClick={() => startGame(false)}
        >
          开始牌局
        </button>
        <button
          type="button"
          className="ghost-cta"
          onClick={() => openTutorial()}
        >
          教程模式
        </button>
      </div>
    </main>
  )
}
