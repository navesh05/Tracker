import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Plus, Scale } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { Metric } from '@/components/data-display/metric'
import { useAppStore } from '@/app/store'
import { today, parseDate, isFutureDate } from '@/core/utils/date'
import type { WeightCheckIn } from '@/core/domain/types'
import { toast } from 'sonner'

export function WeightPage() {
  const { profile, weightCheckIns, upsertWeightCheckIn } = useAppStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<WeightCheckIn | undefined>(undefined)

  const weights = useMemo(() => Object.values(weightCheckIns).sort((a,b) => a.measuredDate.localeCompare(b.measuredDate)), [weightCheckIns])
  const chartData = useMemo(() => weights.length ? weights.map(x => ({ date: format(parseDate(x.measuredDate),'MMM d'), weight: x.weightKg })) : [{ date: 'Start', weight: profile.startWeightKg }], [weights, profile.startWeightKg])
  const latest = weights.at(-1)
  const latestWeight = latest?.weightKg ?? profile.currentWeightKg
  const lost = Math.max(0, profile.startWeightKg - latestWeight)
  const denom = Math.max(0.1, profile.startWeightKg - profile.targetWeightKg)
  const progress = Math.min(100, Math.max(0, lost/denom*100))
  const change = weights.length > 1 ? weights.at(-1)!.weightKg - weights.at(-2)!.weightKg : 0

  function openAdd() { setEditing(undefined); setDialogOpen(true) }
  function openEdit(entry: WeightCheckIn) { setEditing(entry); setDialogOpen(true) }

  return <div className="page-stack long-page">
    <section className="page-heading">
      <div><p className="eyebrow">Weight</p><h1>Weigh-ins</h1><p className="subtle">Log any date, anytime. No fixed weekly schedule.</p></div>
      <Button onClick={openAdd}><Plus size={15}/> Add entry</Button>
    </section>

    <div className="metric-grid">
      <Metric label="Current" value={`${latestWeight.toFixed(1)} kg`} icon={Scale}/>
      <Metric label="Lost" value={`${lost.toFixed(1)} kg`} />
      <Metric label="Target" value={`${profile.targetWeightKg} kg`} />
      <Metric label="Since last" value={weights.length>1 ? `${change>0?'+':''}${change.toFixed(1)} kg` : '—'} />
    </div>

    <Card><CardContent>
      <div className="section-top"><div><div className="card-kicker">Progress</div><h3>{progress.toFixed(0)}% to target</h3></div></div>
      <div className="progress-track"><i style={{ width:`${progress}%` }}/></div>
      <div className="progress-meta"><span>Start {profile.startWeightKg} kg</span><span>Target {profile.targetWeightKg} kg</span></div>
    </CardContent></Card>

    <Card><CardContent>
      <div className="card-kicker">Trend</div>
      <div className="chart chart-tall"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="weightFillFull" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-fill)" stopOpacity={0.25}/><stop offset="100%" stopColor="var(--chart-fill)" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="date" tick={{fontSize:11,fill:'var(--muted)'}}/><YAxis domain={['dataMin - 1','dataMax + 1']} tick={{fontSize:11,fill:'var(--muted)'}} width={36}/><Tooltip contentStyle={{background:'var(--surface-strong)',border:'1px solid var(--border)',borderRadius:10,color:'var(--foreground)'}} formatter={(v)=>[`${Number(v).toFixed(1)} kg`,'Weight']}/><Area type="monotone" dataKey="weight" stroke="var(--primary)" fill="url(#weightFillFull)" strokeWidth={2} dot={{r:3,fill:'var(--primary)'}}/></AreaChart></ResponsiveContainer></div>
    </CardContent></Card>

    <Card><CardContent>
      <div className="card-kicker">All entries</div>
      {weights.length ? <div className="weight-entry-list">
        {weights.slice().reverse().map(entry => <button key={entry.id} className="weight-entry-row" onClick={() => openEdit(entry)}>
          <span className="weight-entry-date">{format(parseDate(entry.measuredDate),'EEE, MMM d yyyy')}</span>
          <span className="weight-entry-weight">{entry.weightKg.toFixed(1)} kg</span>
          {entry.notes && <span className="weight-entry-notes">{entry.notes}</span>}
        </button>)}
      </div> : <p className="subtle">No entries yet — tap "Add entry" to log your first weigh-in.</p>}
    </CardContent></Card>

    <WeightDialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      initial={editing}
      onSave={async value => { await upsertWeightCheckIn(value); setDialogOpen(false); toast.success('Weight saved') }}
    />
  </div>
}

function WeightDialog({ open, onClose, initial, onSave }: { open: boolean; onClose: () => void; initial?: WeightCheckIn; onSave: (value: WeightCheckIn) => Promise<void> }) {
  const [measuredDate, setMeasuredDate] = useState(initial?.measuredDate ?? today())
  const [weight, setWeight] = useState(initial ? String(initial.weightKg) : '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  return <Dialog open={open} onClose={onClose} title={initial ? 'Edit weigh-in' : 'Add weigh-in'} description="Any date, past or today. No weekly schedule to follow.">
    <div className="form-stack">
      <div className="form-grid">
        <label className="field-label">Date<Input type="date" value={measuredDate} max={today()} onChange={e => setMeasuredDate(e.target.value)}/></label>
        <label className="field-label">Weight (kg)<Input type="number" inputMode="decimal" min="1" max="400" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 89.4"/></label>
      </div>
      <label className="field-label">Notes <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional"/></label>
      <div className="dialog-actions">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          disabled={!weight || !measuredDate || isFutureDate(measuredDate)}
          onClick={() => void onSave({
            id: initial?.id ?? measuredDate,
            measuredDate, weightKg: Number(weight), notes: notes || undefined,
            updatedAt: new Date().toISOString(), schemaVersion: 1,
          })}
        >Save</Button>
      </div>
    </div>
  </Dialog>
}
