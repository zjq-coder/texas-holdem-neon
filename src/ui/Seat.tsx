import type { Card, Seat } from '../engine/types'
import styles from '../styles/table.module.css'
import { CardView } from './Card'
import { ChipStack } from './ChipStack'

export interface SeatViewProps {
  seat: Seat
  isActing: boolean
  showCards: boolean
  isDealer?: boolean
  isSB?: boolean
  isBB?: boolean
  /** When set (showdown), highlight hole cards that appear in winners' best five. */
  bestFiveKeys?: Set<string> | null
}

function cardKey(c: Card): string {
  return `${c.rank}${c.suit}`
}

export function SeatView({
  seat,
  isActing,
  showCards,
  isDealer = false,
  isSB = false,
  isBB = false,
  bestFiveKeys = null,
}: SeatViewProps) {
  const hole = seat.holeCards
  // 英雄手牌在底部扇形托盘展示，桌上座位只保留铭牌/筹码
  const hideHoleOnTable = seat.isHero
  const showFace =
    !hideHoleOnTable &&
    showCards &&
    hole !== null &&
    hole.length > 0 &&
    !seat.sittingOut
  const showBack =
    !hideHoleOnTable &&
    !showFace &&
    hole !== null &&
    hole.length > 0 &&
    !seat.folded &&
    !seat.sittingOut

  const rootClass = [
    styles.seat,
    seat.isHero ? styles.seatHero : '',
    isActing ? styles.seatActing : '',
    seat.folded ? styles.seatFolded : '',
    seat.sittingOut ? styles.seatSittingOut : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={rootClass}
      data-seat-id={seat.id}
      data-acting={isActing ? 'true' : 'false'}
    >
      <div className={styles.seatHeader}>
        <span className={styles.seatName}>{seat.name}</span>
        {isDealer && <span className={styles.badge}>D</span>}
        {isSB && !isDealer && <span className={styles.badge}>SB</span>}
        {isBB && !isDealer && <span className={styles.badge}>BB</span>}
        {seat.allIn && !seat.sittingOut && (
          <span className={`${styles.badge} ${styles.badgeAllIn}`}>全下</span>
        )}
        {seat.folded && !seat.sittingOut && (
          <span className={styles.badge}>弃牌</span>
        )}
      </div>

      <div className={styles.stack}>
        {seat.sittingOut ? '旁观' : seat.stack.toLocaleString('zh-CN')}
      </div>

      {!hideHoleOnTable && (
        <div className={styles.hole}>
          {showFace &&
            hole!.map((c, i) => {
              const inBest =
                bestFiveKeys !== null && bestFiveKeys.has(cardKey(c))
              const highlight =
                bestFiveKeys !== null ? inBest : false
              return (
                <CardView
                  key={`${seat.id}-h-${c.rank}${c.suit}-${i}`}
                  card={c}
                  highlight={highlight}
                  size="sm"
                  enter="deal"
                  delayMs={i * 60}
                />
              )
            })}
          {showBack &&
            [0, 1].map((i) => (
              <CardView
                key={`${seat.id}-b-${i}`}
                card={hole![i] ?? hole![0]!}
                faceDown
                size="sm"
                enter="deal"
                delayMs={i * 60}
              />
            ))}
          {!showFace && !showBack && (
            <>
              <CardView card={null} size="sm" />
              <CardView card={null} size="sm" />
            </>
          )}
        </div>
      )}

      {hideHoleOnTable && (
        <div className={styles.heroSeatNote}>手牌见底部</div>
      )}

      <div className={styles.betRow}>
        <ChipStack amount={seat.betThisStreet} />
      </div>
    </div>
  )
}
