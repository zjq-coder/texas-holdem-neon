import { useState } from 'react'

export interface TutorialProps {
  onComplete: () => void
  onSkip: () => void
}

const STEPS: ReadonlyArray<{ title: string; body: string; spotlight: string }> = [
  {
    title: '庄家与盲注',
    body: '金色 D 标记庄家位。庄家左侧依次是小盲 / 大盲，每手强制投入盲注，推动底池形成。',
    spotlight: 'dealer',
  },
  {
    title: '你的手牌',
    body: '你坐在桌底 Hero 位，两张底牌仅自己可见，并带有青色霓虹描边。牌力决定你是弃牌、跟注还是进攻。',
    spotlight: 'hero',
  },
  {
    title: '操作栏',
    body: '轮到你时底部出现操作：弃牌、过牌 / 跟注、加注（含 1/2 池、满池、全下快捷）。仅合法动作可点。',
    spotlight: 'actions',
  },
  {
    title: '公共牌与摊牌',
    body: '翻牌 3 张 → 转牌 1 张 → 河牌 1 张。若多人看到摊牌，用底牌 + 公共牌组成最佳五张比牌型，赢家收池。',
    spotlight: 'board',
  },
]

export function Tutorial({ onComplete, onSkip }: TutorialProps) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]!
  const isLast = step >= STEPS.length - 1

  return (
    <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label="教程">
      <div className="tutorial-mask" aria-hidden />
      <div className={`tutorial-spotlight tutorial-spotlight-${current.spotlight}`} aria-hidden>
        <span className="tutorial-spotlight-ring" />
      </div>
      <div className="tutorial-card">
        <div className="tutorial-progress">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`tutorial-dot${i === step ? ' tutorial-dot-active' : ''}${i < step ? ' tutorial-dot-done' : ''}`}
            />
          ))}
          <span className="tutorial-step-label">
            {step + 1} / {STEPS.length}
          </span>
        </div>
        <h2 className="tutorial-title">{current.title}</h2>
        <p className="tutorial-body">{current.body}</p>
        <div className="tutorial-actions">
          <button type="button" className="ghost-cta tutorial-btn" onClick={onSkip}>
            跳过
          </button>
          {!isLast ? (
            <button
              type="button"
              className="primary-cta tutorial-btn"
              onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
            >
              下一步
            </button>
          ) : (
            <button type="button" className="primary-cta tutorial-btn" onClick={onComplete}>
              完成教程
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
