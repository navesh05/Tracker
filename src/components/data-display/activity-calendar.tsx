import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { monthCells, monthTitle, nextMonth, previousMonth, parseDate, today, isFutureDate } from '@/core/utils/date'
import type { HeatState } from '@/core/utils/activity'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function ActivityCalendar({ month, setMonth, selectedDate, onSelect, getState }: { month: Date; setMonth: (date: Date) => void; selectedDate?: string; onSelect: (date: string) => void; getState: (date: string) => HeatState | string }) {
  const cells = monthCells(month)
  return <div className="calendar">
    <div className="calendar-head"><div><strong>{monthTitle(month)}</strong><span>Past and today can be logged · future dates are view-only</span></div><div className="calendar-nav"><Button variant="ghost" size="icon" onClick={() => setMonth(previousMonth(month))} aria-label="Previous month"><ChevronLeft size={16}/></Button><Button variant="ghost" size="icon" onClick={() => setMonth(nextMonth(month))} aria-label="Next month"><ChevronRight size={16}/></Button></div></div>
    <div className="weekday-row">{['M','T','W','T','F','S','S'].map((d,i)=><span key={`${d}${i}`}>{d}</span>)}</div>
    <div className="calendar-grid">{cells.map((date, i) => {
      if (!date) return <span className="calendar-empty" key={`empty-${i}`} />
      const future = date > today()
      return <button type="button" key={date} aria-label={format(parseDate(date), 'EEEE, MMMM d')} disabled={future} className={cn('calendar-day', selectedDate === date && 'selected', today() === date && 'today', future && 'future')} onClick={() => !future && onSelect(date)}><span>{format(parseDate(date), 'd')}</span><i className={`day-state ${future ? 'empty' : getState(date)}`} /></button>
    })}</div>
  </div>
}
