export type ActivityStatus = 'workout' | 'rest' | 'no' | 'not_logged'
export type RunStatus = 'run' | 'rest' | 'no' | 'not_logged'
export type MuscleGroup = 'chest' | 'back' | 'triceps' | 'biceps' | 'legs' | 'core'

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

export interface DailyLog {
  date: string
  calories?: number
  proteinG?: number
  sleepHours?: number
  steps?: number
  waterLiters?: number
  updatedAt: string
  schemaVersion: 1
}

export interface WeightCheckIn {
  id: string
  weekNumber: number
  weekEndingDate: string
  measuredDate: string
  weightKg: number
  targetWeightKg?: number
  notes?: string
  updatedAt: string
  schemaVersion: 1
}

export interface TrainingPlanDay { date: string; label: string }
export interface RunPlanDay { date: string; scheduled: boolean; distanceKm?: number; structure?: string }

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
}

export interface RepositorySnapshot {
  profile: UserProfile
  gymLogs: GymLog[]
  runLogs: RunLog[]
  dailyLogs: DailyLog[]
  weightCheckIns: WeightCheckIn[]
}

export type SyncEntity = 'gym' | 'run' | 'daily' | 'weight' | 'profile'
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
