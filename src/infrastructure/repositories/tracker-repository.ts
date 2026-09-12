import { db } from '@/infrastructure/persistence/local/database'
import { gymLogSchema, profileSchema, runLogSchema, weightCheckInSchema } from '@/core/domain/schemas'
import type { GymLog, RunLog, RepositorySnapshot, SyncEntity, SyncQueueItem, SyncState, UserProfile, WeightCheckIn } from '@/core/domain/types'

export interface TrackerRepository {
  getSnapshot(): Promise<RepositorySnapshot>
  saveProfile(profile: UserProfile): Promise<void>
  saveGymLog(log: GymLog): Promise<void>
  saveRunLog(log: RunLog): Promise<void>
  saveWeightCheckIn(log: WeightCheckIn): Promise<void>
  mergeRemoteSnapshot(snapshot: RepositorySnapshot): Promise<void>
  getSyncQueue(): Promise<SyncQueueItem[]>
  getSyncState(): Promise<SyncState>
  markSyncItemError(id: string, error: string, nextAttemptAt: string): Promise<void>
  removeSyncItem(id: string): Promise<void>
  markSyncedNow(): Promise<void>
}

export const DEFAULT_WORKOUT_TYPES = [
  { id: 'chest', label: 'Chest' }, { id: 'back', label: 'Back' }, { id: 'triceps', label: 'Triceps' },
  { id: 'biceps', label: 'Biceps' }, { id: 'legs', label: 'Legs' }, { id: 'core', label: 'Core' },
]
export const defaultProfile: UserProfile = { name: 'Navesh', startWeightKg: 90, currentWeightKg: 90, targetWeightKg: 76, calorieTarget: 2297, proteinTargetG: 180, sleepTargetHours: 7.5, stepsTarget: 10000, waterTargetLiters: 3, workoutTypes: DEFAULT_WORKOUT_TYPES }
const now = () => new Date().toISOString()
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
const assertNotFuture = (date: string) => { if (date > localToday()) throw new Error('Future activity cannot be logged.') }

async function enqueue(entity: SyncEntity, entityId: string, payload: unknown, updatedAt: string) {
  const id = `${entity}:${entityId}`
  const existing = await db.syncQueue.get(id)
  await db.syncQueue.put({
    id, entity, entityId, operation: 'upsert', payload,
    createdAt: existing?.createdAt ?? updatedAt, updatedAt, attempts: 0,
    lastError: undefined, lastAttemptAt: undefined, nextAttemptAt: undefined,
  })
}
const newer = (remote: string, local: string) => remote > local

export const localRepository: TrackerRepository = {
  async getSnapshot() {
    const profile = (await db.profile.get('profile')) ?? defaultProfile
    return {
      profile: { ...defaultProfile, ...profile, workoutTypes: profile.workoutTypes?.length ? profile.workoutTypes : DEFAULT_WORKOUT_TYPES },
      gymLogs: await db.gymLogs.orderBy('date').toArray(),
      runLogs: await db.runLogs.orderBy('date').toArray(),
      weightCheckIns: await db.weightCheckIns.orderBy('measuredDate').toArray(),
    }
  },
  async saveProfile(profile) {
    const safe = profileSchema.parse(profile), updatedAt = now()
    await db.transaction('rw', db.profile, db.syncQueue, async () => {
      await db.profile.put({ ...safe, id: 'profile' })
      await enqueue('profile', 'profile', safe, updatedAt)
    })
  },
  async saveGymLog(log) {
    const safe = gymLogSchema.parse(log)
    assertNotFuture(safe.date)
    await db.transaction('rw', db.gymLogs, db.syncQueue, async () => { await db.gymLogs.put(safe); await enqueue('gym', safe.date, safe, safe.updatedAt) })
  },
  async saveRunLog(log) {
    const safe = runLogSchema.parse(log)
    assertNotFuture(safe.date)
    await db.transaction('rw', db.runLogs, db.syncQueue, async () => { await db.runLogs.put(safe); await enqueue('run', safe.date, safe, safe.updatedAt) })
  },
  async saveWeightCheckIn(log) {
    const safe = weightCheckInSchema.parse(log)
    assertNotFuture(safe.measuredDate)
    const profile = (await db.profile.get('profile')) ?? defaultProfile
    const allWeights = await db.weightCheckIns.orderBy('measuredDate').toArray()
    const isLatest = !allWeights.length || safe.measuredDate >= allWeights.at(-1)!.measuredDate
    const nextProfile = isLatest ? { ...profile, currentWeightKg: safe.weightKg } : profile
    await db.transaction('rw', db.weightCheckIns, db.profile, db.syncQueue, async () => {
      await db.weightCheckIns.put(safe)
      if (isLatest) await db.profile.put({ ...nextProfile, id: 'profile' })
      await enqueue('weight', safe.id, safe, safe.updatedAt)
      if (isLatest) await enqueue('profile', 'profile', { ...nextProfile }, safe.updatedAt)
    })
  },
  async mergeRemoteSnapshot(snapshot) {
    const safeProfile = profileSchema.parse(snapshot.profile)
    const pendingProfile = Boolean(await db.syncQueue.get('profile:profile'))
    const gyms = snapshot.gymLogs.map(x => gymLogSchema.parse(x))
    const runs = snapshot.runLogs.map(x => runLogSchema.parse(x))
    const weights = (snapshot.weightCheckIns ?? []).map(x => weightCheckInSchema.parse(x))
    await db.transaction('rw', db.profile, db.gymLogs, db.runLogs, db.weightCheckIns, async () => {
      if (!pendingProfile) await db.profile.put({ ...safeProfile, id: 'profile' })
      for (const remote of gyms) { const local = await db.gymLogs.get(remote.date); if (!local || newer(remote.updatedAt, local.updatedAt)) await db.gymLogs.put(remote) }
      for (const remote of runs) { const local = await db.runLogs.get(remote.date); if (!local || newer(remote.updatedAt, local.updatedAt)) await db.runLogs.put(remote) }
      for (const remote of weights) { const local = await db.weightCheckIns.get(remote.id); if (!local || newer(remote.updatedAt, local.updatedAt)) await db.weightCheckIns.put(remote) }
      if (!pendingProfile && weights.length) {
        const latest = weights.slice().sort((a,b)=>a.measuredDate.localeCompare(b.measuredDate)).at(-1)
        if (latest) await db.profile.put({ ...safeProfile, currentWeightKg: latest.weightKg, id: 'profile' })
      }
    })
  },
  getSyncQueue: () => db.syncQueue.orderBy('createdAt').toArray(),
  async getSyncState() {
    const queue = await db.syncQueue.toArray()
    return {
      pending: queue.filter(x => !x.lastError).length,
      failed: queue.filter(x => Boolean(x.lastError)).length,
      lastSyncedAt: (await db.meta.get('lastSyncedAt'))?.value,
      lastError: queue.find(x => x.lastError)?.lastError,
    }
  },
  async markSyncItemError(id, error, nextAttemptAt) {
    const item = await db.syncQueue.get(id)
    if (item) await db.syncQueue.put({ ...item, attempts: item.attempts + 1, lastError: error, lastAttemptAt: now(), nextAttemptAt })
  },
  removeSyncItem: id => db.syncQueue.delete(id),
  async markSyncedNow() { await db.meta.put({ key: 'lastSyncedAt', value: now() }) },
}
