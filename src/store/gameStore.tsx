import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { playChip, playDeal, playWin } from '../audio/sfx'
import { decideAction } from '../engine/ai'
import {
  applyAction,
  createInitialTable,
  getLegalActions,
  isHeroTurn,
  startHand,
} from '../engine/game'
import type { GameState, PlayerAction } from '../engine/types'
import {
  loadSettings,
  saveSettings,
  type Settings,
} from './settings'

/** Map engine action-log lines to short SFX cues. */
function playSfxForLogEntry(entry: string): void {
  if (
    entry.includes('手开始') ||
    entry.includes('翻牌') ||
    entry.includes('转牌') ||
    entry.includes('河牌') ||
    entry.includes('发完公共牌')
  ) {
    playDeal()
    return
  }
  if (
    entry.includes('跟注') ||
    entry.includes('加注') ||
    entry.includes('全下') ||
    entry.includes('小盲') ||
    entry.includes('大盲')
  ) {
    playChip()
    return
  }
  if (entry.includes('赢得') || entry.includes('摊牌结束')) {
    playWin()
  }
}

export type GamePhase = 'start' | 'tutorial' | 'playing' | 'showdown'

const AI_BASE_DELAY_MS = 650

const SPEED_MUL: Record<Settings['animationSpeed'], number> = {
  slow: 1.6,
  normal: 1,
  fast: 0.35,
}

export interface GameContextValue {
  state: GameState
  settings: Settings
  phase: GamePhase
  dispatchPlayerAction: (action: PlayerAction) => void
  startNewHand: () => void
  startGame: (fromTutorial?: boolean) => void
  openTutorial: () => void
  updateSettings: (partial: Partial<Settings>) => void
  markTutorialDone: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [state, setState] = useState<GameState>(() =>
    createInitialTable(loadSettings().playerName),
  )
  const [phase, setPhase] = useState<GamePhase>('start')
  /** Index into lastActionLog already consumed for SFX. */
  const sfxLogCursor = useRef(0)

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      saveSettings(next)
      return next
    })
  }, [])

  const markTutorialDone = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, tutorialDone: true }
      saveSettings(next)
      return next
    })
  }, [])

  const startGame = useCallback(
    (fromTutorial = false) => {
      if (!fromTutorial && !settings.tutorialDone) {
        setPhase('tutorial')
        return
      }
      setState(startHand(createInitialTable(settings.playerName)))
      setPhase('playing')
    },
    [settings.tutorialDone, settings.playerName],
  )

  const openTutorial = useCallback(() => {
    setPhase('tutorial')
  }, [])

  const startNewHand = useCallback(() => {
    setState((s) => startHand(s))
    setPhase('playing')
  }, [])

  const dispatchPlayerAction = useCallback((action: PlayerAction) => {
    setState((s) => {
      if (!isHeroTurn(s)) return s
      return applyAction(s, action)
    })
  }, [])

  // Enter showdown UI phase when the hand settles.
  useEffect(() => {
    if (
      phase === 'playing' &&
      (state.street === 'showdown' || state.street === 'handOver')
    ) {
      setPhase('showdown')
    }
  }, [phase, state.street])

  // SFX: react to new engine action-log lines (player + AI + street deals).
  useEffect(() => {
    const log = state.lastActionLog
    // startHand replaces the log array — reset cursor when it shrinks.
    if (log.length < sfxLogCursor.current) {
      sfxLogCursor.current = 0
    }
    if (log.length === sfxLogCursor.current) return
    const fresh = log.slice(sfxLogCursor.current)
    sfxLogCursor.current = log.length
    // Skip SFX on start screen before any play session.
    if (phase === 'start' || phase === 'tutorial') return
    for (const entry of fresh) {
      playSfxForLogEntry(entry)
    }
  }, [state.lastActionLog, phase])

  // AI auto-act loop: think delay then decideAction + applyAction.
  useEffect(() => {
    if (phase !== 'playing') return
    if (state.street === 'handOver' || state.street === 'showdown') return

    const idx = state.actionSeatIndex
    if (idx === null) return
    const seat = state.seats[idx]
    if (!seat || !seat.isAI) return

    const delay = AI_BASE_DELAY_MS * SPEED_MUL[settings.animationSpeed]
    const difficulty = settings.difficulty

    const timer = window.setTimeout(() => {
      setState((s) => {
        if (s.street === 'handOver' || s.street === 'showdown') return s
        if (s.actionSeatIndex === null) return s
        const actor = s.seats[s.actionSeatIndex]
        if (!actor?.isAI) return s
        if (getLegalActions(s).length === 0) return s
        const action = decideAction(s, difficulty)
        return applyAction(s, action)
      })
    }, delay)

    return () => window.clearTimeout(timer)
  }, [
    phase,
    state.actionSeatIndex,
    state.street,
    state.handNumber,
    // Re-fire after each applied action (log grows every act).
    state.lastActionLog.length,
    settings.animationSpeed,
    settings.difficulty,
  ])

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      settings,
      phase,
      dispatchPlayerAction,
      startNewHand,
      startGame,
      openTutorial,
      updateSettings,
      markTutorialDone,
    }),
    [
      state,
      settings,
      phase,
      dispatchPlayerAction,
      startNewHand,
      startGame,
      openTutorial,
      updateSettings,
      markTutorialDone,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) {
    throw new Error('useGame must be used within GameProvider')
  }
  return ctx
}
