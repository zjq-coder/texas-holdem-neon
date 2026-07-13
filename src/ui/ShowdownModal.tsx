import type { SessionOutcome } from '../engine/game'
import type { Card, GameState } from '../engine/types'
import { CardView } from './Card'

export interface ShowdownModalProps {
  state: GameState
  onNextHand: () => void
  sessionOutcome?: SessionOutcome
  onRestart?: () => void
}

function cardKey(c: Card): string {
  return `${c.rank}${c.suit}`
}

export function ShowdownModal({
  state,
  onNextHand,
  sessionOutcome = null,
  onRestart,
}: ShowdownModalProps) {
  const isSessionEnd =
    sessionOutcome === 'victory' || sessionOutcome === 'loss'
  // Show at hand end with winners, or session-end UI even if winners missing
  if (state.street !== 'handOver') return null
  if (!state.winners && !isSessionEnd) return null
  const title =
    sessionOutcome === 'victory'
      ? '胜利'
      : sessionOutcome === 'loss'
        ? '你已淘汰'
        : '本手结果'
  const subtitle =
    sessionOutcome === 'victory'
      ? '全场只剩你一人有筹码'
      : sessionOutcome === 'loss'
        ? '筹码已耗尽，本局结束'
        : null

  return (
    <div
      className="showdown-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`showdown-modal${isSessionEnd ? ` showdown-modal--${sessionOutcome}` : ''}`}
      >
        <h2 className="showdown-modal-title">{title}</h2>
        {subtitle ? (
          <p className="showdown-modal-subtitle">{subtitle}</p>
        ) : null}
        {state.winners && state.winners.length > 0 ? (
          <ul className="showdown-modal-list">
            {state.winners.map((w) => {
              const seat = state.seats.find((s) => s.id === w.seatId)
              return (
                <li key={`${w.seatId}-${w.amount}`} className="showdown-modal-line">
                  <span className="showdown-modal-name">
                    {seat?.name ?? w.seatId}
                    {seat?.isHero ? '（你）' : ''}
                  </span>
                  {w.handName ? (
                    <span className="showdown-modal-hand">{w.handName}</span>
                  ) : null}
                  <span className="showdown-modal-amount">
                    +{w.amount.toLocaleString('zh-CN')}
                  </span>
                  {w.bestFive && w.bestFive.length > 0 ? (
                    <div
                      className="showdown-modal-best-five"
                      aria-label="最佳五张"
                    >
                      {w.bestFive.map((c) => (
                        <CardView
                          key={`${w.seatId}-${cardKey(c)}`}
                          card={c}
                          size="sm"
                          highlight
                        />
                      ))}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="showdown-modal-empty">结算完成</p>
        )}
        {isSessionEnd && onRestart ? (
          <button
            type="button"
            className="primary-cta showdown-modal-next"
            onClick={onRestart}
          >
            重新开始
          </button>
        ) : (
          <button
            type="button"
            className="primary-cta showdown-modal-next"
            onClick={onNextHand}
          >
            再来一手
          </button>
        )}
      </div>
    </div>
  )
}
