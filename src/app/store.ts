import { create } from 'zustand'
import type { GymLog, RunLog, SyncState, UserProfile, WeightCheckIn, WorkoutType } from '@/core/domain/types'
import { defaultProfile, localRepository } from '@/infrastructure/repositories/tracker-repository'
import { signInWithGoogle as signInWithGoogleCloud, subscribeToAuthUser, type AuthUserInfo } from '@/infrastructure/persistence/firebase/client'

interface AppState {
  hydrated: boolean
  saving: boolean
  theme: 'light' | 'dark' | 'system'
  profile: UserProfile
  gymLogs: Record<string, GymLog>
  runLogs: Record<string, RunLog>
  weightCheckIns: Record<string, WeightCheckIn>
  sync: SyncState
  authUser: AuthUserInfo | null
  authLoading: boolean
  hydrate: () => Promise<void>
  refreshFromRepository: () => Promise<void>
  setTheme: (theme: AppState['theme']) => void
  setProfile: (profile: UserProfile) => Promise<void>
  upsertGym: (log: GymLog) => Promise<void>
  upsertRun: (log: RunLog) => Promise<void>
  upsertWeightCheckIn: (log: WeightCheckIn) => Promise<void>
  setSyncState: (sync: SyncState) => void
  signInWithGoogle: () => Promise<void>
  watchAuthUser: () => void
  addWorkoutType: (label: string) => Promise<void>
  renameWorkoutType: (id: string, label: string) => Promise<void>
  deleteWorkoutType: (id: string) => Promise<void>
}
const toRecord = <T extends { date: string }>(items: T[]) => Object.fromEntries(items.map(x => [x.date, x]))
const toWeightRecord = (items: WeightCheckIn[]) => Object.fromEntries(items.map(x => [x.id, x]))
const savedTheme = (): AppState['theme'] => (localStorage.getItem('tracker-theme') as AppState['theme']) || 'system'
const snapshotState = (s: Awaited<ReturnType<typeof localRepository.getSnapshot>>) => ({
  profile: s.profile, gymLogs: toRecord(s.gymLogs), runLogs: toRecord(s.runLogs),
  weightCheckIns: toWeightRecord(s.weightCheckIns),
})
function slugify(label: string, existingIds: string[]) {
  const base = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'type'
  let id = base, n = 2
  while (existingIds.includes(id)) { id = `${base}-${n}`; n += 1 }
  return id
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false, saving: false, theme: typeof window !== 'undefined' ? savedTheme() : 'system',
  profile: defaultProfile, gymLogs: {}, runLogs: {}, weightCheckIns: {}, sync: { pending: 0, failed: 0 },
  authUser: null, authLoading: false,
  async hydrate() { if (get().hydrated) return; const s = await localRepository.getSnapshot(); set({ ...snapshotState(s), hydrated: true, sync: await localRepository.getSyncState() }) },
  async refreshFromRepository() { const s = await localRepository.getSnapshot(); set({ ...snapshotState(s), sync: await localRepository.getSyncState() }) },
  setTheme: theme => { localStorage.setItem('tracker-theme', theme); set({ theme }) },
  async setProfile(profile) { set({ saving: true }); try { await localRepository.saveProfile(profile); set({ profile }) } finally { set({ saving: false, sync: await localRepository.getSyncState() }) } },
  async upsertGym(log) { set({ saving: true }); try { await localRepository.saveGymLog(log); set({ gymLogs: { ...get().gymLogs, [log.date]: log } }) } finally { set({ saving: false, sync: await localRepository.getSyncState() }) } },
  async upsertRun(log) { set({ saving: true }); try { await localRepository.saveRunLog(log); set({ runLogs: { ...get().runLogs, [log.date]: log } }) } finally { set({ saving: false, sync: await localRepository.getSyncState() }) } },
  async upsertWeightCheckIn(log) {
    set({ saving: true })
    try {
      await localRepository.saveWeightCheckIn(log)
      const nextWeights = { ...get().weightCheckIns, [log.id]: log }
      const latest = Object.values(nextWeights).sort((a,b)=>a.measuredDate.localeCompare(b.measuredDate)).at(-1)
      const profile = get().profile
      set({ weightCheckIns: nextWeights, profile: latest ? { ...profile, currentWeightKg: latest.weightKg } : profile })
    } finally { set({ saving: false, sync: await localRepository.getSyncState() }) }
  },
  setSyncState: sync => set({ sync }),
  async signInWithGoogle() {
    set({ authLoading: true })
    try { const user = await signInWithGoogleCloud(); set({ authUser: user }) }
    finally { set({ authLoading: false }) }
  },
  watchAuthUser() { subscribeToAuthUser(user => set({ authUser: user })) },
  async addWorkoutType(label) {
    const profile = get().profile
    const id = slugify(label, profile.workoutTypes.map(t => t.id))
    const next: WorkoutType[] = [...profile.workoutTypes, { id, label: label.trim() }]
    await get().setProfile({ ...profile, workoutTypes: next })
  },
  async renameWorkoutType(id, label) {
    const profile = get().profile
    const next = profile.workoutTypes.map(t => t.id === id ? { ...t, label: label.trim() } : t)
    await get().setProfile({ ...profile, workoutTypes: next })
  },
  async deleteWorkoutType(id) {
    const profile = get().profile
    const next = profile.workoutTypes.filter(t => t.id !== id)
    await get().setProfile({ ...profile, workoutTypes: next })
  },
}))
