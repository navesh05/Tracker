import { addMonths, format, getDaysInMonth, startOfMonth, subMonths } from 'date-fns'
export const today = () => format(new Date(), 'yyyy-MM-dd')
export const parseDate = (value: string) => new Date(`${value}T12:00:00`)
export const iso = (date: Date) => format(date, 'yyyy-MM-dd')
export const monthTitle = (date: Date) => format(date, 'MMMM yyyy')
export const dateTitle = (date: Date) => format(date, 'EEEE, MMMM d, yyyy')
export const previousMonth = (date: Date) => subMonths(date, 1)
export const nextMonth = (date: Date) => addMonths(date, 1)
export const isFutureDate = (value: string) => value > today()
export function monthCells(date: Date): (string | null)[] {
  const first = startOfMonth(date), leading = (first.getDay() + 6) % 7, count = getDaysInMonth(first)
  const cells: (string | null)[] = Array.from({ length: leading }, () => null)
  for (let day = 1; day <= count; day++) cells.push(iso(new Date(date.getFullYear(), date.getMonth(), day)))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}
