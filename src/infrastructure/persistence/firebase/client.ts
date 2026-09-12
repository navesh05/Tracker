import { initializeApp, getApps } from 'firebase/app'
import { getAuth, signInAnonymously, linkWithPopup, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, type Auth, type User } from 'firebase/auth'
import { getFirestore, doc, getDoc, getDocs, collection, runTransaction, type Firestore } from 'firebase/firestore'
import type { RepositorySnapshot, SyncQueueItem, WorkoutType } from '@/core/domain/types'
import { DEFAULT_WORKOUT_TYPES } from '@/infrastructure/repositories/tracker-repository'
import type { CloudAdapter } from '@/infrastructure/sync/sync-engine'

let auth: Auth | undefined
let firestore: Firestore | undefined
function firebaseConfig() {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID, apiKey = import.meta.env.VITE_FIREBASE_API_KEY, appId = import.meta.env.VITE_FIREBASE_APP_ID
  if (!projectId || !apiKey || !appId) return null
  return { projectId, apiKey, appId, authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID }
}
export function isFirebaseConfigured() { return Boolean(firebaseConfig()) }
async function ensureCloud() {
  const config = firebaseConfig(); if (!config) return null
  const app = getApps()[0] ?? initializeApp(config)
  auth ??= getAuth(app); firestore ??= getFirestore(app)
  if (!auth.currentUser) await signInAnonymously(auth)
  return auth.currentUser?.uid && firestore ? { uid: auth.currentUser.uid, db: firestore } : null
}

export type AuthUserInfo = { uid: string; isAnonymous: boolean; email: string | null; displayName: string | null }
function toAuthUserInfo(user: User): AuthUserInfo {
  return { uid: user.uid, isAnonymous: user.isAnonymous, email: user.email, displayName: user.displayName }
}

/** Links the current anonymous account to Google, preserving the same uid and all existing data.
 *  Falls back to a plain Google sign-in only if that Google account is already linked elsewhere. */
export async function signInWithGoogle(): Promise<AuthUserInfo> {
  const cloud = await ensureCloud()
  if (!cloud || !auth?.currentUser) throw new Error('Cloud sync is not configured.')
  const provider = new GoogleAuthProvider()
  try {
    const result = await linkWithPopup(auth.currentUser, provider)
    return toAuthUserInfo(result.user)
  } catch (err) {
    const code = (err as { code?: string })?.code
    if (code === 'auth/credential-already-in-use' || code === 'auth/email-already-in-use') {
      const result = await signInWithPopup(auth, provider)
      return toAuthUserInfo(result.user)
    }
    throw err
  }
}

/** Subscribes to auth state changes so the UI can reflect whether the account is anonymous or Google-linked. */
export function subscribeToAuthUser(callback: (user: AuthUserInfo | null) => void): () => void {
  const config = firebaseConfig(); if (!config) { callback(null); return () => {} }
  const app = getApps()[0] ?? initializeApp(config)
  auth ??= getAuth(app)
  return onAuthStateChanged(auth, user => callback(user ? toAuthUserInfo(user) : null))
}

export async function getFirebaseCloudAdapter(): Promise<CloudAdapter | undefined> {
  const cloud = await ensureCloud(); if (!cloud) return undefined
  const { uid, db } = cloud
  const push = async (item: Pick<SyncQueueItem, 'entity' | 'entityId' | 'operation' | 'payload' | 'updatedAt'>) => {
    const ref = doc(db, 'users', uid, item.entity, item.entityId)
    const applied = await runTransaction(db, async tx => {
      const current = await tx.get(ref)
      const currentUpdatedAt = current.data()?._sync?.updatedAt as string | undefined
      if (currentUpdatedAt && currentUpdatedAt > item.updatedAt) return false
      tx.set(ref, { ...(item.payload as Record<string, unknown>), _sync: { updatedAt: item.updatedAt, operation: item.operation, source: 'tracker-pwa' } }, { merge: true })
      return true
    })
    return { applied }
  }
  const pull = async (): Promise<RepositorySnapshot | null> => {
    const [profileSnap, gymSnap, runSnap, weightSnap] = await Promise.all([
      getDoc(doc(db, 'users', uid, 'profile', 'profile')),
      getDocs(collection(db, 'users', uid, 'gym')),
      getDocs(collection(db, 'users', uid, 'run')),
      getDocs(collection(db, 'users', uid, 'weight')),
    ])
    if (!profileSnap.exists() && gymSnap.empty && runSnap.empty && weightSnap.empty) return null
    const profileData = profileSnap.data()
    if (!profileData) return null
    const workoutTypes = Array.isArray(profileData.workoutTypes) && profileData.workoutTypes.length
      ? profileData.workoutTypes as WorkoutType[] : DEFAULT_WORKOUT_TYPES
    const profile = { name: String(profileData.name), startWeightKg: Number(profileData.startWeightKg), currentWeightKg: Number(profileData.currentWeightKg), targetWeightKg: Number(profileData.targetWeightKg), calorieTarget: Number(profileData.calorieTarget), proteinTargetG: Number(profileData.proteinTargetG), sleepTargetHours: Number(profileData.sleepTargetHours), stepsTarget: Number(profileData.stepsTarget), waterTargetLiters: Number(profileData.waterTargetLiters), workoutTypes }
    return {
      profile,
      gymLogs: gymSnap.docs.map(x => x.data()).filter(x => x.date),
      runLogs: runSnap.docs.map(x => x.data()).filter(x => x.date),
      weightCheckIns: weightSnap.docs.map(x => x.data()).filter(x => x.id),
    } as RepositorySnapshot
  }
  return { push, pull }
}
