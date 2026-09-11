import { useEffect, useMemo, useState } from 'react'
import { format, startOfWeek, differenceInCalendarDays } from 'date-fns'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Dumbbell, Footprints, Scale, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { Metric } from '@/components/data-display/metric'
import { ActivityHeatmap } from '@/components/data-display/activity-heatmap'
import { useAppStore } from '@/app/store'
import { heatState } from '@/core/utils/activity'
import { today, parseDate, isFutureDate } from '@/core/utils/date'
import { gymPlanForDate } from '@/features/gym/plan'
import { runPlanForDate } from '@/features/run/plan'
import { weeklyTargets } from '@/features/plan/data'
import { formatPace } from '@/lib/utils'
import type { WeightCheckIn } from '@/core/domain/types'
import { toast } from 'sonner'

function activityStatusClass(status?: string) { return status === 'workout' ? 'status-done' : status === 'rest' ? 'status-rest' : status === 'no' ? 'status-no' : 'status-neutral' }
function activityStatusLabel(status?: string) { return status === 'workout' ? 'Done' : status === 'rest' ? 'Rest' : status === 'no' ? 'Missed' : 'Log' }
function runStatusClass(status?: string) { return status === 'run' ? 'status-done' : status === 'rest' ? 'status-rest' : status === 'no' ? 'status-no' : 'status-neutral' }
function runStatusLabel(status?: string) { return status === 'run' ? 'Done' : status === 'rest' ? 'Rest' : status === 'no' ? 'Missed' : 'Log' }

export function HomePage() {
  const { profile, gymLogs, runLogs, weightCheckIns, upsertWeightCheckIn } = useAppStore()
  const [activityMonth, setActivityMonth] = useState(new Date())
  const [weightDialogOpen, setWeightDialogOpen] = useState(false)
  const d=today(), todayGym=gymLogs[d], todayRun=runLogs[d], runPlan=runPlanForDate(d), gymPlan=gymPlanForDate(d)
  const weights=useMemo(()=>Object.values(weightCheckIns).sort((a,b)=>a.measuredDate.localeCompare(b.measuredDate)),[weightCheckIns])
  const weightData=useMemo(()=>weights.length?weights.map(x=>({date:format(parseDate(x.measuredDate),'MMM d'),weight:x.weightKg})): [{date:'Sep 8',weight:profile.startWeightKg}], [weights,profile.startWeightKg])

  const weekStart=startOfWeek(new Date(),{weekStartsOn:1}), weekDates=Array.from({length:7},(_,i)=>format(new Date(weekStart.getTime()+i*86400000),'yyyy-MM-dd'))
  const weekGym=weekDates.filter(x=>gymLogs[x]?.status==='workout').length, weekRuns=weekDates.filter(x=>runLogs[x]?.status==='run').length, weekDistance=weekDates.reduce((s,x)=>s+(runLogs[x]?.distanceKm??0),0)
  const latestWeight=weights.at(-1)?.weightKg ?? profile.currentWeightKg
  const previousWeight=weights.length>1?weights[weights.length-2].weightKg:profile.startWeightKg
  const change=latestWeight-previousWeight
  const lost=Math.max(0,profile.startWeightKg-latestWeight), denom=Math.max(0.1,profile.startWeightKg-profile.targetWeightKg), progress=Math.min(100,Math.max(0,lost/denom*100))
  const activeDays=useMemo(()=>{const days=new Set<string>(); Object.values(gymLogs).forEach(x=>{if(x.date.startsWith(format(activityMonth,'yyyy-MM'))&&x.status==='workout')days.add(x.date)}); Object.values(runLogs).forEach(x=>{if(x.date.startsWith(format(activityMonth,'yyyy-MM'))&&x.status==='run')days.add(x.date)}); return days.size},[gymLogs,runLogs,activityMonth])
  const currentWeek=Math.max(0,Math.min(20,Math.floor(differenceInCalendarDays(parseDate(d),parseDate(weeklyTargets[0].weekEndingDate))/7)+1))
  const target=weeklyTargets.find(x=>x.week===currentWeek) ?? weeklyTargets[0]
  const latest=weights.at(-1)
  return <div className="page-stack home-page viewport-tight">
    <section className="hero-row"><div><p className="eyebrow">Overview · {format(new Date(),'EEEE, MMMM d')}</p><h1>Good morning, {profile.name.split(' ')[0]}.</h1><p className="subtle">Training, running and progress — in one calm view.</p></div><Link to="/daily"><Button variant="outline"><Target size={15}/> Daily check-in</Button></Link></section>
    <div className="dashboard-grid">
      <Card className="today-card"><CardContent><div className="card-kicker">Today</div><div className="today-main"><div><h2>{gymPlan}</h2><p>{runPlan.scheduled ? `Run · ${runPlan.distanceKm} km · ${runPlan.structure}` : 'Recovery / no scheduled run'}</p></div><div className="today-status"><Link to="/gym" className={`today-activity ${activityStatusClass(todayGym?.status)}`}><Dumbbell size={14}/><span>Gym</span><small>{activityStatusLabel(todayGym?.status)}</small></Link><Link to="/run" className={`today-activity ${runStatusClass(todayRun?.status)}`}><Footprints size={14}/><span>Run</span><small>{runStatusLabel(todayRun?.status)}</small></Link></div></div><div className="today-footer"><span>{latest ? `${latest.weightKg.toFixed(1)} kg · weekly check-in` : 'No weekly weight check-in yet'}</span><span className="today-footer-note">Gym & Run cards open their logs</span></div></CardContent></Card>
      <Card className="activity-card"><CardContent><div className="section-top"><div><div className="card-kicker">Activity</div><h3>{activeDays} active {activeDays===1?'day':'days'}</h3></div></div><ActivityHeatmap month={activityMonth} setMonth={setActivityMonth} getState={x=>heatState(gymLogs[x],runLogs[x])}/></CardContent></Card>
      <Card className="progress-card"><CardContent><div className="section-top"><div><div className="card-kicker">Weight progress</div><div className="progress-number">{latestWeight.toFixed(1)}<span> kg</span></div><p>{lost.toFixed(1)} kg lost · {profile.targetWeightKg} kg target</p></div><Button size="sm" variant="outline" onClick={()=>setWeightDialogOpen(true)}><Scale size={14}/> Weekly check-in</Button></div><div className="progress-track"><i style={{width:`${progress}%`}}/></div><div className="progress-meta"><span>Start {profile.startWeightKg} kg</span><span>{progress.toFixed(0)}%</span></div><div className="weight-checkin-meta"><span>{latest ? `Last check-in · ${format(parseDate(latest.measuredDate),'MMM d')}` : 'No check-in yet'}</span><span className={change<0?'weight-down':change>0?'weight-up':''}>{weights.length>1 ? `${change>0?'+':''}${change.toFixed(1)} kg since last` : `Target ${target.targetWeightKg.toFixed(1)} kg`}</span></div></CardContent></Card>
      <Card className="weight-card"><CardContent><div className="section-top"><div><div className="card-kicker">Weight trend</div><h3>{latestWeight.toFixed(1)} kg</h3></div><span className="trend">{weights.length ? `${weights.length} weekly check-in${weights.length===1?'':'s'}` : 'Baseline only'}</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={weightData}><defs><linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-fill)" stopOpacity={0.2}/><stop offset="100%" stopColor="var(--chart-fill)" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="date" hide/><YAxis domain={['dataMin - 1','dataMax + 1']} hide/><Tooltip contentStyle={{background:'var(--surface-strong)',border:'1px solid var(--border)',borderRadius:10,color:'var(--foreground)'}} formatter={(v)=>[`${Number(v).toFixed(1)} kg`,'Weight']}/><Area type="monotone" dataKey="weight" stroke="var(--primary)" fill="url(#weightFill)" strokeWidth={2} dot={{r:2,fill:'var(--primary)'}}/></AreaChart></ResponsiveContainer></div></CardContent></Card>
      <Card className="weekly-card"><CardContent><div className="card-kicker">This week</div><div className="snapshot-grid"><Metric label="Gym" value={String(weekGym)} /><Metric label="Runs" value={String(weekRuns)} /><Metric label="Distance" value={`${weekDistance.toFixed(1)} km`} /><Metric label="Pace" value={formatPace(weekRuns ? weekDates.reduce((s,x)=>s+(runLogs[x]?.durationSeconds??0),0)/Math.max(weekDistance,0.0001):null)} /></div></CardContent></Card>
    </div>
    <WeightCheckinDialog open={weightDialogOpen} onClose={()=>setWeightDialogOpen(false)} currentWeek={currentWeek} initial={latest} onSave={async value=>{await upsertWeightCheckIn(value);setWeightDialogOpen(false);toast.success('Weekly weight saved')}}/>
  </div>
}

function WeightCheckinDialog({open,onClose,currentWeek,initial,onSave}:{open:boolean;onClose:()=>void;currentWeek:number;initial?:WeightCheckIn;onSave:(value:WeightCheckIn)=>Promise<void>}) {
  const availableWeeks=weeklyTargets.filter(x=>x.week<=currentWeek)
  const [week,setWeek]=useState(String(currentWeek)),[measuredDate,setMeasuredDate]=useState(today()),[weight,setWeight]=useState(initial?.weightKg?String(initial.weightKg):''),[notes,setNotes]=useState(initial?.notes??'')
  const target=weeklyTargets.find(x=>x.week===Number(week)) ?? weeklyTargets[0]
  // Each week gets its OWN 7-day window ending on its weekEndingDate — week 0 uses the
  // exact same formula as every other week (no special case), so it correctly spans its
  // own dates instead of collapsing to a single day or bleeding into another week's range.
  const weekStartDate=new Date(new Date(target.weekEndingDate).getTime()-6*86400000)
  const minDate=format(weekStartDate,'yyyy-MM-dd')
  const maxDate=target.weekEndingDate < today() ? target.weekEndingDate : today()
  useEffect(()=>{ if(!open)return; setWeek(String(currentWeek)); setMeasuredDate(today()); setWeight(initial?.weekNumber===currentWeek && initial?.weightKg?String(initial.weightKg):''); setNotes(initial?.notes??'') },[open,currentWeek,initial])
  return <Dialog open={open} onClose={onClose} title="Weekly weight check-in" description="One measurement per week. Missing a day no longer means losing your weight record.">
    <div className="form-stack">
      <label className="field-label">Plan week<select className="native-select" value={week} onChange={e=>setWeek(e.target.value)}>{availableWeeks.slice().reverse().map(x=><option key={x.week} value={x.week}>Week {x.week} · target {x.targetWeightKg.toFixed(1)} kg · {format(parseDate(x.weekEndingDate),'MMM d')}</option>)}</select></label>
      <div className="form-grid"><label className="field-label">Measured on<Input type="date" value={measuredDate} min={minDate} max={maxDate} onChange={e=>setMeasuredDate(e.target.value)}/></label><label className="field-label">Weight (kg)<Input type="number" inputMode="decimal" min="1" max="400" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="e.g. 89.4"/></label></div>
      <div className="weight-target-callout"><span>Target for this week</span><strong>{target.targetWeightKg.toFixed(1)} kg</strong></div>
      <label className="field-label">Notes <Input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional"/></label>
      <div className="dialog-actions"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={!weight || !measuredDate || isFutureDate(measuredDate)} onClick={()=>void onSave({id:`week-${week}`,weekNumber:Number(week),weekEndingDate:target.weekEndingDate,measuredDate,weightKg:Number(weight),targetWeightKg:target.targetWeightKg,notes:notes||undefined,updatedAt:new Date().toISOString(),schemaVersion:1})}>Save check-in</Button></div>
    </div>
  </Dialog>
}
