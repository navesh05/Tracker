import { Activity, Dumbbell, Footprints, Scale, Flame, Moon, Footprints as Steps } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Metric } from '@/components/data-display/metric'
import { useAppStore } from '@/app/store'
import { averagePaceSeconds } from '@/core/utils/activity'
import { formatPace } from '@/lib/utils'

function average(values: number[]) { return values.length ? values.reduce((s,x)=>s+x,0)/values.length : 0 }

export function AnalyticsPage(){
  const {gymLogs,runLogs,weightCheckIns,dailyLogs,profile}=useAppStore()
  const gym=Object.values(gymLogs),runs=Object.values(runLogs).filter(x=>x.status==='run'),distance=runs.reduce((s,x)=>s+(x.distanceKm??0),0)
  const weights=Object.values(weightCheckIns).sort((a,b)=>a.measuredDate.localeCompare(b.measuredDate)),current=weights.at(-1)?.weightKg??profile.currentWeightKg
  const daily=Object.values(dailyLogs)
  const avgCalories=average(daily.map(x=>x.calories).filter((x):x is number=>x!==undefined))
  const avgProtein=average(daily.map(x=>x.proteinG).filter((x):x is number=>x!==undefined))
  const avgSleep=average(daily.map(x=>x.sleepHours).filter((x):x is number=>x!==undefined))
  const avgSteps=average(daily.map(x=>x.steps).filter((x):x is number=>x!==undefined))
  const avgWater=average(daily.map(x=>x.waterLiters).filter((x):x is number=>x!==undefined))
  return <div className="page-stack long-page">
    <section className="page-heading"><div><p className="eyebrow">Insights</p><h1>Analytics</h1><p className="subtle">Useful trends without turning fitness into a scoreboard.</p></div></section>
    <div className="metric-grid"><Metric label="Gym workouts" value={String(gym.filter(x=>x.status==='workout').length)} icon={Dumbbell}/><Metric label="Runs" value={String(runs.length)} icon={Footprints}/><Metric label="Distance" value={`${distance.toFixed(1)} km`} icon={Activity}/><Metric label="Weight" value={`${current.toFixed(1)} kg`} icon={Scale}/></div>
    <div className="two-col"><Card><CardContent><div className="card-kicker">Running</div><div className="analytics-big">{formatPace(averagePaceSeconds(runs))}</div><p className="subtle">Average pace across logged runs.</p></CardContent></Card><Card><CardContent><div className="card-kicker">Weight</div><div className="analytics-big">{current.toFixed(1)} kg</div><p className="subtle">{weights.length} weekly check-ins · target {profile.targetWeightKg} kg.</p></CardContent></Card></div>
    <Card><CardContent>
      <div className="card-kicker">Nutrition & recovery</div>
      <p className="subtle" style={{marginBottom:14}}>{daily.length ? `Averages across ${daily.length} logged day${daily.length===1?'':'s'}.` : 'No daily check-ins logged yet — this fills in as you log them.'}</p>
      {daily.length>0 && <div className="metric-grid">
        <Metric label="Avg calories" value={avgCalories?`${Math.round(avgCalories)}`:'—'} icon={Flame}/>
        <Metric label="Avg protein" value={avgProtein?`${avgProtein.toFixed(0)}g`:'—'} icon={Activity}/>
        <Metric label="Avg sleep" value={avgSleep?`${avgSleep.toFixed(1)}h`:'—'} icon={Moon}/>
        <Metric label="Avg steps" value={avgSteps?`${Math.round(avgSteps)}`:'—'} icon={Steps}/>
      </div>}
      {daily.length>0 && <div className="weight-checkin-meta" style={{marginTop:16}}>
        <span>Calorie target {profile.calorieTarget} · protein target {profile.proteinTargetG}g</span>
        <span>Avg water {avgWater?`${avgWater.toFixed(1)}L`:'—'} · target {profile.waterTargetLiters}L</span>
      </div>}
    </CardContent></Card>
  </div>
}
