import { useEffect, useMemo, useState } from 'react'
import { Check, Footprints, Route, Timer, List } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ActivityCalendar } from '@/components/data-display/activity-calendar'
import { Metric } from '@/components/data-display/metric'
import { useAppStore } from '@/app/store'
import { today, parseDate, isFutureDate } from '@/core/utils/date'
import { formatPace, formatDuration } from '@/lib/utils'
import type { RunLog, RunStatus } from '@/core/domain/types'
import { toast } from 'sonner'

function labelStatus(s?: RunStatus) { return s === 'run' ? 'Run' : s === 'rest' ? 'Rest day' : s === 'no' ? 'Missed run' : 'Not logged' }

export function RunPage() {
  const { runLogs, upsertRun } = useAppStore()
  const [month,setMonth]=useState(new Date()), [selected,setSelected]=useState(today())
  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [monthListOpen, setMonthListOpen] = useState(false)
  const log=runLogs[selected]
  const monthEntries = useMemo(() => Object.values(runLogs).filter(x => x.date.startsWith(format(month,'yyyy-MM')) && x.status !== 'not_logged').sort((a,b) => b.date.localeCompare(a.date)), [runLogs, month])
  const stats=useMemo(()=>{const v=Object.values(runLogs).filter(x=>x.date.startsWith(format(month,'yyyy-MM'))); const runs=v.filter(x=>x.status==='run'); const distance=runs.reduce((s,x)=>s+(x.distanceKm??0),0); return {runs:runs.length,distance,pace:formatPace(runs.length?runs.reduce((s,x)=>s+(x.durationSeconds??0),0)/Math.max(distance,0.0001):null)}},[runLogs,month])
  const state=(date:string)=>runLogs[date]?.status??'empty'
  const select=(date:string)=>{ if(isFutureDate(date))return; setSelected(date); if (runLogs[date]) setDetailOpen(true); else setEditOpen(true) }

  return <div className="page-stack viewport-tight">
    <section className="page-heading"><div><p className="eyebrow">Run · {format(parseDate(selected), 'MMM d')}</p><h1>Running</h1><p className="subtle">Tap any date on the calendar to log or view it.</p></div></section>
    <div className="compact-stats"><Metric label="Runs" value={String(stats.runs)} icon={Footprints}/><Metric label="Distance" value={`${stats.distance.toFixed(1)} km`} icon={Route}/><Metric label="Avg pace" value={stats.pace} icon={Timer}/></div>
    <Card><CardContent className="calendar-content"><ActivityCalendar month={month} setMonth={setMonth} selectedDate={selected} onSelect={select} getState={state}/><div className="calendar-key"><span><i className="status-dot workout"/> Run</span><span><i className="status-dot rest"/> Rest</span><span><i className="status-dot no"/> Missed</span><span><i className="status-dot empty"/> Not logged</span></div></CardContent></Card>
    <Button variant="outline" className="month-list-trigger" onClick={() => setMonthListOpen(true)}><List size={15}/> View {format(month, 'MMMM')} log</Button>

    <Dialog open={monthListOpen} onClose={() => setMonthListOpen(false)} title={`Run · ${format(month, 'MMMM yyyy')}`} description={monthEntries.length ? `${monthEntries.length} logged day${monthEntries.length===1?'':'s'} this month` : 'No entries logged this month yet.'}>
      <div className="weight-entry-list">
        {monthEntries.map(entry => <button key={entry.date} className="weight-entry-row" onClick={() => { setSelected(entry.date); setMonthListOpen(false); setDetailOpen(true) }}>
          <span className="weight-entry-date">{format(parseDate(entry.date),'EEE, MMM d')}</span>
          <span className={`detail-badge ${entry.status}`}>{labelStatus(entry.status)}</span>
          {entry.status === 'run' && <span className="weight-entry-notes">{entry.distanceKm ?? 0} km</span>}
        </button>)}
      </div>
    </Dialog>

    <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} title={`Run · ${format(parseDate(selected), 'EEE, MMM d')}`}>
      <div className="detail-view">
        <div className="detail-row"><span>Status</span><strong className={`detail-badge ${log?.status}`}>{labelStatus(log?.status)}</strong></div>
        {log?.status === 'run' && <>
          <div className="detail-row"><span>Distance</span><strong>{log.distanceKm ?? 0} km</strong></div>
          <div className="detail-row"><span>Duration</span><strong>{formatDuration(log.durationSeconds)}</strong></div>
          <div className="detail-row"><span>Pace</span><strong>{formatPace((log.durationSeconds??0)/(log.distanceKm??1))}</strong></div>
          {log.calories !== undefined && <div className="detail-row"><span>Calories</span><strong>{log.calories}</strong></div>}
        </>}
        {log?.notes && <div className="detail-row detail-row-stack"><span>Notes</span><p>{log.notes}</p></div>}
        <div className="dialog-actions"><Button variant="ghost" onClick={() => setDetailOpen(false)}>Close</Button><Button onClick={() => { setDetailOpen(false); setEditOpen(true) }}>Edit</Button></div>
      </div>
    </Dialog>

    <RunDialog open={editOpen && !isFutureDate(selected)} onClose={()=>setEditOpen(false)} date={selected} initial={log} onSave={async data=>{await upsertRun({...data,date:selected,updatedAt:new Date().toISOString(),schemaVersion:1});setEditOpen(false);toast.success('Run activity saved')}}/>
  </div>
}
function RunDialog({open,onClose,date,initial,onSave}:{open:boolean;onClose:()=>void;date:string;initial?:RunLog;onSave:(data: Omit<RunLog,'date'|'updatedAt'|'schemaVersion'>)=>Promise<void>}){
  const [status,setStatus]=useState<RunStatus>(initial?.status??'run'),[distance,setDistance]=useState(initial?.distanceKm?String(initial.distanceKm):''),[duration,setDuration]=useState(initial?.durationSeconds?String(Math.round(initial.durationSeconds/60)):''),[calories,setCalories]=useState(initial?.calories?String(initial.calories):''),[notes,setNotes]=useState(initial?.notes??'')
  useEffect(()=>{if(open){setStatus(initial?.status??'run');setDistance(initial?.distanceKm?String(initial.distanceKm):'');setDuration(initial?.durationSeconds?String(Math.round(initial.durationSeconds/60)):'' );setCalories(initial?.calories?String(initial.calories):'');setNotes(initial?.notes??'')}},[open,initial])
  const d=Number(distance), mins=Number(duration), pace=d>0&&mins>0?(mins*60)/d:null
  return <Dialog open={open} onClose={onClose} title={`Run · ${format(parseDate(date),'EEE, MMM d')}`}>
    <div className="form-stack">
      <div className="form-section"><span className="form-section-title">How did it go?</span><div className="choice-grid">{[['run','Run','Completed a run'],['rest','Rest','Intentional recovery day'],['no','Missed','Planned to run but didn’t']].map(([value,label,desc])=><label className={`choice-card ${status===value?'selected':''}`} key={value}><input type="radio" name="run-status" checked={status===value} onChange={()=>setStatus(value as RunStatus)}/><span className="choice-copy"><strong>{label}</strong><small>{desc}</small></span><i className="choice-check">{status===value?<Check size={13}/>:null}</i></label>)}</div></div>
      {status==='run'&&<div className="form-section"><div className="form-grid"><label className="field-label">Distance (km)<Input inputMode="decimal" type="number" min="0" step="0.1" value={distance} onChange={e=>setDistance(e.target.value)}/></label><label className="field-label">Duration (min)<Input inputMode="numeric" type="number" min="0" step="1" value={duration} onChange={e=>setDuration(e.target.value)}/></label><div className="derived"><span>Average pace</span><strong>{formatPace(pace)}</strong><small>Calculated automatically</small></div><label className="field-label">Calories <Input inputMode="numeric" type="number" min="0" value={calories} onChange={e=>setCalories(e.target.value)}/></label></div></div>}
      <label className="field-label">Notes <Input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional"/></label>
      <div className="dialog-actions"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={()=>void onSave({status,distanceKm:status==='run'&&d>0?d:undefined,durationSeconds:status==='run'&&mins>0?Math.round(mins*60):undefined,calories:status==='run'&&Number(calories)>0?Number(calories):undefined,notes:notes||undefined})}>Save run</Button></div>
    </div>
  </Dialog>
}
