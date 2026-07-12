import type { GameState } from '../engine/types'
import styles from '../styles/table.module.css'
import { CardView } from './Card'
import { SeatView } from './Seat'

export interface TableProps {
  state: GameState
  /** Reveal all contenders' hole cards (showdown / handOver). */
  revealAll?: boolean
  onNextHand?: () => void
  showShowdownOverlay?: boolean
}

const STREET_LABEL: Record<GameState['street'], string> = {
  preflop: '翻前',
  flop: '翻牌',
  turn: '转牌',
  river: '河牌',
  showdown: '摊牌',
  handOver: '本手结束',
}

const SEAT_POS = [
  styles.seat0,
  styles.seat1,
  styles.seat2,
  styles.seat3,
  styles.seat4,
  styles.seat5,
] as const

function potTotal(state: GameState): number {
  return state.pots.reduce((sum, p) => sum + p.amount, 0)
}

export function Table({
  state,
  revealAll = false,
  onNextHand,
  showShowdownOverlay = false,
}: TableProps) {
  const pot = potTotal(state)
  const isShowdownStreet =
    state.street === 'showdown' || state.street === 'handOver'

  return (
    <div className={styles.stage} data-table>
      <div className={styles.felt}>
        <div className={styles.feltInner} />

        <div className={styles.center}>
          <div className={styles.streetTag}>
            {STREET_LABEL[state.street]} · 第 {state.handNumber} 手
          </div>
          <div className={styles.board} aria-label="公共牌">
            {Array.from({ length: 5 }).map((_, i) => {
              const card = state.communityCards[i] ?? null
              const cardKey = card
                ? `board-${i}-${card.rank}${card.suit}`
                : `board-${i}-empty`
              return (
                <CardView
                  key={cardKey}
                  card={card}
                  size="md"
                  highlight={card !== null}
                  enter={card ? 'flip' : 'none'}
                  delayMs={card ? i * 70 : 0}
                />
              )
            })}
          </div>
          <div className={styles.pot}>
            <span className={styles.potLabel}>底池</span>
            <span className={styles.potValue}>{pot.toLocaleString('zh-CN')}</span>
          </div>
        </div>

        {state.seats.map((seat, index) => {
          const posClass = SEAT_POS[index] ?? styles.seat0
          const showCards =
            seat.isHero ||
            revealAll ||
            (isShowdownStreet && !seat.folded && !seat.sittingOut)
          const isActing =
            state.actionSeatIndex === index &&
            !isShowdownStreet &&
            !seat.sittingOut

          return (
            <div
              key={seat.id}
              className={`${styles.seatSlot} ${posClass}`}
            >
              <SeatView
                seat={seat}
                isActing={isActing}
                showCards={showCards}
                isDealer={state.dealerIndex === index}
                isSB={state.sbIndex === index}
                isBB={state.bbIndex === index}
              />
            </div>
          )
        })}

        {showShowdownOverlay && isShowdownStreet && (
          <div className={styles.showdownOverlay}>
            <div className={styles.showdownPanel}>
              <h2 className={styles.showdownTitle}>本手结果</h2>
              {state.winners && state.winners.length > 0 ? (
                state.winners.map((w) => {
                  const seat = state.seats.find((s) => s.id === w.seatId)
                  return (
                    <p key={`${w.seatId}-${w.amount}`} className={styles.showdownLine}>
                      {seat?.name ?? w.seatId}
                      {w.handName ? ` · ${w.handName}` : ''}
                      {' '}
                      <span className={styles.showdownAmount}>
                        +{w.amount.toLocaleString('zh-CN')}
                      </span>
                    </p>
                  )
                })
              ) : (
                <p className={styles.showdownLine}>结算完成</p>
              )}
              {onNextHand && (
                <button
                  type="button"
                  className={styles.nextHandBtn}
                  onClick={onNextHand}
                >
                  再来一手
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
