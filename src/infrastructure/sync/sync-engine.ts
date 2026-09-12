import type { RepositorySnapshot, SyncQueueItem } from '@/core/domain/types'
import type { TrackerRepository } from '@/infrastructure/repositories/tracker-repository'

export interface CloudAdapter {
  push(item: Pick<SyncQueueItem, 'entity' | 'entityId' | 'operation' | 'payload' | 'updatedAt'>): Promise<{ applied: boolean }>
  pull(): Promise<RepositorySnapshot | null>
}

let activeSync: Promise<SyncResult> | null = null
export interface SyncResult { attempted: number; synced: number; pulled: boolean; error?: string }

function retryAt(attempts: number) {
  const seconds = Math.min(60 * 30, Math.max(10, 2 ** Math.min(attempts, 8) * 5))
  return new Date(Date.now() + seconds * 1000).toISOString()
}

export async function flushSyncQueue(repository: TrackerRepository, cloud?: CloudAdapter): Promise<SyncResult> {
  if (activeSync) return activeSync
  activeSync = (async () => {
    if (!cloud || !navigator.onLine) return { attempted: 0, synced: 0, pulled: false }
    const queue = await repository.getSyncQueue()
    const now = Date.now()
    const eligible = queue.filter(item => !item.nextAttemptAt || new Date(item.nextAttemptAt).getTime() <= now).slice(0, 20)
    let synced = 0
    let error: string | undefined
    for (const item of eligible) {
      try {
        await cloud.push(item)
        await repository.removeSyncItem(item.id)
        synced++
      } catch (cause) {
        error = cause instanceof Error ? cause.message : 'Sync failed'
        await repository.markSyncItemError(item.id, error, retryAt(item.attempts))
      }
    }
    let pulled = false
    try {
      const remote = await cloud.pull()
      if (remote) { await repository.mergeRemoteSnapshot(remote); pulled = true }
    } catch (cause) {
      error ??= cause instanceof Error ? cause.message : 'Cloud pull failed'
    }
    if (synced > 0 || pulled) await repository.markSyncedNow()
    return { attempted: eligible.length, synced, pulled, error }
  })()
  try { return await activeSync } finally { activeSync = null }
}
