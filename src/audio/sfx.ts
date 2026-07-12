import { loadSettings } from '../store/settings'

type OscType = OscillatorType

let sharedCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return null
    if (!sharedCtx) sharedCtx = new AC()
    if (sharedCtx.state === 'suspended') {
      void sharedCtx.resume()
    }
    return sharedCtx
  } catch {
    return null
  }
}

function sfxEnabled(): boolean {
  try {
    return loadSettings().sfx !== false
  } catch {
    return true
  }
}

/** Short synthesized beep via Web Audio API. */
function beep(
  frequency: number,
  durationSec: number,
  type: OscType = 'sine',
  peakGain = 0.08,
  whenOffset = 0,
): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = frequency

  const t0 = ctx.currentTime + whenOffset
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(peakGain, t0 + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationSec)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + durationSec + 0.02)
}

/** Soft double-click — hole cards / street deal. */
export function playDeal(): void {
  if (!sfxEnabled()) return
  beep(880, 0.055, 'square', 0.045, 0)
  beep(1180, 0.045, 'square', 0.035, 0.045)
}

/** Low thud — chips (call / raise / all-in / blinds). */
export function playChip(): void {
  if (!sfxEnabled()) return
  beep(180, 0.07, 'triangle', 0.09, 0)
  beep(260, 0.05, 'triangle', 0.05, 0.03)
}

/** Ascending triad — win / showdown. */
export function playWin(): void {
  if (!sfxEnabled()) return
  beep(523.25, 0.1, 'sine', 0.08, 0)
  beep(659.25, 0.1, 'sine', 0.08, 0.09)
  beep(783.99, 0.16, 'sine', 0.1, 0.18)
}
