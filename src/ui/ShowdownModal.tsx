import type { GameState } from '../engine/types'

export interface ShowdownModalProps {
  state: GameState
  onNextHand: () => void
}

export function ShowdownModal({ state, onNextHand }: ShowdownModalProps) {
  if (state.street !== 'handOver' || !state.winners) return null

  return (
    <div className="showdown-modal-overlay" role="dialog" aria-modal="true" aria-label="摊牌结果">
      <div className="showdown-modal">
        <h2 className="showdown-modal-title">本手结果</h2>
        {state.winners.length > 0 ? (
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
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="showdown-modal-empty">结算完成</p>
        )}
        <button type="button" className="primary-cta showdown-modal-next" onClick={onNextHand}>
          再来一手
        </button>
      </div>
    </div>
  )
}
