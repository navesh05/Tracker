import type { GymLog, RunLog } from '@/core/domain/types'

export type HeatState = 'both' | 'one' | 'rest' | 'no' | 'empty'
export function heatState(gym?: GymLog, run?: RunLog): HeatState {
  const gs = gym?.status, rs = run?.status
  if (gs === 'rest' && rs === 'rest') return 'rest'
  if (gs === 'no' && rs === 'no') return 'no'
  const gymDone = gs === 'workout', runDone = rs === 'run'
  if (gymDone && runDone) return 'both'
  if (gymDone || runDone) return 'one'
  return 'empty'
}
export function averagePaceSeconds(logs: RunLog[]) {
  const distance = logs.reduce((s, x) => s + (x.distanceKm ?? 0), 0)
  const duration = logs.reduce((s, x) => s + (x.durationSeconds ?? 0), 0)
  return distance > 0 ? duration / distance : null
}
