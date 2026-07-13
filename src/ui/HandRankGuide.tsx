import { useEffect, useRef, useState } from 'react'

/** 高 → 低（皇家同花顺 … 高牌） */
const RANKS: ReadonlyArray<{ name: string; desc: string }> = [
  { name: '皇家同花顺', desc: 'A-K-Q-J-10 同花，至高无上' },
  { name: '同花顺', desc: '五张连续同花' },
  { name: '四条', desc: '四张同点' },
  { name: '葫芦', desc: '三条 + 一对' },
  { name: '同花', desc: '五张同花色' },
  { name: '顺子', desc: '五张连续（可 A-2-3-4-5）' },
  { name: '三条', desc: '三张同点' },
  { name: '两对', desc: '两个不同对子' },
  { name: '一对', desc: '两张同点' },
  { name: '高牌', desc: '无法组成以上牌型，比最大单牌' },
]

export function HandRankGuide() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭，避免浮层常驻挡操作
  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      const el = rootRef.current
      if (el && !el.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className={`hand-rank-guide${open ? ' hand-rank-guide-open' : ''}`}
    >
      <button
        type="button"
        className="hand-rank-toggle"
        data-hand-rank-toggle
        aria-expanded={open}
        aria-controls="hand-rank-popover"
        onClick={() => setOpen((v) => !v)}
      >
        牌型速查 {open ? '▴' : '▾'}
      </button>
      {open && (
        <div
          id="hand-rank-popover"
          className="hand-rank-popover"
          role="dialog"
          aria-label="牌型速查"
        >
          <div className="hand-rank-popover-head">
            <span>牌力从高到低</span>
            <button
              type="button"
              className="hand-rank-close"
              onClick={() => setOpen(false)}
            >
              关闭
            </button>
          </div>
          <ol className="hand-rank-list">
            {RANKS.map((r, i) => (
              <li key={r.name} className="hand-rank-item">
                <span className="hand-rank-idx">{i + 1}</span>
                <span className="hand-rank-name">{r.name}</span>
                <span className="hand-rank-desc">{r.desc}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
