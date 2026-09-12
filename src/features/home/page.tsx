import { useMemo, useState } from 'react'
import { format, startOfWeek } from 'date-fns'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Dumbbell, Footprints, Scale } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Metric } from '@/components/data-display/metric'
import { ActivityHeatmap } from '@/components/data-display/activity-heatmap'
import { useAppStore } from '@/app/store'
import { heatState } from '@/core/utils/activity'
import { today, parseDate } from '@/core/utils/date'
import { formatPace } from '@/lib/utils'

function activityStatusClass(status?: string) { return status === 'workout' ? 'status-done' : status === 'rest' ? 'status-rest' : status === 'no' ? 'status-no' : 'status-neutral' }
function activityStatusLabel(status?: string) { return status === 'workout' ? 'Done' : status === 'rest' ? 'Rest' : status === 'no' ? 'Missed' : 'Log' }
function runStatusClass(status?: string) { return status === 'run' ? 'status-done' : status === 'rest' ? 'status-rest' : status === 'no' ? 'status-no' : 'status-neutral' }
function runStatusLabel(status?: string) { return status === 'run' ? 'Done' : status === 'rest' ? 'Rest' : status === 'no' ? 'Missed' : 'Log' }

export function HomePage() {
  const { profile, gymLogs, runLogs, weightCheckIns } = useAppStore()
  const [activityMonth, setActivityMonth] = useState(new Date())
  const d = today(), todayGym = gymLogs[d], todayRun = runLogs[d]
  const weights = useMemo(() => Object.values(weightCheckIns).sort((a,b) => a.measuredDate.localeCompare(b.measuredDate)), [weightCheckIns])
  const weightData = useMemo(() => weights.length ? weights.map(x => ({ date: format(parseDate(x.measuredDate),'MMM d'), weight: x.weightKg })) : [{ date: 'Start', weight: profile.startWeightKg }], [weights, profile.startWeightKg])

  const weekStart = startOfWeek(new Date(),{ weekStartsOn: 1 }), weekDates = Array.from({ length: 7 }, (_,i) => format(new Date(weekStart.getTime()+i*86400000),'yyyy-MM-dd'))
  const weekGym = weekDates.filter(x => gymLogs[x]?.status === 'workout').length, weekRuns = weekDates.filter(x => runLogs[x]?.status === 'run').length, weekDistance = weekDates.reduce((s,x) => s+(runLogs[x]?.distanceKm ?? 0), 0)
  const latestWeight = weights.at(-1)?.weightKg ?? profile.currentWeightKg
  const lost = Math.max(0, profile.startWeightKg - latestWeight), denom = Math.max(0.1, profile.startWeightKg - profile.targetWeightKg), progress = Math.min(100, Math.max(0, lost/denom*100))
  const activeDays = useMemo(() => {
    const days = new Set<string>()
    Object.values(gymLogs).forEach(x => { if (x.date.startsWith(format(activityMonth,'yyyy-MM')) && x.status === 'workout') days.add(x.date) })
    Object.values(runLogs).forEach(x => { if (x.date.startsWith(format(activityMonth,'yyyy-MM')) && x.status === 'run') days.add(x.date) })
    return days.size
  }, [gymLogs, runLogs, activityMonth])
  const latest = weights.at(-1)

  return <div className="page-stack home-page viewport-tight">
    <section className="hero-row"><div><p className="eyebrow">Overview · {format(new Date(),'EEEE, MMMM d')}</p><h1>Good morning, {profile.name.split(' ')[0]}.</h1><p className="subtle">Training, running and progress — in one calm view.</p></div></section>
    <div className="dashboard-grid">
      <Card className="today-card"><CardContent>
        <div className="card-kicker">Today</div>
        <div className="today-main">
          <div><h2>{format(new Date(d), 'EEEE')}</h2><p>Log today's session below.</p></div>
          <div className="today-status">
            <Link to="/gym" className={`today-activity ${activityStatusClass(todayGym?.status)}`}><Dumbbell size={14}/><span>Gym</span><small>{activityStatusLabel(todayGym?.status)}</small></Link>
            <Link to="/run" className={`today-activity ${runStatusClass(todayRun?.status)}`}><Footprints size={14}/><span>Run</span><small>{runStatusLabel(todayRun?.status)}</small></Link>
          </div>
        </div>
        <div className="today-footer"><span>{latest ? `${latest.weightKg.toFixed(1)} kg · last weigh-in` : 'No weight logged yet'}</span><span className="today-footer-note">Gym & Run cards open their logs</span></div>
      </CardContent></Card>

      <Card className="progress-card"><CardContent>
        <div className="section-top">
          <div><div className="card-kicker">Weight progress</div><div className="progress-number">{latestWeight.toFixed(1)}<span> kg</span></div><p>{lost.toFixed(1)} kg lost · {profile.targetWeightKg} kg target</p></div>
          <Link to="/weight"><Button size="sm" variant="outline"><Scale size={14}/> View weight</Button></Link>
        </div>
        <div className="progress-track"><i style={{ width:`${progress}%` }}/></div>
        <div className="progress-meta"><span>Start {profile.startWeightKg} kg</span><span>{progress.toFixed(0)}%</span></div>
      </CardContent></Card>

      <Card className="activity-card"><CardContent><div className="section-top"><div><div className="card-kicker">Activity</div><h3>{activeDays} active {activeDays===1?'day':'days'}</h3></div></div><ActivityHeatmap month={activityMonth} setMonth={setActivityMonth} getState={x=>heatState(gymLogs[x],runLogs[x])}/></CardContent></Card>

      <Card className="weight-card"><CardContent>
        <div className="section-top"><div><div className="card-kicker">Weight trend</div><h3>{latestWeight.toFixed(1)} kg</h3></div><span className="trend">{weights.length ? `${weights.length} entr${weights.length===1?'y':'ies'}` : 'No entries yet'}</span></div>
        <div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={weightData}><defs><linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-fill)" stopOpacity={0.2}/><stop offset="100%" stopColor="var(--chart-fill)" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="date" hide/><YAxis domain={['dataMin - 1','dataMax + 1']} hide/><Tooltip contentStyle={{background:'var(--surface-strong)',border:'1px solid var(--border)',borderRadius:10,color:'var(--foreground)'}} formatter={(v)=>[`${Number(v).toFixed(1)} kg`,'Weight']}/><Area type="monotone" dataKey="weight" stroke="var(--primary)" fill="url(#weightFill)" strokeWidth={2} dot={{r:2,fill:'var(--primary)'}}/></AreaChart></ResponsiveContainer></div>
      </CardContent></Card>

      <Card className="weekly-card"><CardContent><div className="card-kicker">This week</div><div className="snapshot-grid"><Metric label="Gym" value={String(weekGym)} /><Metric label="Runs" value={String(weekRuns)} /><Metric label="Distance" value={`${weekDistance.toFixed(1)} km`} /><Metric label="Pace" value={formatPace(weekRuns ? weekDates.reduce((s,x)=>s+(runLogs[x]?.durationSeconds??0),0)/Math.max(weekDistance,0.0001):null)} /></div></CardContent></Card>
    </div>
  </div>
}
