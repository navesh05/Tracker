import { useMemo, useState } from 'react'
import { format, subDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/app/store'
import { today, parseDate } from '@/core/utils/date'
import { toast } from 'sonner'

export function DailyPage(){
  const { dailyLogs, profile, upsertDaily } = useAppStore()
  const date = today(), log = dailyLogs[date]
  const [calories,setCalories]=useState(log?.calories ? String(log.calories) : '')
  const [protein,setProtein]=useState(log?.proteinG ? String(log.proteinG) : '')
  const [sleep,setSleep]=useState(log?.sleepHours ? String(log.sleepHours) : '')
  const [steps,setSteps]=useState(log?.steps ? String(log.steps) : '')
  const [water,setWater]=useState(log?.waterLiters ? String(log.waterLiters) : '')
  const fields = [
    ['Calories',calories,setCalories,profile.calorieTarget], ['Protein (g)',protein,setProtein,profile.proteinTargetG],
    ['Sleep (hours)',sleep,setSleep,profile.sleepTargetHours], ['Steps',steps,setSteps,profile.stepsTarget], ['Water (L)',water,setWater,profile.waterTargetLiters],
  ] as const
  const save=async()=>{
    await upsertDaily({date,calories:Number(calories)||undefined,proteinG:Number(protein)||undefined,sleepHours:Number(sleep)||undefined,steps:Number(steps)||undefined,waterLiters:Number(water)||undefined,updatedAt:new Date().toISOString(),schemaVersion:1})
    toast.success('Daily check-in saved')
  }
  const recent = useMemo(()=>{
    const days = Array.from({length:7},(_,i)=>format(subDays(new Date(),i),'yyyy-MM-dd'))
    return days.map(d=>({date:d, entry:dailyLogs[d]})).filter(x=>x.entry)
  },[dailyLogs])
  return <div className="page-stack long-page">
    <section className="page-heading"><div><p className="eyebrow">Daily Tracker · {format(new Date(),'MMM d')}</p><h1>Daily check-in</h1><p className="subtle">Nutrition, recovery and habits. Weight is tracked separately once a week.</p></div><Button onClick={save}>Save check-in</Button></section>
    <Card><CardContent className="form-grid daily-grid">{fields.map(([label,value,setter,target])=><label className="field-label" key={label}>{label}{target?<span className="field-target"> · target {target}</span>:null}<Input value={value} onChange={e=>setter(e.target.value)} type="number" min="0" step="any"/></label>)}</CardContent></Card>
    <Card><CardContent>
      <div className="card-kicker">Last 7 days</div>
      {recent.length ? <table className="plan-table daily-history"><thead><tr><th>Date</th><th>Calories</th><th>Protein</th><th>Sleep</th><th>Steps</th><th>Water</th></tr></thead><tbody>
        {recent.map(({date:d,entry})=><tr key={d}><td>{format(parseDate(d),'EEE, MMM d')}</td><td>{entry!.calories ?? '—'}</td><td>{entry!.proteinG ?? '—'}g</td><td>{entry!.sleepHours ?? '—'}h</td><td>{entry!.steps ?? '—'}</td><td>{entry!.waterLiters ?? '—'}L</td></tr>)}
      </tbody></table> : <p className="subtle">No check-ins logged yet this week — saved entries will show up here.</p>}
    </CardContent></Card>
  </div>
}
