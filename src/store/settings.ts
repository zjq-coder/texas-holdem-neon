import type { AiDifficulty } from '../engine/ai'

export interface Settings {
  difficulty: AiDifficulty
  sfx: boolean
  animationSpeed: 'slow' | 'normal' | 'fast'
  hintsEnabled: boolean
  /** Merged into poker.settings JSON (was poker.tutorialDone). */
  tutorialDone: boolean
  playerName: string
}

export const defaultSettings: Settings = {
  difficulty: 'standard',
  sfx: true,
  animationSpeed: 'normal',
  hintsEnabled: true,
  tutorialDone: false,
  playerName: '你',
}

const KEY = 'poker.settings'

function storageAvailable(): boolean {
  return typeof localStorage !== 'undefined'
}

/** Load settings from localStorage; falls back to defaults on miss/error/SSR. */
export function loadSettings(): Settings {
  try {
    if (!storageAvailable()) return { ...defaultSettings }
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaultSettings }
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    return { ...defaultSettings }
  }
}

/** Persist full settings object under poker.settings. */
export function saveSettings(s: Settings): void {
  try {
    if (!storageAvailable()) return
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    // ignore quota / private mode
  }
}
