import type { AiDifficulty } from '../engine/ai'
import { useGame } from '../store/gameStore'
import type { Settings } from '../store/settings'

export interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

const DIFFICULTY_OPTIONS: ReadonlyArray<{ value: AiDifficulty; label: string }> = [
  { value: 'tight', label: '紧慎' },
  { value: 'standard', label: '标准' },
  { value: 'loose', label: '松凶' },
]

const SPEED_OPTIONS: ReadonlyArray<{
  value: Settings['animationSpeed']
  label: string
}> = [
  { value: 'slow', label: '慢' },
  { value: 'normal', label: '正常' },
  { value: 'fast', label: '快' },
]

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useGame()

  if (!open) return null

  return (
    <div className="settings-overlay" role="dialog" aria-modal="true" aria-label="设置">
      <button
        type="button"
        className="settings-backdrop"
        aria-label="关闭设置"
        onClick={onClose}
      />
      <div className="settings-panel">
        <header className="settings-header">
          <h2 className="settings-title">设置</h2>
          <button type="button" className="settings-close" onClick={onClose}>
            关闭
          </button>
        </header>

        <label className="settings-row">
          <span className="settings-label">AI 难度</span>
          <select
            className="settings-select"
            value={settings.difficulty}
            onChange={(e) =>
              updateSettings({ difficulty: e.target.value as AiDifficulty })
            }
          >
            {DIFFICULTY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="settings-row">
          <span className="settings-label">音效</span>
          <input
            type="checkbox"
            className="settings-check"
            checked={settings.sfx}
            onChange={(e) => updateSettings({ sfx: e.target.checked })}
          />
        </label>

        <label className="settings-row">
          <span className="settings-label">动画速度</span>
          <select
            className="settings-select"
            value={settings.animationSpeed}
            onChange={(e) =>
              updateSettings({
                animationSpeed: e.target.value as Settings['animationSpeed'],
              })
            }
          >
            {SPEED_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="settings-row">
          <span className="settings-label">练习提示</span>
          <input
            type="checkbox"
            className="settings-check"
            checked={settings.hintsEnabled}
            onChange={(e) => updateSettings({ hintsEnabled: e.target.checked })}
          />
        </label>
      </div>
    </div>
  )
}
