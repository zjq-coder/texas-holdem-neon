import { useMemo, useState } from 'react'
import { isHeroTurn } from './engine/game'
import { suggestHint } from './engine/hints'
import type { Card } from './engine/types'
import { BottomDock } from './ui/BottomDock'
import { HandRankGuide } from './ui/HandRankGuide'
import { HotkeysPanel } from './ui/HotkeysPanel'
import { SettingsPanel } from './ui/SettingsPanel'
import { ShowdownModal } from './ui/ShowdownModal'
import { SidePanel } from './ui/SidePanel'
import { StartScreen } from './ui/StartScreen'
import { Table } from './ui/Table'
import { Tutorial } from './ui/Tutorial'
import { GameProvider, useGame } from './store/gameStore'

function cardKey(c: Card): string {
  return `${c.rank}${c.suit}`
}

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
      <div className="top-bar-brand">皇家德州</div>
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

  const bestFiveKeys = useMemo(() => {
    if (!showdown || !state.winners?.length) return null
    const keys = new Set<string>()
    for (const w of state.winners) {
      for (const c of w.bestFive ?? []) keys.add(cardKey(c))
    }
    return keys.size > 0 ? keys : null
  }, [showdown, state.winners])

  return (
    <main className="play-shell play-shell--table">
      <TopBar
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenTutorial={() => setTutorialOpen(true)}
      />
      <div className="play-main">
        <SidePanel state={state} hint={hint} />
        <div className="play-center">
          <Table state={state} revealAll={showdown} />
        </div>
        <HotkeysPanel
          state={state}
          onAction={dispatchPlayerAction}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenTutorial={() => setTutorialOpen(true)}
          enabled={!showdown}
        />
      </div>
      {/* 绝对定位于顶栏下方右侧，向下弹出，不参与底栏布局、不挡手牌 */}
      <HandRankGuide />
      <BottomDock
        state={state}
        onAction={dispatchPlayerAction}
        bestFiveKeys={bestFiveKeys}
        hideActions={showdown}
      />
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
