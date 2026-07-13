import type { CSSProperties } from 'react'
import type { Card, GameState, PlayerAction } from '../engine/types'
import styles from '../styles/bottomDock.module.css'
import { CardView } from './Card'
import { ActionBar } from './ActionBar'

export interface BottomDockProps {
  state: GameState
  onAction: (action: PlayerAction) => void
  bestFiveKeys?: Set<string> | null
  hideActions?: boolean
}

function cardKey(c: Card): string {
  return `${c.rank}${c.suit}`
}

/** 紧凑底栏：左扇形手牌 + 右操作，整行适配视口无需滚动 */
export function BottomDock({
  state,
  onAction,
  bestFiveKeys = null,
  hideActions = false,
}: BottomDockProps) {
  const hero = state.seats.find((s) => s.isHero)
  const hole = hero?.holeCards
  const hasCards = hole !== null && hole !== undefined && hole.length > 0
  const showFace = hasCards && !hero?.sittingOut
  const showBack =
    hasCards && !showFace && !hero?.folded && !hero?.sittingOut

  const fanAngles = showFace || showBack ? [-12, 12] : [0, 0]
  const fanOffsets = showFace || showBack ? [-14, 14] : [0, 0]

  const cards: Array<{ card: Card | null; faceDown: boolean; i: number }> =
    showFace && hole
      ? hole.map((c, i) => ({ card: c, faceDown: false, i }))
      : showBack && hole
        ? [0, 1].map((i) => ({
            card: hole[i] ?? hole[0]!,
            faceDown: true,
            i,
          }))
        : [
            { card: null, faceDown: false, i: 0 },
            { card: null, faceDown: false, i: 1 },
          ]

  return (
    <div className={styles.dock} data-bottom-dock>
      <div className={styles.frame}>
        <div className={styles.row}>
          <div className={styles.handCol}>
            <div className={styles.caption}>
              手牌 {hole?.length ?? 0}
              {hero?.folded ? ' · 弃' : ''}
              {hero?.allIn ? ' · 全下' : ''}
            </div>
            <div className={styles.fan} aria-label="我的手牌">
              {cards.map(({ card, faceDown, i }) => {
                const inBest =
                  card !== null &&
                  bestFiveKeys !== null &&
                  bestFiveKeys.has(cardKey(card))
                const highlight =
                  bestFiveKeys !== null ? inBest : card !== null && !faceDown
                const style: CSSProperties = {
                  transform: `translateX(${fanOffsets[i] ?? 0}px) rotate(${fanAngles[i] ?? 0}deg)`,
                  zIndex: i + 1,
                }
                return (
                  <div
                    key={`fan-${i}`}
                    className={styles.fanCard}
                    style={style}
                  >
                    <CardView
                      card={card}
                      faceDown={faceDown}
                      size="md"
                      highlight={highlight}
                      enter={card ? 'deal' : 'none'}
                      delayMs={i * 50}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {!hideActions && (
            <div className={styles.actionsWrap}>
              <ActionBar state={state} onAction={onAction} compact />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
