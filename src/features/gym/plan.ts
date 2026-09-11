import type { MuscleGroup } from '@/core/domain/types'
export const MUSCLE_GROUPS: { value: MuscleGroup; label: string }[] = [
  { value: 'chest', label: 'Chest' }, { value: 'back', label: 'Back' }, { value: 'triceps', label: 'Triceps' }, { value: 'biceps', label: 'Biceps' }, { value: 'legs', label: 'Legs' }, { value: 'core', label: 'Core' },
]
export function gymPlanForDate(date: string) {
  const day = new Date(`${date}T12:00:00`).getDay()
  return ({ 1: 'Chest + Triceps + Core', 2: 'Back + Biceps', 3: 'Shoulders + Core', 4: 'Legs', 5: 'Full body + Core', 6: 'Active recovery + Core', 0: 'Rest' } as Record<number, string>)[day]
}
