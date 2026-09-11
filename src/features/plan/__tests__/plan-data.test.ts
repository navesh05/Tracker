import { describe, expect, it } from 'vitest'
import { runningWeeks, nutritionItems, trainingExercises, weeklyTargets } from '@/features/plan/data'

describe('workbook plan data', () => {
  it('contains the full 20-week running progression', () => {
    expect(runningWeeks).toHaveLength(20)
    expect(runningWeeks[0].targetDistance).toBe('3.5–4 km')
    expect(runningWeeks[19].targetDistance).toBe('5–6 km')
  })
  it('contains gym exercises and nutrition reference data', () => {
    expect(trainingExercises.length).toBeGreaterThan(15)
    expect(nutritionItems.length).toBeGreaterThan(10)
  })
  it('contains weekly weight targets through the final week', () => {
    expect(weeklyTargets).toHaveLength(21)
    expect(weeklyTargets.at(-1)?.targetWeightKg).toBe(76)
  })
})
