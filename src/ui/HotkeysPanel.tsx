import { useEffect, useMemo } from 'react'
import {
  getLegalActions,
  getRaiseBounds,
  isHeroTurn,
} from '../engine/game'
import type { GameState, PlayerAction } from '../engine/types'
import styles from '../styles/hotkeysPanel.module.css'

export interface HotkeysPanelProps {
  state: GameState
  onAction: (action: PlayerAction) => void
  onOpenSettings?: () => void
  onOpenTutorial?: () => void
  enabled?: boolean
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

function potTotal(state: GameState): number {
  return state.pots.reduce((s, p) => s + p.amount, 0)
}

const ROWS: { key: string; label: string; hint: string }[] = [
  { key: 'F', label: '弃牌', hint: 'Fold' },
  { key: 'C / ␣', label: '过牌/跟注', hint: 'Check · Call' },
  { key: 'R', label: '最小加注', hint: 'Raise min' },
  { key: 'A', label: '全下', hint: 'All-in' },
  { key: '1', label: '1/2 池加注', hint: 'Half pot' },
  { key: '2', label: '满池加注', hint: 'Pot' },
  { key: 'H', label: '牌型速查', hint: 'Guide' },
  { key: 'S', label: '设置', hint: 'Settings' },
  { key: 'T', label: '教程', hint: 'Tutorial' },
]

export function HotkeysPanel({
  state,
  onAction,
  onOpenSettings,
  onOpenTutorial,
  enabled = true,
}: HotkeysPanelProps) {
  const heroTurn = enabled && isHeroTurn(state)
  const legal = useMemo(
    () => (heroTurn ? getLegalActions(state) : []),
    [heroTurn, state],
  )
  const bounds = heroTurn ? getRaiseBounds(state) : null
  const hero = state.seats.find((s) => s.isHero)
  const pot = potTotal(state)
  const toCall =
    hero && heroTurn
      ? Math.max(0, state.currentBet - hero.betThisStreet)
      : 0

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const k = e.key.toLowerCase()

      if (k === 's') {
        e.preventDefault()
        onOpenSettings?.()
        return
      }
      if (k === 't') {
        e.preventDefault()
        onOpenTutorial?.()
        return
      }
      if (k === 'h') {
        e.preventDefault()
        document
          .querySelector<HTMLButtonElement>('[data-hand-rank-toggle]')
          ?.click()
        return
      }

      if (!heroTurn) return

      const can = (type: PlayerAction['type']) =>
        legal.some((a) => a.type === type)

      if (k === 'f' && can('fold')) {
        e.preventDefault()
        onAction({ type: 'fold' })
        return
      }
      if ((k === 'c' || k === ' ') && (can('check') || can('call'))) {
        e.preventDefault()
        onAction({ type: can('check') ? 'check' : 'call' })
        return
      }
      if (k === 'a' && can('allIn')) {
        e.preventDefault()
        onAction({ type: 'allIn' })
        return
      }
      if ((k === 'r' || k === '1' || k === '2') && bounds && hero) {
        e.preventDefault()
        if (k === 'r' && can('raise')) {
          onAction({ type: 'raise', amount: bounds.min })
          return
        }
        if (k === '1' && can('raise')) {
          const half = clamp(
            state.currentBet + Math.floor((pot + toCall) / 2),
            bounds.min,
            bounds.max,
          )
          onAction({ type: 'raise', amount: half })
          return
        }
        if (k === '2' && can('raise')) {
          const full = clamp(
            state.currentBet + pot + toCall,
            bounds.min,
            bounds.max,
          )
          onAction({ type: 'raise', amount: full })
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    heroTurn,
    legal,
    bounds,
    hero,
    pot,
    toCall,
    state.currentBet,
    onAction,
    onOpenSettings,
    onOpenTutorial,
  ])

  return (
    <aside className={styles.panel} aria-label="快捷键">
      <div className={styles.title}>快捷键</div>
      <ul className={styles.list}>
        {ROWS.map((row) => (
          <li key={row.key} className={styles.row}>
            <kbd className={styles.kbd}>{row.key}</kbd>
            <div className={styles.meta}>
              <span className={styles.label}>{row.label}</span>
              <span className={styles.hint}>{row.hint}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className={styles.note}>
        {heroTurn ? '轮到你 · 快捷键可用' : '等待对手 · 快捷键待命'}
      </p>
    </aside>
  )
}
