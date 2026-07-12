import { useState } from 'react'
import { isHeroTurn } from './engine/game'
import { suggestHint } from './engine/hints'
import { ActionBar } from './ui/ActionBar'
import { HandRankGuide } from './ui/HandRankGuide'
import { SettingsPanel } from './ui/SettingsPanel'
import { ShowdownModal } from './ui/ShowdownModal'
import { StartScreen } from './ui/StartScreen'
import { Table } from './ui/Table'
import { Tutorial } from './ui/Tutorial'
import { GameProvider, useGame } from './store/gameStore'

function TopBar({
  onOpenSettings,
  onOpenTutorial,
}: {
  onOpenSettings: () => void
  onOpenTutorial: () => void
}) {
  const { state } = useGame()

  return (
    <header className="top-bar">
      <div className="top-bar-brand">霓虹德州</div>
      <div className="top-bar-meta">
        盲注 {state.smallBlind}/{state.bigBlind}
      </div>
      <div className="top-bar-actions">
        <button type="button" className="top-bar-btn" onClick={onOpenTutorial}>
          教程
        </button>
        <button type="button" className="top-bar-btn" onClick={onOpenSettings}>
          设置
        </button>
      </div>
    </header>
  )
}

function TutorialPhase() {
  const { markTutorialDone, startGame } = useGame()

  const finish = () => {
    markTutorialDone()
    startGame(true)
  }

  return (
    <main className="app-shell start-shell tutorial-phase">
      <div className="start-glow" aria-hidden />
      <Tutorial onComplete={finish} onSkip={finish} />
    </main>
  )
}

function PlayingScreen() {
  const {
    state,
    settings,
    phase,
    sessionOutcome,
    dispatchPlayerAction,
    startNewHand,
    restartSession,
    markTutorialDone,
  } = useGame()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [tutorialOpen, setTutorialOpen] = useState(false)

  const heroTurn = isHeroTurn(state)
  const hint =
    settings.hintsEnabled && heroTurn && phase === 'playing'
      ? suggestHint(state)
      : null

  const showdown =
    phase === 'showdown' ||
    state.street === 'showdown' ||
    state.street === 'handOver'

  return (
    <main className="play-shell">
      <TopBar
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenTutorial={() => setTutorialOpen(true)}
      />
      <Table state={state} revealAll={showdown} />
      <HandRankGuide />
      {hint && (
        <div className="hint-strip" role="status">
          提示：{hint}
        </div>
      )}
      {!showdown && (
        <ActionBar state={state} onAction={dispatchPlayerAction} />
      )}
      <ShowdownModal
        state={state}
        onNextHand={startNewHand}
        sessionOutcome={sessionOutcome}
        onRestart={restartSession}
      />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {tutorialOpen && (
        <Tutorial
          onComplete={() => {
            markTutorialDone()
            setTutorialOpen(false)
          }}
          onSkip={() => {
            markTutorialDone()
            setTutorialOpen(false)
          }}
        />
      )}
    </main>
  )
}

function GameApp() {
  const { phase } = useGame()

  if (phase === 'start') return <StartScreen />
  if (phase === 'tutorial') return <TutorialPhase />
  return <PlayingScreen />
}

export default function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  )
}
