import { useEffect, useMemo, useState } from 'react'
import { Check, Dumbbell, List } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ActivityCalendar } from '@/components/data-display/activity-calendar'
import { Metric } from '@/components/data-display/metric'
import { useAppStore } from '@/app/store'
import { today, parseDate, isFutureDate } from '@/core/utils/date'
import type { ActivityStatus, MuscleGroup } from '@/core/domain/types'
import { toast } from 'sonner'

function labelStatus(s: ActivityStatus) { return s === 'workout' ? 'Workout' : s === 'rest' ? 'Rest day' : s === 'no' ? 'Missed workout' : 'Not logged' }

export function GymPage() {
  const { profile, gymLogs, upsertGym } = useAppStore()
  const [month, setMonth] = useState(new Date())
  const [selected, setSelected] = useState(today())
  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [monthListOpen, setMonthListOpen] = useState(false)
  const log = gymLogs[selected]
  const workoutTypes = profile.workoutTypes
  const labelFor = (id: string) => workoutTypes.find(t => t.id === id)?.label ?? id

  const monthEntries = useMemo(() => {
    return Object.values(gymLogs)
      .filter(x => x.date.startsWith(format(month, 'yyyy-MM')) && x.status !== 'not_logged')
      .sort((a,b) => b.date.localeCompare(a.date))
  }, [gymLogs, month])

  const stats = useMemo(() => {
    const values = Object.values(gymLogs).filter(x => x.date.startsWith(format(month, 'yyyy-MM')))
    return { workout: values.filter(x => x.status === 'workout').length, rest: values.filter(x => x.status === 'rest').length, no: values.filter(x => x.status === 'no').length }
  }, [gymLogs, month])
  const state = (date: string) => gymLogs[date]?.status ?? 'empty'
  const select = (date: string) => { if (isFutureDate(date)) return; setSelected(date); if (gymLogs[date]) setDetailOpen(true); else setEditOpen(true) }

  return <div className="page-stack viewport-tight">
    <section className="page-heading"><div><p className="eyebrow">Gym · {format(parseDate(selected), 'MMM d')}</p><h1>Strength</h1><p className="subtle">Tap any date on the calendar to log or view it.</p></div></section>
    <div className="compact-stats"><Metric label="Workouts" value={String(stats.workout)} icon={Dumbbell}/><Metric label="Rest" value={String(stats.rest)}/><Metric label="Missed" value={String(stats.no)}/></div>
    <Card><CardContent className="calendar-content"><ActivityCalendar month={month} setMonth={setMonth} selectedDate={selected} onSelect={select} getState={state}/><div className="calendar-key"><span><i className="status-dot workout"/> Workout</span><span><i className="status-dot rest"/> Rest</span><span><i className="status-dot no"/> Missed</span><span><i className="status-dot empty"/> Not logged</span></div></CardContent></Card>
    <Button variant="outline" className="month-list-trigger" onClick={() => setMonthListOpen(true)}><List size={15}/> View {format(month, 'MMMM')} log</Button>

    <Dialog open={monthListOpen} onClose={() => setMonthListOpen(false)} title={`Gym · ${format(month, 'MMMM yyyy')}`} description={monthEntries.length ? `${monthEntries.length} logged day${monthEntries.length===1?'':'s'} this month` : 'No entries logged this month yet.'}>
      <div className="weight-entry-list">
        {monthEntries.map(entry => <button key={entry.date} className="weight-entry-row" onClick={() => { setSelected(entry.date); setMonthListOpen(false); setDetailOpen(true) }}>
          <span className="weight-entry-date">{format(parseDate(entry.date),'EEE, MMM d')}</span>
          <span className={`detail-badge ${entry.status}`}>{labelStatus(entry.status)}</span>
          {entry.status === 'workout' && entry.muscles.length > 0 && <span className="weight-entry-notes">{entry.muscles.map(labelFor).join(', ')}</span>}
        </button>)}
      </div>
    </Dialog>

    <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} title={`Gym · ${format(parseDate(selected), 'EEE, MMM d')}`}>
      <div className="detail-view">
        <div className="detail-row"><span>Status</span><strong className={`detail-badge ${log?.status}`}>{log ? labelStatus(log.status) : 'Not logged'}</strong></div>
        {log?.status === 'workout' && log.muscles.length > 0 && <div className="detail-row detail-row-stack"><span>Focus</span><div className="detail-chip-list">{log.muscles.map(m => <span className="detail-chip" key={m}>{labelFor(m)}</span>)}</div></div>}
        {log?.notes && <div className="detail-row detail-row-stack"><span>Notes</span><p>{log.notes}</p></div>}
        <div className="dialog-actions"><Button variant="ghost" onClick={() => setDetailOpen(false)}>Close</Button><Button onClick={() => { setDetailOpen(false); setEditOpen(true) }}>Edit</Button></div>
      </div>
    </Dialog>

    <GymDialog open={editOpen && !isFutureDate(selected)} onClose={() => setEditOpen(false)} date={selected} initial={log} workoutTypes={workoutTypes} onSave={async (status,muscles,notes) => { await upsertGym({ date: selected, status, muscles, notes: notes || undefined, updatedAt: new Date().toISOString(), schemaVersion: 1 }); setEditOpen(false); toast.success('Gym activity saved') }}/>
  </div>
}

function GymDialog({ open, onClose, date, initial, workoutTypes, onSave }: { open:boolean; onClose:()=>void; date:string; initial?: {status:ActivityStatus; muscles:MuscleGroup[]; notes?:string}; workoutTypes: {id:string;label:string}[]; onSave:(status:ActivityStatus,muscles:MuscleGroup[],notes:string)=>Promise<void> }) {
  const [status,setStatus]=useState<ActivityStatus>(initial?.status ?? 'workout')
  const [muscles,setMuscles]=useState<MuscleGroup[]>(initial?.muscles ?? [])
  const [notes,setNotes]=useState(initial?.notes ?? '')
  useEffect(() => { if(open){setStatus(initial?.status ?? 'workout');setMuscles(initial?.muscles ?? []);setNotes(initial?.notes ?? '')} }, [open, initial])
  return <Dialog open={open} onClose={onClose} title={`Gym · ${format(parseDate(date), 'EEE, MMM d')}`}>
    <div className="form-stack">
      <div className="form-section"><span className="form-section-title">How did it go?</span><div className="choice-grid">{[['workout','Workout','Completed the planned session'],['rest','Rest','Intentional recovery day'],['no','Missed','Planned to train but didn’t']].map(([value,label,desc])=><label className={`choice-card ${status===value?'selected':''}`} key={value}><input type="radio" name="gym-status" checked={status===value} onChange={()=>setStatus(value as ActivityStatus)}/><span className="choice-copy"><strong>{label}</strong><small>{desc}</small></span><i className="choice-check">{status===value?<Check size={13}/>:null}</i></label>)}</div></div>
      {status==='workout' && <div className="form-section"><div className="form-section-title-row"><span className="form-section-title">Focus</span><span className="form-hint">Select all that apply · manage in Settings</span></div><div className="check-grid">{workoutTypes.map(m=><label key={m.id} className={`check-card ${muscles.includes(m.id)?'selected':''}`}><input type="checkbox" checked={muscles.includes(m.id)} onChange={()=>setMuscles(v=>v.includes(m.id)?v.filter(x=>x!==m.id):[...v,m.id])}/><span>{m.label}</span><i>{muscles.includes(m.id)?<Check size={13}/>:null}</i></label>)}</div></div>}
      <label className="field-label">Notes <Input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional"/></label>
      <div className="dialog-actions"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={()=>void onSave(status, status==='workout'?muscles:[], notes)}>Save activity</Button></div>
    </div>
  </Dialog>
}
