import { cardId } from './engine/deck'
import {
  getLegalActions,
  getRaiseBounds,
  isHeroTurn,
} from './engine/game'
import type { PlayerAction } from './engine/types'
import { GameProvider, useGame } from './store/gameStore'
import type { Settings } from './store/settings'

function potTotal(state: ReturnType<typeof useGame>['state']): number {
  return state.pots.reduce((sum, p) => sum + p.amount, 0)
}

function formatCards(
  cards: { rank: number; suit: string }[] | null | undefined,
): string {
  if (!cards || cards.length === 0) return '—'
  return cards.map((c) => cardId(c as Parameters<typeof cardId>[0])).join(' ')
}

function actionLabel(a: PlayerAction): string {
  if (a.type === 'raise' && a.amount !== undefined) {
    return `raise → ${a.amount}`
  }
  return a.type
}

function DebugTable() {
  const {
    state,
    settings,
    phase,
    dispatchPlayerAction,
    startNewHand,
    startGame,
    updateSettings,
    markTutorialDone,
  } = useGame()

  const hero = state.seats.find((s) => s.isHero)
  const heroTurn = isHeroTurn(state)
  const legal = heroTurn ? getLegalActions(state) : []
  const bounds = heroTurn ? getRaiseBounds(state) : null
  const acting =
    state.actionSeatIndex !== null
      ? state.seats[state.actionSeatIndex]
      : null

  return (
    <main className="app-shell" style={{ gap: '1rem', maxWidth: 720 }}>
      <h1 className="app-title">霓虹德州</h1>
      <p className="app-subtitle">CYBER HOLD&apos;EM · DEBUG</p>

      <section
        style={{
          width: '100%',
          textAlign: 'left',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 14,
          lineHeight: 1.6,
          color: 'var(--text, #eee)',
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid var(--cyan, #0ff)',
          borderRadius: 8,
          padding: '1rem 1.25rem',
        }}
      >
        <div>
          <strong>phase</strong>: {phase}
        </div>
        <div>
          <strong>street</strong>: {state.street} · <strong>hand</strong> #
          {state.handNumber}
        </div>
        <div>
          <strong>pot</strong>: {potTotal(state)} · <strong>currentBet</strong>:{' '}
          {state.currentBet} · <strong>minRaise</strong>: {state.minRaise}
        </div>
        <div>
          <strong>board</strong>: {formatCards(state.communityCards)}
        </div>
        <div>
          <strong>hero hole</strong>: {formatCards(hero?.holeCards)} · stack{' '}
          {hero?.stack ?? 0}
        </div>
        <div>
          <strong>acting</strong>:{' '}
          {acting
            ? `${acting.name}${acting.isAI ? ' (AI)' : ' (you)'}`
            : '—'}
        </div>
        {state.winners && state.winners.length > 0 && (
          <div>
            <strong>winners</strong>:{' '}
            {state.winners
              .map((w) => {
                const seat = state.seats.find((s) => s.id === w.seatId)
                return `${seat?.name ?? w.seatId}+${w.amount}${
                  w.handName ? ` (${w.handName})` : ''
                }`
              })
              .join(', ')}
          </div>
        )}
        <div style={{ marginTop: 8, opacity: 0.85 }}>
          <strong>log</strong>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            {state.lastActionLog.slice(-8).map((line, i) => (
              <li key={`${i}-${line}`}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      {phase === 'start' && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => startGame(false)}>
            开始游戏
          </button>
          <button type="button" onClick={() => startGame(true)}>
            跳过教程开始
          </button>
        </div>
      )}

      {phase === 'tutorial' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, color: 'var(--cyan, #0ff)' }}>
            教程占位：无限注德州，你 vs 5 AI。点下方完成教程并开局。
          </p>
          <button
            type="button"
            onClick={() => {
              markTutorialDone()
              startGame(true)
            }}
          >
            完成教程并开始
          </button>
        </div>
      )}

      {(phase === 'playing' || phase === 'showdown') && (
        <>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              justifyContent: 'center',
            }}
          >
            {heroTurn &&
              legal.map((a) => (
                <button
                  key={actionLabel(a)}
                  type="button"
                  onClick={() => dispatchPlayerAction(a)}
                >
                  {actionLabel(a)}
                </button>
              ))}
            {heroTurn && bounds && (
              <span style={{ alignSelf: 'center', opacity: 0.8 }}>
                raise bounds {bounds.min}–{bounds.max}
              </span>
            )}
            {!heroTurn && phase === 'playing' && (
              <span style={{ opacity: 0.75 }}>等待 AI / 结算…</span>
            )}
          </div>

          {(phase === 'showdown' ||
            state.street === 'handOver' ||
            state.street === 'showdown') && (
            <button type="button" onClick={startNewHand}>
              再来一手
            </button>
          )}
        </>
      )}

      <fieldset
        style={{
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8,
          padding: '0.75rem 1rem',
          width: '100%',
          textAlign: 'left',
          color: 'var(--text, #eee)',
        }}
      >
        <legend>settings</legend>
        <label style={{ display: 'block', marginBottom: 6 }}>
          difficulty{' '}
          <select
            value={settings.difficulty}
            onChange={(e) =>
              updateSettings({
                difficulty: e.target.value as Settings['difficulty'],
              })
            }
          >
            <option value="tight">tight</option>
            <option value="standard">standard</option>
            <option value="loose">loose</option>
          </select>
        </label>
        <label style={{ display: 'block', marginBottom: 6 }}>
          animationSpeed{' '}
          <select
            value={settings.animationSpeed}
            onChange={(e) =>
              updateSettings({
                animationSpeed: e.target
                  .value as Settings['animationSpeed'],
              })
            }
          >
            <option value="slow">slow</option>
            <option value="normal">normal</option>
            <option value="fast">fast</option>
          </select>
        </label>
        <label style={{ display: 'block' }}>
          <input
            type="checkbox"
            checked={settings.hintsEnabled}
            onChange={(e) =>
              updateSettings({ hintsEnabled: e.target.checked })
            }
          />{' '}
          hintsEnabled
        </label>
      </fieldset>
    </main>
  )
}

export default function App() {
  return (
    <GameProvider>
      <DebugTable />
    </GameProvider>
  )
}
