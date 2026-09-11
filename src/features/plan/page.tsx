import { CheckCircle2, Lightbulb, ShieldCheck, Table2 } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { useAppStore } from '@/app/store'
import { today, parseDate } from '@/core/utils/date'
import { differenceInCalendarDays } from 'date-fns'
import { gymPlanForDate } from '@/features/gym/plan'
import { runPlanForDate } from '@/features/run/plan'
import { trainingExercises, runningWeeks, nutritionItems, trainingMenu, restMenu, phaseTargets, weeklyTargets, planRules } from './data'
import { toast } from 'sonner'
import type { UserProfile } from '@/core/domain/types'

export function PlanPage(){
  const {profile,setProfile,gymLogs,runLogs,dailyLogs}=useAppStore()
  const d=today(), week=Math.max(1,Math.min(20,Math.floor(differenceInCalendarDays(parseDate(d),parseDate(weeklyTargets[0].weekEndingDate))/7)+1)), gym=gymLogs[d],run=runLogs[d],daily=dailyLogs[d],rp=runPlanForDate(d)
  const [tablesOpen,setTablesOpen]=useState(false)
  const suggestions=[
    gym?.status==='no'?'Keep the next session simple: show up, log the workout, and avoid trying to compensate with extra volume.':null,
    rp.scheduled&&!run?'A run is planned today. Keep the planned distance and reduce intensity if energy is low.':null,
    daily?.proteinG!==undefined&&daily.proteinG<profile.proteinTargetG?'Protein is below your target today; prioritize a lean protein serving at the next meal.':null,
  ].filter(Boolean) as string[]
  return <div className="page-stack long-page">
    <section className="page-heading"><div><p className="eyebrow">Guidance</p><h1>Suggestions & plan</h1><p className="subtle">Your workbook plan is structured here as reusable data, not raw text.</p></div><Button onClick={()=>setTablesOpen(true)}><Table2 size={15}/> View plan tables</Button></section>
    <TargetsCard profile={profile} setProfile={setProfile}/>
    <div className="plan-grid">
      <Card><CardContent><div className="section-icon"><ShieldCheck size={17}/></div><div className="card-kicker">Today’s plan</div><h2>{gymPlanForDate(d)}</h2><p>{rp.scheduled?`${rp.distanceKm} km · ${rp.structure}`:'Recovery / no scheduled run'}</p><div className="plan-mini"><span>Phase</span><strong>{week <= 4 ? '1 — Foundation' : week <= 12 ? '2 — Build' : '3 — Push'}</strong></div></CardContent></Card>
      <Card><CardContent><div className="section-icon"><Lightbulb size={17}/></div><div className="card-kicker">Suggestions</div>{suggestions.length?<ul className="suggestion-list">{suggestions.map(s=><li key={s}><CheckCircle2 size={15}/><span>{s}</span></li>)}</ul>:<p>Nothing needs attention today. Stay consistent.</p>}</CardContent></Card>
    </div>
    <Card><CardContent><div className="card-kicker">Plan rules</div><div className="rule-list">{planRules.map((rule,i)=><div key={rule}><span>{String(i+1).padStart(2,'0')}</span><p>{rule}</p></div>)}</div></CardContent></Card>
    <PlanTablesDialog open={tablesOpen} onClose={()=>setTablesOpen(false)}/>
  </div>
}

function TargetsCard({profile,setProfile}:{profile:UserProfile;setProfile:(p:UserProfile)=>Promise<void>}){
  const [targetWeight,setTargetWeight]=useState(String(profile.targetWeightKg))
  const [calorieTarget,setCalorieTarget]=useState(String(profile.calorieTarget))
  const [proteinTarget,setProteinTarget]=useState(String(profile.proteinTargetG))
  const [sleepTarget,setSleepTarget]=useState(String(profile.sleepTargetHours))
  const [stepsTarget,setStepsTarget]=useState(String(profile.stepsTarget))
  const [waterTarget,setWaterTarget]=useState(String(profile.waterTargetLiters))
  const save=async()=>{
    await setProfile({...profile,
      targetWeightKg:Number(targetWeight)||profile.targetWeightKg,
      calorieTarget:Number(calorieTarget)||profile.calorieTarget,
      proteinTargetG:Number(proteinTarget)||profile.proteinTargetG,
      sleepTargetHours:Number(sleepTarget)||profile.sleepTargetHours,
      stepsTarget:Number(stepsTarget)||profile.stepsTarget,
      waterTargetLiters:Number(waterTarget)||profile.waterTargetLiters,
    })
    toast.success('Targets updated')
  }
  const fields:[string,string,(v:string)=>void][] = [
    ['Target weight (kg)',targetWeight,setTargetWeight],
    ['Calorie target',calorieTarget,setCalorieTarget],
    ['Protein target (g)',proteinTarget,setProteinTarget],
    ['Sleep target (hours)',sleepTarget,setSleepTarget],
    ['Steps target',stepsTarget,setStepsTarget],
    ['Water target (L)',waterTarget,setWaterTarget],
  ]
  return <Card><CardContent>
    <div className="section-top"><div><div className="card-kicker">Your targets</div><h3>Review & adjust anytime</h3></div></div>
    <div className="form-grid targets-grid">
      {fields.map(([label,value,setter])=><label className="field-label" key={label}>{label}<Input type="number" min="0" step="any" value={value} onChange={e=>setter(e.target.value)}/></label>)}
    </div>
    <div className="dialog-actions targets-actions"><Button onClick={save}>Save targets</Button></div>
  </CardContent></Card>
}

function PlanTablesDialog({open,onClose}:{open:boolean;onClose:()=>void}){
  const [tab,setTab]=useState<'training'|'running'|'nutrition'|'targets'>('training')
  return <Dialog open={open} onClose={onClose} title="Your plan tables" description="Structured from the fitness transformation workbook. Logs remain separate from the plan.">
    <div className="plan-tabs">{[['training','Training'],['running','Running'],['nutrition','Nutrition'],['targets','Targets']].map(([v,l])=><button className={tab===v?'active':''} key={v} onClick={()=>setTab(v as typeof tab)}>{l}</button>)}</div>
    <div className="table-scroll">
      {tab==='training'&&<table className="plan-table"><thead><tr><th>Day</th><th>Schedule</th><th>Focus</th><th>Exercise</th><th>Working set</th><th>Reps</th><th>Sets</th></tr></thead><tbody>{trainingExercises.map((x,i)=>{const isNewDay=i===0||trainingExercises[i-1].day!==x.day;const rowSpan=trainingExercises.filter(y=>y.day===x.day).length;return <tr key={i} className={isNewDay?'day-group-start':''}>{isNewDay&&<td rowSpan={rowSpan}>{x.day}</td>}{isNewDay&&<td rowSpan={rowSpan}>{x.schedule}<br/><small>{x.planPeriod}</small></td>}{isNewDay&&<td rowSpan={rowSpan}>{x.focus}</td>}<td>{x.exercise}<br/><small>{x.progression}</small></td><td>{x.workingSet}</td><td>{x.targetReps}</td><td>{x.sets}</td></tr>})}</tbody></table>}
      {tab==='running'&&<table className="plan-table"><thead><tr><th>Week</th><th>Days</th><th>Structure</th><th>Distance</th><th>Range</th></tr></thead><tbody>{runningWeeks.map(x=><tr key={x.week}><td>{x.week}</td><td>{x.daysPerWeek}<br/><small>{x.runDays}</small></td><td>{x.structure}<br/>{x.notes&&<small>{x.notes}</small>}</td><td>{x.targetDistance}</td><td>{x.dateRange}</td></tr>)}</tbody></table>}
      {tab==='nutrition'&&<div className="nutrition-plan"><div className="nutrition-section"><div className="nutrition-section-head"><div><h3>Food reference</h3><p>Everyday foods from the workbook with the serving used for planning.</p></div><span>{nutritionItems.length} items</span></div><div className="nutrition-grid">{nutritionItems.map(x=><div className="nutrition-item" key={x.food}><strong>{x.food}</strong><small>{x.unit}</small><div><span>{x.proteinG}g protein</span><span>{x.calories} kcal</span></div></div>)}</div></div><div className="nutrition-section"><div className="nutrition-section-head"><div><h3>Training day menu</h3><p>Example day aligned to the active training phase.</p></div><span>{trainingMenu.reduce((s,x)=>s+x.proteinG,0).toFixed(1)}g protein</span></div><MenuTable rows={trainingMenu}/></div><div className="nutrition-section"><div className="nutrition-section-head"><div><h3>Rest day menu</h3><p>Example lower-intake recovery day.</p></div><span>{restMenu.reduce((s,x)=>s+x.proteinG,0).toFixed(1)}g protein</span></div><MenuTable rows={restMenu}/></div></div>}
      {tab==='targets'&&<div className="table-stack"><div><h3>Phase targets</h3><table className="plan-table"><thead><tr><th>Phase</th><th>Dates</th><th>Target kcal</th><th>Protein</th><th>Start wt</th></tr></thead><tbody>{phaseTargets.map(x=><tr key={x.phase}><td>{x.phase}<br/><small>{x.weeks}</small></td><td>{x.dateRange}</td><td>{Math.round(x.targetIntake)}</td><td>{x.proteinTargetG}g</td><td>{x.startWeightKg}kg</td></tr>)}</tbody></table></div><div><h3>Weekly weight targets</h3><table className="plan-table"><thead><tr><th>Week</th><th>Week ending</th><th>Target</th><th>Loss</th></tr></thead><tbody>{weeklyTargets.map(x=><tr key={x.week}><td>{x.week}</td><td>{x.weekEndingDate}</td><td>{x.targetWeightKg.toFixed(1)}kg</td><td>{x.weeklyLossKg ? `${x.weeklyLossKg.toFixed(2)}kg` : 'Baseline'}</td></tr>)}</tbody></table></div></div>}
    </div>
  </Dialog>
}
function MenuTable({rows}:{rows:typeof trainingMenu}){
  const totalProtein=rows.reduce((s,x)=>s+x.proteinG,0)
  const totalCalories=rows.reduce((s,x)=>s+x.calories,0)
  return <table className="plan-table"><thead><tr><th>Meal</th><th>Food</th><th>Qty</th><th>Protein</th><th>kcal</th></tr></thead><tbody>{rows.map((x,i)=><tr key={i}><td>{x.meal}</td><td>{x.food}</td><td>{x.qty}</td><td>{x.proteinG}</td><td>{x.calories}</td></tr>)}<tr className="total-row"><td colSpan={3}>Total</td><td>{totalProtein.toFixed(1)}g</td><td>{totalCalories}</td></tr></tbody></table>
}
