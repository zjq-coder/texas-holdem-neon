import { isHeroTurn } from '../engine/game'
import type { GameState } from '../engine/types'
import styles from '../styles/sidePanel.module.css'

const STREET_LABEL: Record<GameState['street'], string> = {
  preflop: '翻前',
  flop: '翻牌',
  turn: '转牌',
  river: '河牌',
  showdown: '摊牌',
  handOver: '本手结束',
}

const START_STACK = 10_000

export interface SidePanelProps {
  state: GameState
  hint?: string | null
}

function potTotal(state: GameState): number {
  return state.pots.reduce((s, p) => s + p.amount, 0)
}

function progressPct(stack: number): number {
  return Math.max(0, Math.min(100, Math.round((stack / START_STACK) * 100)))
}

export function SidePanel({ state, hint }: SidePanelProps) {
  const hero = state.seats.find((s) => s.isHero)
  const opponents = state.seats.filter((s) => !s.isHero)
  const pot = potTotal(state)
  const acting =
    state.actionSeatIndex !== null
      ? state.seats[state.actionSeatIndex]
      : null
  const heroActing = isHeroTurn(state)

  return (
    <aside className={styles.panel} aria-label="对局信息">
      {/* 关卡 / 街信息 */}
      <section className={styles.section}>
        <div className={styles.eyebrow}>当前牌局</div>
        <h2 className={styles.stageTitle}>
          第 {state.handNumber} 手 · {STREET_LABEL[state.street]}
        </h2>
        <p className={styles.stageSub}>
          盲注 {state.smallBlind}/{state.bigBlind}
          {acting && !heroActing
            ? ` · 等待 ${acting.name}`
            : heroActing
              ? ' · 轮到你'
              : ''}
        </p>
      </section>

      {/* 我方 */}
      {hero && (
        <section className={styles.section}>
          <div className={styles.playerCard}>
            <div className={styles.avatar} aria-hidden>
              {hero.name.slice(0, 1)}
            </div>
            <div className={styles.playerMeta}>
              <div className={styles.playerName}>我方 · {hero.name}</div>
              <div className={styles.playerStack}>
                {hero.sittingOut
                  ? '已出局'
                  : hero.stack.toLocaleString('zh-CN')}
                <span className={styles.stackCap}> / {START_STACK.toLocaleString('zh-CN')}</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFillHero}
                  style={{ width: `${progressPct(hero.stack)}%` }}
                />
              </div>
              <div className={styles.barHint}>
                筹码 {progressPct(hero.stack)}%
                {hero.folded ? ' · 已弃牌' : ''}
                {hero.allIn ? ' · 全下' : ''}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 对阵 */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>对阵</div>
        <ul className={styles.oppList}>
          {opponents.map((s) => {
            const isActing = state.actionSeatIndex === state.seats.indexOf(s)
            return (
              <li
                key={s.id}
                className={[
                  styles.oppRow,
                  s.folded || s.sittingOut ? styles.oppDim : '',
                  isActing ? styles.oppActing : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className={styles.oppHead}>
                  <span className={styles.oppName}>{s.name}</span>
                  <span className={styles.oppStack}>
                    {s.sittingOut
                      ? '出局'
                      : s.stack.toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFillOpp}
                    style={{
                      width: s.sittingOut ? '0%' : `${progressPct(s.stack)}%`,
                    }}
                  />
                </div>
                <div className={styles.oppStatus}>
                  {s.sittingOut
                    ? '旁观'
                    : s.folded
                      ? '弃牌'
                      : s.allIn
                        ? '全下'
                        : isActing
                          ? '思考中…'
                          : s.betThisStreet > 0
                            ? `本街 ${s.betThisStreet.toLocaleString('zh-CN')}`
                            : '在局'}
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {/* 本局资源 */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>本局资源</div>
        <div className={styles.resourceGrid}>
          <div className={styles.resourceCell}>
            <span className={styles.resourceKey}>底池</span>
            <span className={styles.resourceVal}>
              {pot.toLocaleString('zh-CN')}
            </span>
          </div>
          <div className={styles.resourceCell}>
            <span className={styles.resourceKey}>公共牌</span>
            <span className={styles.resourceVal}>
              {state.communityCards.length}/5
            </span>
          </div>
          <div className={styles.resourceCell}>
            <span className={styles.resourceKey}>手牌</span>
            <span className={styles.resourceVal}>
              {hero?.holeCards?.length ?? 0} 张
            </span>
          </div>
          <div className={styles.resourceCell}>
            <span className={styles.resourceKey}>在局</span>
            <span className={styles.resourceVal}>
              {
                state.seats.filter(
                  (s) => !s.folded && !s.sittingOut,
                ).length
              }{' '}
              人
            </span>
          </div>
        </div>
      </section>

      {hint && (
        <section className={`${styles.section} ${styles.hintBox}`}>
          <div className={styles.sectionLabel}>提示</div>
          <p className={styles.hintText}>{hint}</p>
        </section>
      )}
    </aside>
  )
}
