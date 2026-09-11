import { differenceInCalendarDays } from 'date-fns'
import { runningWeeks } from '@/features/plan/data'
export function runPlanForDate(date: string) {
  const d = new Date(`${date}T12:00:00`)
  const start = new Date('2026-09-08T12:00:00')
  const weekIndex = Math.max(1, Math.min(20, Math.floor(differenceInCalendarDays(d, start) / 7) + 1))
  const week = runningWeeks[weekIndex - 1]
  const weekday = d.getDay()
  const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][weekday]
  const scheduledDays = week.runDays.split(' / ').map(x => x.trim())
  const scheduled = scheduledDays.includes(day)
  return { scheduled, distanceKm: scheduled ? parseDistance(week.targetDistance) : undefined, structure: scheduled ? week.structure : 'Recovery / no scheduled run', week: week.week, targetDistance: week.targetDistance }
}
function parseDistance(value: string) {
  const nums = value.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? []
  return nums.length > 1 ? Number(((nums[0] + nums[1]) / 2).toFixed(1)) : nums[0] ?? 0
}
