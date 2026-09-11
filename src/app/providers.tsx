import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useEffect } from 'react'
import { useAppStore } from './store'
import { getFirebaseCloudAdapter } from '@/infrastructure/persistence/firebase/client'
import { flushSyncQueue } from '@/infrastructure/sync/sync-engine'
import { localRepository } from '@/infrastructure/repositories/tracker-repository'
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 2, refetchOnWindowFocus: false } } })
export function AppProviders({ children }: { children: ReactNode }) {
  const theme = useAppStore(s => s.theme), hydrate = useAppStore(s => s.hydrate), setSyncState = useAppStore(s => s.setSyncState), refresh = useAppStore(s => s.refreshFromRepository)
  useEffect(() => { void hydrate() }, [hydrate])
  useEffect(() => { const apply = () => document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)); apply(); const m = matchMedia('(prefers-color-scheme: dark)'); m.addEventListener('change', apply); return () => m.removeEventListener('change', apply) }, [theme])
  useEffect(() => {
    let disposed = false
    const sync = async () => {
      try {
        const adapter = await getFirebaseCloudAdapter()
        const result = await flushSyncQueue(localRepository, adapter)
        if (!disposed) { await refresh(); setSyncState(await localRepository.getSyncState()); if (result.error) setSyncState({ ...(await localRepository.getSyncState()), lastError: result.error }) }
      } catch (error) { if (!disposed) setSyncState({ ...(await localRepository.getSyncState()), lastError: error instanceof Error ? error.message : 'Sync unavailable' }) }
    }
    void sync(); window.addEventListener('online', sync); const timer = window.setInterval(sync, 60_000)
    return () => { disposed = true; window.removeEventListener('online', sync); window.clearInterval(timer) }
  }, [refresh, setSyncState])
  return <QueryClientProvider client={queryClient}>{children}<Toaster position="bottom-right" theme={theme === 'system' ? 'system' : theme} /></QueryClientProvider>
}
