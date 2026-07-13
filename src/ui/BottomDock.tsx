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

/**
 * 底部手牌托盘：底牌居中大号扇形突出，操作栏在下方。
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

  // 更开的扇形，居中更醒目
  const fanAngles = showFace || showBack ? [-16, 16] : [-8, 8]
  const fanOffsets = showFace || showBack ? [-28, 28] : [-12, 12]

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

        {/* 居中高亮底牌区 */}
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
                    size="lg"
                    highlight={highlight}
                    enter={card ? 'deal' : 'none'}
                    delayMs={i * 55}
                    className={styles.heroCard}
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
  )
}
