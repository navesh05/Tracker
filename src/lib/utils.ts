import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
export function formatPace(seconds?: number | null) {
  if (!seconds || !Number.isFinite(seconds)) return '—'
  const min = Math.floor(seconds / 60), sec = Math.round(seconds % 60)
  return `${min}:${String(sec).padStart(2, '0')} /km`
}
export function formatDuration(totalSeconds?: number) {
  if (!totalSeconds) return '—'
  const h = Math.floor(totalSeconds / 3600), m = Math.floor((totalSeconds % 3600) / 60), s = totalSeconds % 60
  return h ? `${h}h ${m}m` : `${m}:${String(s).padStart(2, '0')}`
}
