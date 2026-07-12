import { suggestHint } from './engine/hints'
import { ActionBar } from './ui/ActionBar'
import { Table } from './ui/Table'
import { GameProvider, useGame } from './store/gameStore'

function TopBar() {
  const { state, phase } = useGame()
  if (phase === 'start' || phase === 'tutorial') return null

  return (
    <header className="top-bar">
      <div className="top-bar-brand">霓虹德州</div>
      <div className="top-bar-meta">
        盲注 {state.smallBlind}/{state.bigBlind}
      </div>
    </header>
  )
}

function StartScreen() {
  const { startGame, settings, markTutorialDone } = useGame()

  return (
    <main className="app-shell start-shell">
      <div className="start-glow" aria-hidden />
      <h1 className="app-title">霓虹德州</h1>
      <p className="app-subtitle">CYBER HOLD&apos;EM</p>
      <p className="start-blurb">六人桌 · 无限注 · 你 vs 五位霓虹对手</p>
      <div className="start-actions">
        <button
          type="button"
          className="primary-cta"
          onClick={() => startGame(false)}
        >
          开始牌局
        </button>
        {!settings.tutorialDone && (
          <button
            type="button"
            className="ghost-cta"
            onClick={() => {
              markTutorialDone()
              startGame(true)
            }}
          >
            跳过教程
          </button>
        )}
      </div>
    </main>
  )
}

function TutorialScreen() {
  const { markTutorialDone, startGame } = useGame()

  return (
    <main className="app-shell start-shell">
      <h1 className="app-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
        快速入门
      </h1>
      <p className="start-blurb" style={{ maxWidth: 420, lineHeight: 1.7 }}>
        无限注德州扑克：每人两张底牌，五张公共牌。轮流弃牌、过牌、跟注或加注。
        你坐在底座位，与五位 AI 对阵。目标是用最佳五张牌赢取底池。
      </p>
      <button
        type="button"
        className="primary-cta"
        onClick={() => {
          markTutorialDone()
          startGame(true)
        }}
      >
        明白了，开局
      </button>
    </main>
  )
}

function PlayingScreen() {
  const {
    state,
    settings,
    phase,
    dispatchPlayerAction,
    startNewHand,
  } = useGame()

  const hint =
    settings.hintsEnabled && phase === 'playing'
      ? suggestHint(state)
      : null

  const showdown =
    phase === 'showdown' ||
    state.street === 'showdown' ||
    state.street === 'handOver'

  return (
    <main className="play-shell">
      <TopBar />
      <Table
        state={state}
        revealAll={showdown}
        showShowdownOverlay={showdown}
        onNextHand={showdown ? startNewHand : undefined}
      />
      {hint && (
        <div className="hint-strip" role="status">
          提示：{hint}
        </div>
      )}
      {!showdown && (
        <ActionBar state={state} onAction={dispatchPlayerAction} />
      )}
    </main>
  )
}

function GameApp() {
  const { phase } = useGame()

  if (phase === 'start') return <StartScreen />
  if (phase === 'tutorial') return <TutorialScreen />
  return <PlayingScreen />
}

export default function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  )
}
