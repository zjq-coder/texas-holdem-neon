import type { CSSProperties } from 'react'
import type { Card, GameState, PlayerAction } from '../engine/types'
import styles from '../styles/bottomDock.module.css'
import { CardView } from './Card'
import { ActionBar } from './ActionBar'

export interface BottomDockProps {
  state: GameState
  onAction: (action: PlayerAction) => void
  /** Highlight keys from best five at showdown */
  bestFiveKeys?: Set<string> | null
  hideActions?: boolean
}

function cardKey(c: Card): string {
  return `${c.rank}${c.suit}`
}

/**
 * 底部手牌托盘：英雄手牌扇形展开 + 操作栏（对齐参考图底栏）。
 * 德州仅 2 张底牌，用大号扇形叠放呈现；若需更「牌墙」感，可并排展示公共牌缩略。
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

  // 扇形角度：两张牌左右张开；若未来扩展多张可按 index 线性插值
  const fanAngles = showFace || showBack ? [-14, 14] : [0, 0]
  const fanOffsets = showFace || showBack ? [-18, 18] : [0, 0]

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
          <span>
            手牌 {hole?.length ?? 0} 张
            {hero?.folded ? ' · 已弃牌' : ''}
            {hero?.allIn ? ' · 全下' : ''}
          </span>
          <span className={styles.captionTip}>
            点选操作 · 加注可用滑条与快捷额
          </span>
        </div>

        <div className={styles.fanArea} aria-label="我的手牌">
          <div className={styles.fan}>
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
                <div key={`fan-${i}`} className={styles.fanCard} style={style}>
                  <CardView
                    card={card}
                    faceDown={faceDown}
                    size="lg"
                    highlight={highlight}
                    enter={card ? 'deal' : 'none'}
                    delayMs={i * 70}
                  />
                </div>
              )
            })}
          </div>

          {/* 公共牌缩略行 — 增强「牌桌底栏」信息密度，贴近参考图底栏信息感 */}
          {state.communityCards.length > 0 && (
            <div className={styles.boardStrip} aria-label="公共牌">
              <span className={styles.boardLabel}>公共</span>
              {state.communityCards.map((c, i) => {
                const inBest =
                  bestFiveKeys !== null && bestFiveKeys.has(cardKey(c))
                return (
                  <CardView
                    key={`dock-board-${i}-${c.rank}${c.suit}`}
                    card={c}
                    size="sm"
                    highlight={bestFiveKeys !== null ? inBest : false}
                    enter="flip"
                    delayMs={i * 40}
                  />
                )
              })}
            </div>
          )}
        </div>

        {!hideActions && (
          <div className={styles.actionsWrap}>
            <ActionBar state={state} onAction={onAction} />
          </div>
        )}
      </div>
    </div>
  )
}
