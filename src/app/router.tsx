import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { HomePage } from '@/features/home/page'
import { GymPage } from '@/features/gym/page'
import { RunPage } from '@/features/run/page'
import { WeightPage } from '@/features/weight/page'
import { SettingsPage } from '@/features/settings/page'

export const router = createBrowserRouter([{ path: '/', element: <AppShell />, children: [
  { index: true, element: <HomePage /> }, { path: 'gym', element: <GymPage /> }, { path: 'run', element: <RunPage /> },
  { path: 'weight', element: <WeightPage /> }, { path: 'settings', element: <SettingsPage /> },
]}], { basename: import.meta.env.BASE_URL })
