import { create } from 'zustand'
import type { DailyLog, GymLog, RunLog, SyncState, UserProfile, WeightCheckIn } from '@/core/domain/types'
import { defaultProfile, localRepository } from '@/infrastructure/repositories/tracker-repository'

interface AppState {
  hydrated: boolean
  saving: boolean
  theme: 'light' | 'dark' | 'system'
  profile: UserProfile
  gymLogs: Record<string, GymLog>
  runLogs: Record<string, RunLog>
  dailyLogs: Record<string, DailyLog>
  weightCheckIns: Record<string, WeightCheckIn>
  sync: SyncState
  hydrate: () => Promise<void>
  refreshFromRepository: () => Promise<void>
  setTheme: (theme: AppState['theme']) => void
  setProfile: (profile: UserProfile) => Promise<void>
  upsertGym: (log: GymLog) => Promise<void>
  upsertRun: (log: RunLog) => Promise<void>
  upsertDaily: (log: DailyLog) => Promise<void>
  upsertWeightCheckIn: (log: WeightCheckIn) => Promise<void>
  setSyncState: (sync: SyncState) => void
}
const toRecord = <T extends { date: string }>(items: T[]) => Object.fromEntries(items.map(x => [x.date, x]))
const toWeightRecord = (items: WeightCheckIn[]) => Object.fromEntries(items.map(x => [x.id, x]))
const savedTheme = (): AppState['theme'] => (localStorage.getItem('tracker-theme') as AppState['theme']) || 'system'
const snapshotState = (s: Awaited<ReturnType<typeof localRepository.getSnapshot>>) => ({
  profile: s.profile, gymLogs: toRecord(s.gymLogs), runLogs: toRecord(s.runLogs), dailyLogs: toRecord(s.dailyLogs),
  weightCheckIns: toWeightRecord(s.weightCheckIns),
})
export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false, saving: false, theme: typeof window !== 'undefined' ? savedTheme() : 'system',
  profile: defaultProfile, gymLogs: {}, runLogs: {}, dailyLogs: {}, weightCheckIns: {}, sync: { pending: 0, failed: 0 },
  async hydrate() { if (get().hydrated) return; const s = await localRepository.getSnapshot(); set({ ...snapshotState(s), hydrated: true, sync: await localRepository.getSyncState() }) },
  async refreshFromRepository() { const s = await localRepository.getSnapshot(); set({ ...snapshotState(s), sync: await localRepository.getSyncState() }) },
  setTheme: theme => { localStorage.setItem('tracker-theme', theme); set({ theme }) },
  async setProfile(profile) { set({ saving: true }); try { await localRepository.saveProfile(profile); set({ profile }) } finally { set({ saving: false, sync: await localRepository.getSyncState() }) } },
  async upsertGym(log) { set({ saving: true }); try { await localRepository.saveGymLog(log); set({ gymLogs: { ...get().gymLogs, [log.date]: log } }) } finally { set({ saving: false, sync: await localRepository.getSyncState() }) } },
  async upsertRun(log) { set({ saving: true }); try { await localRepository.saveRunLog(log); set({ runLogs: { ...get().runLogs, [log.date]: log } }) } finally { set({ saving: false, sync: await localRepository.getSyncState() }) } },
  async upsertDaily(log) { set({ saving: true }); try { await localRepository.saveDailyLog(log); set({ dailyLogs: { ...get().dailyLogs, [log.date]: log } }) } finally { set({ saving: false, sync: await localRepository.getSyncState() }) } },
  async upsertWeightCheckIn(log) { set({ saving: true }); try { await localRepository.saveWeightCheckIn(log); const profile = get().profile; set({ weightCheckIns: { ...get().weightCheckIns, [log.id]: log }, profile: { ...profile, currentWeightKg: log.weightKg } }) } finally { set({ saving: false, sync: await localRepository.getSyncState() }) } },
  setSyncState: sync => set({ sync }),
}))
