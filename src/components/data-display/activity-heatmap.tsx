import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HeatState } from '@/core/utils/activity'
import { monthCells, monthTitle, nextMonth, previousMonth, parseDate, today } from '@/core/utils/date'
import { Button } from '@/components/ui/button'

const stateClass: Record<HeatState, string> = { both: 'heat-both', one: 'heat-one', rest: 'heat-rest', no: 'heat-no', empty: 'heat-empty' }

export function ActivityHeatmap({ getState, month, setMonth }: { getState: (date: string) => HeatState; month: Date; setMonth: (date: Date) => void }) {
  const cells = monthCells(month)
  const activeDays = cells.filter(Boolean).filter(date => {
    const state = getState(date!)
    return state === 'one' || state === 'both'
  }).length
  const isCurrentMonth = format(month, 'yyyy-MM') === format(new Date(), 'yyyy-MM')
  return <div className="monthly-heatmap">
    <div className="heatmap-header">
      <div><strong>{monthTitle(month)}</strong><span>{activeDays} active day{activeDays === 1 ? '' : 's'}</span></div>
      <div className="heatmap-nav">
        <Button variant="ghost" size="icon" onClick={() => setMonth(previousMonth(month))} aria-label="Previous month"><ChevronLeft size={14}/></Button>
        <Button variant="ghost" size="icon" onClick={() => setMonth(nextMonth(month))} aria-label="Next month"><ChevronRight size={14}/></Button>
      </div>
    </div>
    <div className="weekday-row heatmap-weekdays">{['M','T','W','T','F','S','S'].map((d,i)=><span key={`${d}${i}`}>{d}</span>)}</div>
    <div className="monthly-heat-grid">{cells.map((date, i) => {
      if (!date) return <span className="heat-cell heat-blank" key={`blank-${i}`} />
      const state = getState(date)
      const future = date > today()
      return <div key={date} className="heat-day" title={`${format(parseDate(date),'MMM d, yyyy')} · ${future ? 'Future' : state}`}>
        <span className={`heat-cell ${future ? 'heat-future' : stateClass[state]}`} />
        <small>{format(parseDate(date),'d')}</small>
      </div>
    })}</div>
    <div className="heat-legend"><span><i className="heat-empty"/> No activity</span><span><i className="heat-one"/> One</span><span><i className="heat-both"/> Gym + Run</span><span><i className="heat-rest"/> Both rest</span></div>
    {isCurrentMonth ? <p className="heatmap-note">Activity is Gym + Run only. Rest and missed days never count as active.</p> : null}
  </div>
}
