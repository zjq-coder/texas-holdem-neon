import { useState, type CSSProperties } from 'react'
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

/**
 * 底部手牌托盘：超大底牌居中扇形 + 悬停/点击上浮动效。
 */
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

  const [selected, setSelected] = useState<number | null>(null)

  // 扇形更开，配合超大牌面
  const fanAngles = showFace || showBack ? [-18, 18] : [-10, 10]
  const fanOffsets = showFace || showBack ? [-36, 36] : [-16, 16]

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
        <div className={styles.caption}>
          <span className={styles.captionLine} aria-hidden />
          <span className={styles.captionText}>
            我的底牌
            {hero?.folded ? ' · 已弃牌' : ''}
            {hero?.allIn ? ' · 全下' : ''}
          </span>
          <span className={styles.captionLine} aria-hidden />
        </div>

        <div className={styles.handStage}>
          <div className={styles.handGlow} aria-hidden />
          <div className={styles.fan} aria-label="我的底牌">
            {cards.map(({ card, faceDown, i }) => {
              const inBest =
                card !== null &&
                bestFiveKeys !== null &&
                bestFiveKeys.has(cardKey(card))
              const highlight =
                bestFiveKeys !== null ? inBest : card !== null && !faceDown
              const isSelected = selected === i
              const style = {
                ['--fan-x' as string]: `${fanOffsets[i] ?? 0}px`,
                ['--fan-rot' as string]: `${fanAngles[i] ?? 0}deg`,
                zIndex: isSelected ? 12 : i + 1,
              } as CSSProperties

              return (
                <button
                  key={`fan-${i}`}
                  type="button"
                  className={[
                    styles.fanCard,
                    isSelected ? styles.fanCardSelected : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={style}
                  disabled={!card}
                  aria-pressed={isSelected}
                  aria-label={
                    card
                      ? isSelected
                        ? '取消选中底牌'
                        : '选中底牌'
                      : '空位'
                  }
                  onClick={() => {
                    if (!card) return
                    setSelected((prev) => (prev === i ? null : i))
                  }}
                >
                  <CardView
                    card={card}
                    faceDown={faceDown}
                    size="xl"
                    highlight={highlight || isSelected}
                    enter={card ? 'deal' : 'none'}
                    delayMs={i * 55}
                    className={styles.heroCard}
                  />
                </button>
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
  )
}
