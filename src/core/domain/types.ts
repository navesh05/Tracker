export type ActivityStatus = 'workout' | 'rest' | 'no' | 'not_logged'
export type RunStatus = 'run' | 'rest' | 'no' | 'not_logged'

/** A user-managed workout focus type (e.g. "Chest", "Abs"). Logs store the stable `id`,
 *  never the label directly — so renaming a type updates every past log automatically,
 *  and deleting one never corrupts history (old logs just fall back to showing the raw id). */
export interface WorkoutType { id: string; label: string }
export type MuscleGroup = string

export interface GymLog {
  date: string
  status: ActivityStatus
  muscles: MuscleGroup[]
  notes?: string
  updatedAt: string
  schemaVersion: 1
}

export interface RunLog {
  date: string
  status: RunStatus
  distanceKm?: number
  durationSeconds?: number
  calories?: number
  notes?: string
  updatedAt: string
  schemaVersion: 1
}

export interface WeightCheckIn {
  id: string
  measuredDate: string
  weightKg: number
  notes?: string
  updatedAt: string
  schemaVersion: 1
}

export interface UserProfile {
  name: string
  startWeightKg: number
  currentWeightKg: number
  targetWeightKg: number
  calorieTarget: number
  proteinTargetG: number
  sleepTargetHours: number
  stepsTarget: number
  waterTargetLiters: number
  workoutTypes: WorkoutType[]
}

export interface RepositorySnapshot {
  profile: UserProfile
  gymLogs: GymLog[]
  runLogs: RunLog[]
  weightCheckIns: WeightCheckIn[]
}

export type SyncEntity = 'gym' | 'run' | 'weight' | 'profile'
export interface SyncQueueItem {
  id: string
  entity: SyncEntity
  entityId: string
  operation: 'upsert'
  payload: unknown
  createdAt: string
  updatedAt: string
  attempts: number
  nextAttemptAt?: string
  lastAttemptAt?: string
  lastError?: string
}

export interface SyncState {
  pending: number
  failed: number
  lastSyncedAt?: string
  lastError?: string
}
