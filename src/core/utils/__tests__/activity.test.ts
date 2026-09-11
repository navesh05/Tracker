import { describe, expect, it } from 'vitest'
import { averagePaceSeconds, heatState } from '../activity'

describe('activity helpers', () => {
  it('marks both gym and run as dark activity', () => expect(heatState({date:'x',status:'workout',muscles:[],updatedAt:'x',schemaVersion:1}, {date:'x',status:'run',updatedAt:'x',schemaVersion:1})).toBe('both'))
  it('calculates weighted average pace from total duration / distance', () => expect(averagePaceSeconds([{date:'x',status:'run',distanceKm:4,durationSeconds:2400,updatedAt:'x',schemaVersion:1}])).toBe(600))
})
