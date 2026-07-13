import { useEffect, useMemo, useState } from 'react'
import {
  getLegalActions,
  getRaiseBounds,
  isHeroTurn,
} from '../engine/game'
import type { GameState, PlayerAction } from '../engine/types'
import styles from '../styles/actionBar.module.css'

export interface ActionBarProps {
  state: GameState
  onAction: (action: PlayerAction) => void
  enabled?: boolean
  /** 紧凑模式：用于底部托盘横排布局 */
  compact?: boolean
}

function potTotal(state: GameState): number {
  return state.pots.reduce((sum, p) => sum + p.amount, 0)
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function ActionBar({
  state,
  onAction,
  enabled = true,
  compact = false,
}: ActionBarProps) {
  const heroTurn = enabled && isHeroTurn(state)
  const legal = heroTurn ? getLegalActions(state) : []
  const bounds = heroTurn ? getRaiseBounds(state) : null
  const hero =
    state.actionSeatIndex !== null
      ? state.seats[state.actionSeatIndex]
      : state.seats.find((s) => s.isHero)

  const canFold = legal.some((a) => a.type === 'fold')
  const canCheck = legal.some((a) => a.type === 'check')
  const canCall = legal.some((a) => a.type === 'call')
  const canRaise = legal.some((a) => a.type === 'raise')
  const canAllIn = legal.some((a) => a.type === 'allIn')

  const toCall =
    hero && heroTurn
      ? Math.max(0, state.currentBet - hero.betThisStreet)
      : 0

  const [raiseTo, setRaiseTo] = useState(0)

  useEffect(() => {
    if (bounds) {
      setRaiseTo(bounds.min)
    }
  }, [bounds?.min, bounds?.max, state.actionSeatIndex, state.handNumber, state.street])

  const pot = potTotal(state)

  const presets = useMemo(() => {
    if (!bounds || !hero) return []
    const half = clamp(
      state.currentBet + Math.floor((pot + toCall) / 2),
      bounds.min,
      bounds.max,
    )
    const full = clamp(state.currentBet + pot + toCall, bounds.min, bounds.max)
    const allInTarget = bounds.max
    return [
      { label: '1/2 池', value: half },
      { label: '满池', value: full },
      { label: '全下', value: allInTarget },
    ]
  }, [bounds, hero, pot, state.currentBet, toCall])

  const rootClass = [
    styles.bar,
    compact ? styles.compact : '',
    !heroTurn ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ')

  if (!heroTurn) {
    return (
      <div className={rootClass} data-action-bar>
        <div className={styles.waiting}>等待对手行动…</div>
      </div>
    )
  }

  return (
    <div className={rootClass} data-action-bar>
      <div className={styles.status}>
        <span className={styles.statusStrong}>轮到你</span>
        {!compact && (
          <span>
            跟注{' '}
            <strong
              style={{
                color: 'var(--text)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {toCall.toLocaleString('zh-CN')}
            </strong>
            {' · '}
            底池{' '}
            <strong
              style={{
                color: 'var(--gold)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {pot.toLocaleString('zh-CN')}
            </strong>
          </span>
        )}
        {compact && (
          <span className={styles.compactMeta}>
            跟 {toCall.toLocaleString('zh-CN')} · 池{' '}
            {pot.toLocaleString('zh-CN')}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.btn} ${styles.fold}`}
          disabled={!canFold}
          onClick={() => onAction({ type: 'fold' })}
        >
          弃牌
        </button>

        {canCheck ? (
          <button
            type="button"
            className={`${styles.btn} ${styles.call}`}
            onClick={() => onAction({ type: 'check' })}
          >
            过牌
          </button>
        ) : (
          <button
            type="button"
            className={`${styles.btn} ${styles.call}`}
            disabled={!canCall}
            onClick={() => onAction({ type: 'call' })}
          >
            跟注 {toCall > 0 ? toCall.toLocaleString('zh-CN') : ''}
          </button>
        )}

        {canRaise && bounds && (
          <button
            type="button"
            className={`${styles.btn} ${styles.raise}`}
            onClick={() =>
              onAction({
                type: 'raise',
                amount: clamp(raiseTo, bounds.min, bounds.max),
              })
            }
          >
            加注至 {clamp(raiseTo, bounds.min, bounds.max).toLocaleString('zh-CN')}
          </button>
        )}

        {canAllIn && (
          <button
            type="button"
            className={`${styles.btn} ${styles.allIn}`}
            onClick={() => onAction({ type: 'allIn' })}
          >
            全下
          </button>
        )}
      </div>

      {canRaise && bounds && (
        <div className={styles.raisePanel}>
          <div className={styles.raiseMeta}>
            <span>
              加注范围 {bounds.min.toLocaleString('zh-CN')} –{' '}
              {bounds.max.toLocaleString('zh-CN')}
            </span>
            <span className={styles.raiseAmount}>
              → {clamp(raiseTo, bounds.min, bounds.max).toLocaleString('zh-CN')}
            </span>
          </div>
          <input
            className={styles.slider}
            type="range"
            min={bounds.min}
            max={bounds.max}
            step={1}
            value={clamp(raiseTo, bounds.min, bounds.max)}
            onChange={(e) => setRaiseTo(Number(e.target.value))}
            aria-label="加注滑条"
          />
          <div className={styles.presets}>
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                className={styles.preset}
                onClick={() => {
                  if (p.label === '全下') {
                    onAction({ type: 'allIn' })
                    return
                  }
                  setRaiseTo(p.value)
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
