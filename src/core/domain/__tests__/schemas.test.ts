import { describe, expect, it } from 'vitest'
import { gymLogSchema, runLogSchema, weightCheckInSchema } from '@/core/domain/schemas'

const stamp = '2026-09-11T00:00:00+05:30'

describe('domain schemas', () => {
  it('requires run distance and duration for completed runs', () => {
    expect(() => runLogSchema.parse({ date:'2026-09-10', status:'run', muscles:[], updatedAt:stamp, schemaVersion:1 })).toThrow()
  })
  it('rejects run metrics on a rest day', () => {
    expect(() => runLogSchema.parse({ date:'2026-09-10', status:'rest', distanceKm:4, durationSeconds:2400, updatedAt:stamp, schemaVersion:1 })).toThrow()
  })
  it('validates gym focus as a bounded list', () => {
    const value = gymLogSchema.parse({ date:'2026-09-10', status:'workout', muscles:['chest','back'], updatedAt:stamp, schemaVersion:1 })
    expect(value.muscles).toHaveLength(2)
  })
  it('accepts a simple date + weight check-in with no week concept', () => {
    const value = weightCheckInSchema.parse({ id:'2026-09-16', measuredDate:'2026-09-16', weightKg:89.4, updatedAt:stamp, schemaVersion:1 })
    expect(value.weightKg).toBe(89.4)
  })
  it('rejects a non-positive weight', () => {
    expect(() => weightCheckInSchema.parse({ id:'x', measuredDate:'2026-09-16', weightKg:0, updatedAt:stamp, schemaVersion:1 })).toThrow()
  })
})
