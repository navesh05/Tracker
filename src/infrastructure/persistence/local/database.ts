import Dexie, { type Table } from 'dexie'
import type { DailyLog, GymLog, RunLog, SyncQueueItem, UserProfile, WeightCheckIn } from '@/core/domain/types'

export class TrackerDatabase extends Dexie {
  gymLogs!: Table<GymLog, string>
  runLogs!: Table<RunLog, string>
  dailyLogs!: Table<DailyLog, string>
  weightCheckIns!: Table<WeightCheckIn, string>
  profile!: Table<UserProfile & { id: string }, string>
  syncQueue!: Table<SyncQueueItem, string>
  meta!: Table<{ key: string; value: string }, string>

  constructor() {
    super('tracker-db')
    this.version(1).stores({ gymLogs: 'date, updatedAt', runLogs: 'date, updatedAt', dailyLogs: 'date, updatedAt', profile: 'id' })
    this.version(2).stores({ gymLogs: 'date, updatedAt', runLogs: 'date, updatedAt', dailyLogs: 'date, updatedAt', profile: 'id', syncQueue: 'id, entity, entityId, createdAt', meta: 'key' })
    this.version(3).stores({ gymLogs: 'date, updatedAt', runLogs: 'date, updatedAt', dailyLogs: 'date, updatedAt', profile: 'id', syncQueue: 'id, entity, entityId, createdAt, nextAttemptAt', meta: 'key' })
    this.version(4).stores({ gymLogs: 'date, updatedAt', runLogs: 'date, updatedAt', dailyLogs: 'date, updatedAt', weightCheckIns: 'id, weekNumber, measuredDate, updatedAt', profile: 'id', syncQueue: 'id, entity, entityId, createdAt, nextAttemptAt', meta: 'key' }).upgrade(async tx => {
      // Weight was previously part of the daily checklist. Preserve the newest historical
      // value as a baseline weekly check-in instead of deleting user data.
      const daily = await tx.table('dailyLogs').toArray() as Array<{date:string; weightKg?:number}>
      const existing = await tx.table('weightCheckIns').toArray() as Array<unknown>
      if (existing.length) return
      const withWeight = daily.filter(x => typeof x.weightKg === 'number' && x.weightKg > 0).sort((a,b)=>a.date.localeCompare(b.date))
      if (!withWeight.length) return
      const groups = new Map<number, { date: string; weightKg: number }>()
      const start = new Date('2026-09-08T12:00:00')
      for (const item of withWeight) {
        const measured = new Date(`${item.date}T12:00:00`)
        const week = Math.max(0, Math.floor((measured.getTime() - start.getTime()) / (7 * 86400000)))
        const existing = groups.get(week)
        if (!existing || item.date > existing.date) groups.set(week, { date: item.date, weightKg: item.weightKg! })
      }
      for (const [week, item] of groups) {
        const ending = new Date(start.getTime() + week * 7 * 86400000)
        const weekEndingDate = `${ending.getFullYear()}-${String(ending.getMonth()+1).padStart(2,'0')}-${String(ending.getDate()).padStart(2,'0')}`
        await tx.table('weightCheckIns').put({
          id: `week-${week}`, weekNumber: week, weekEndingDate, measuredDate: item.date,
          weightKg: item.weightKg, updatedAt: new Date().toISOString(), schemaVersion: 1,
        })
      }
    })
  }
}
export const db = new TrackerDatabase()
