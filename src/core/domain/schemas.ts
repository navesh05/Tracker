import { z } from 'zod'

const base = { schemaVersion: z.literal(1), updatedAt: z.string().datetime({ offset: true }) }
export const gymLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['workout', 'rest', 'no', 'not_logged']),
  muscles: z.array(z.string().min(1).max(40)).max(12),
  notes: z.string().max(500).optional(), ...base,
})
export const runLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['run', 'rest', 'no', 'not_logged']),
  distanceKm: z.number().positive().max(100).optional(),
  durationSeconds: z.number().int().positive().max(86400).optional(),
  calories: z.number().nonnegative().max(10000).optional(),
  notes: z.string().max(500).optional(), ...base,
}).superRefine((value, ctx) => {
  if (value.status === 'run' && (!value.distanceKm || !value.durationSeconds)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['distanceKm'], message: 'Run logs need distance and duration.' })
  if (value.status !== 'run' && (value.distanceKm !== undefined || value.durationSeconds !== undefined || value.calories !== undefined)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['status'], message: 'Run metrics are only valid for a completed run.' })
})
export const weightCheckInSchema = z.object({
  id: z.string().min(1).max(60),
  measuredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weightKg: z.number().positive().max(400),
  notes: z.string().max(500).optional(), ...base,
})
export const workoutTypeSchema = z.object({ id: z.string().min(1).max(40), label: z.string().trim().min(1).max(40) })
export const profileSchema = z.object({
  name: z.string().trim().min(1).max(80), startWeightKg: z.number().positive().max(400), currentWeightKg: z.number().positive().max(400), targetWeightKg: z.number().positive().max(400),
  calorieTarget: z.number().int().positive().max(10000), proteinTargetG: z.number().int().positive().max(1000), sleepTargetHours: z.number().positive().max(24), stepsTarget: z.number().int().positive().max(100000), waterTargetLiters: z.number().positive().max(30),
  workoutTypes: z.array(workoutTypeSchema).max(30),
})
