import { useEffect, useMemo, useState } from 'react'
import { Check, Dumbbell, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ActivityCalendar } from '@/components/data-display/activity-calendar'
import { Metric } from '@/components/data-display/metric'
import { useAppStore } from '@/app/store'
import { gymPlanForDate, MUSCLE_GROUPS } from './plan'
import { today, parseDate, isFutureDate } from '@/core/utils/date'
import type { ActivityStatus, MuscleGroup } from '@/core/domain/types'
import { toast } from 'sonner'

export function GymPage() {
  const { gymLogs, upsertGym } = useAppStore()
  const [month, setMonth] = useState(new Date())
  const [selected, setSelected] = useState(today())
  const [open, setOpen] = useState(false)
  const log = gymLogs[selected], plan = gymPlanForDate(selected)
  const stats = useMemo(() => {
    const values = Object.values(gymLogs).filter(x => x.date.startsWith(format(month, 'yyyy-MM')))
    return { workout: values.filter(x => x.status === 'workout').length, rest: values.filter(x => x.status === 'rest').length, no: values.filter(x => x.status === 'no').length }
  }, [gymLogs, month])
  const state = (date: string) => gymLogs[date]?.status ?? 'empty'
  const select = (date: string) => { if (isFutureDate(date)) return; setSelected(date); setOpen(true) }
  const openToday = () => { setSelected(today()); setOpen(true) }
  return <div className="page-stack viewport-tight">
    <section className="page-heading"><div><p className="eyebrow">Gym · {format(parseDate(selected), 'MMM d')}</p><h1>Strength</h1><p className="subtle">{plan === 'Rest' ? 'Planned recovery day' : `Planned · ${plan}`}</p></div><Button onClick={openToday}><Plus size={15}/> Log today</Button></section>
    <div className="compact-stats"><Metric label="Workouts" value={String(stats.workout)} icon={Dumbbell}/><Metric label="Rest" value={String(stats.rest)}/><Metric label="Missed" value={String(stats.no)}/></div>
    <Card><CardContent className="calendar-content"><ActivityCalendar month={month} setMonth={setMonth} selectedDate={selected} onSelect={select} getState={state}/><div className="calendar-key"><span><i className="status-dot workout"/> Workout</span><span><i className="status-dot rest"/> Rest</span><span><i className="status-dot no"/> Missed</span><span><i className="status-dot empty"/> Not logged</span></div></CardContent></Card>
    <div className="selected-day-card"><div><span>Selected day</span><strong>{format(parseDate(selected), 'EEEE, MMM d')}</strong></div><p>{log?.status === 'workout' ? log.muscles.map(m => MUSCLE_GROUPS.find(x => x.value === m)?.label).join(' · ') || 'Workout logged' : log?.status ? labelStatus(log.status) : 'Not logged'}</p></div>
    <GymDialog open={open && !isFutureDate(selected)} onClose={() => setOpen(false)} date={selected} initial={log} onSave={async (status,muscles,notes) => { await upsertGym({ date: selected, status, muscles, notes: notes || undefined, updatedAt: new Date().toISOString(), schemaVersion: 1 }); setOpen(false); toast.success('Gym activity saved') }}/>
  </div>
}
function labelStatus(s: ActivityStatus) { return s === 'rest' ? 'Rest day' : s === 'no' ? 'Missed workout' : 'Not logged' }
function GymDialog({ open, onClose, date, initial, onSave }: { open:boolean; onClose:()=>void; date:string; initial?: {status:ActivityStatus; muscles:MuscleGroup[]; notes?:string}; onSave:(status:ActivityStatus,muscles:MuscleGroup[],notes:string)=>Promise<void> }) {
  const [status,setStatus]=useState<ActivityStatus>(initial?.status ?? 'workout')
  const [muscles,setMuscles]=useState<MuscleGroup[]>(initial?.muscles ?? [])
  const [notes,setNotes]=useState(initial?.notes ?? '')
  useEffect(() => { if(open){setStatus(initial?.status ?? 'workout');setMuscles(initial?.muscles ?? []);setNotes(initial?.notes ?? '')} }, [open, initial])
  return <Dialog open={open} onClose={onClose} title={`Gym · ${format(parseDate(date), 'EEE, MMM d')}`} description={gymPlanForDate(date)}>
    <div className="form-stack">
      <div className="form-section"><span className="form-section-title">How did it go?</span><div className="choice-grid">{[['workout','Workout','Completed the planned session'],['rest','Rest','Intentional recovery day'],['no','Missed','Planned to train but didn’t']].map(([value,label,desc])=><label className={`choice-card ${status===value?'selected':''}`} key={value}><input type="radio" name="gym-status" checked={status===value} onChange={()=>setStatus(value as ActivityStatus)}/><span className="choice-copy"><strong>{label}</strong><small>{desc}</small></span><i className="choice-check">{status===value?<Check size={13}/>:null}</i></label>)}</div></div>
      {status==='workout' && <div className="form-section"><div className="form-section-title-row"><span className="form-section-title">Focus</span><span className="form-hint">Select all that apply</span></div><div className="check-grid">{MUSCLE_GROUPS.map(m=><label key={m.value} className={`check-card ${muscles.includes(m.value)?'selected':''}`}><input type="checkbox" checked={muscles.includes(m.value)} onChange={()=>setMuscles(v=>v.includes(m.value)?v.filter(x=>x!==m.value):[...v,m.value])}/><span>{m.label}</span><i>{muscles.includes(m.value)?<Check size={13}/>:null}</i></label>)}</div></div>}
      <label className="field-label">Notes <Input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional"/></label>
      <div className="dialog-actions"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={()=>void onSave(status, status==='workout'?muscles:[], notes)}>Save activity</Button></div>
    </div>
  </Dialog>
}
