import { useState } from 'react'
import { Cloud, Database, Moon, Sun, WifiOff, CheckCircle2, AlertTriangle, LogIn, UserCheck, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { useAppStore } from '@/app/store'
import { isFirebaseConfigured } from '@/infrastructure/persistence/firebase/client'
import { toast } from 'sonner'

function GoogleIcon() {
  return <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
}


export function SettingsPage(){
  const {profile,setProfile,theme,setTheme,sync,authUser,authLoading,signInWithGoogle,addWorkoutType,renameWorkoutType,deleteWorkoutType}=useAppStore()
  const [name,setName]=useState(profile.name)
  const [target,setTarget]=useState(String(profile.targetWeightKg))
  const save=async()=>{await setProfile({...profile,name:name.trim()||profile.name,targetWeightKg:Number(target)||profile.targetWeightKg});toast.success('Settings saved')}
  const online=typeof navigator==='undefined'||navigator.onLine

  return <div className="page-stack long-page">
    <section className="page-heading"><div><p className="eyebrow">System</p><h1>Settings</h1><p className="subtle">Your preferences and storage state stay separate from activity history.</p></div></section>

    <Card><CardContent>
      <div className="card-kicker">Profile & target</div>
      <div className="form-grid settings-grid"><label className="field-label">Name<Input value={name} onChange={e=>setName(e.target.value)}/></label><label className="field-label">Target weight (kg)<Input type="number" min="1" value={target} onChange={e=>setTarget(e.target.value)}/></label></div>
      <Button onClick={save}>Save settings</Button>
    </CardContent></Card>

    <WorkoutTypesCard workoutTypes={profile.workoutTypes} onAdd={addWorkoutType} onRename={renameWorkoutType} onDelete={deleteWorkoutType}/>

    <Card><CardContent><div className="card-kicker">Appearance</div><div className="appearance-row"><button className={theme==='system'?'selected':''} onClick={()=>setTheme('system')}><Moon size={16}/> System</button><button className={theme==='light'?'selected':''} onClick={()=>setTheme('light')}><Sun size={16}/> Light</button><button className={theme==='dark'?'selected':''} onClick={()=>setTheme('dark')}><Moon size={16}/> Dark</button></div></CardContent></Card>

    <div className="two-col">
      <Card><CardContent><Database size={18}/><h3>Local storage</h3><p>Validated writes are committed to IndexedDB first. Activity remains available offline and sync work is queued locally.</p><div className="system-status"><CheckCircle2 size={14}/><span>{sync.pending} pending · {sync.failed} failed</span></div></CardContent></Card>
      <Card><CardContent>{online?<Cloud size={18}/>:<WifiOff size={18}/>}<h3>Cloud sync</h3><p>{isFirebaseConfigured()?'Firebase is configured. Sync runs in the background when a connection is available.':'Firebase is not configured yet. The app remains fully usable locally.'}</p><div className={`system-status ${sync.failed?'warning':''}`}>{sync.failed?<AlertTriangle size={14}/>:<CheckCircle2 size={14}/>}<span>{sync.lastError|| (sync.lastSyncedAt?`Last sync ${new Date(sync.lastSyncedAt).toLocaleString()}`:'No cloud sync yet')}</span></div></CardContent></Card>
    </div>

    <Card><CardContent>
      {authUser && !authUser.isAnonymous ? <UserCheck size={18}/> : <LogIn size={18}/>}
      <h3>Account</h3>
      {authUser && !authUser.isAnonymous
        ? <>
            <p>Signed in as <strong>{authUser.email ?? authUser.displayName ?? 'your Google account'}</strong>. Your data is tied to this account, not just this device.</p>
            <div className="system-status"><CheckCircle2 size={14}/><span>Linked to Google</span></div>
          </>
        : <>
            <p>Right now your data only lives on this device. Sign in with Google to keep it — and access it from anywhere — even if you clear your browser or switch phones.</p>
            <Button variant="outline" onClick={async()=>{try{await signInWithGoogle();toast.success('Signed in with Google')}catch(err){toast.error(err instanceof Error?err.message:'Sign-in failed')}}} disabled={authLoading || !isFirebaseConfigured()}>
              <GoogleIcon/> {authLoading ? 'Signing in…' : 'Sign in with Google'}
            </Button>
          </>
      }
    </CardContent></Card>
  </div>
}

function WorkoutTypesCard({ workoutTypes, onAdd, onRename, onDelete }: {
  workoutTypes: { id: string; label: string }[]
  onAdd: (label: string) => Promise<void>
  onRename: (id: string, label: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [newLabel, setNewLabel] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleAdd() {
    if (!newLabel.trim()) return
    setBusy(true)
    try { await onAdd(newLabel); setNewLabel(''); toast.success('Workout type added') } finally { setBusy(false) }
  }
  function startEdit(t: { id: string; label: string }) { setEditingId(t.id); setEditValue(t.label) }
  async function commitEdit() {
    if (!editingId || !editValue.trim()) { setEditingId(null); return }
    setBusy(true)
    try { await onRename(editingId, editValue); toast.success('Renamed') } finally { setBusy(false); setEditingId(null) }
  }
  async function confirmDelete() {
    if (!pendingDelete) return
    setBusy(true)
    try { await onDelete(pendingDelete.id); toast.success('Deleted') } finally { setBusy(false); setPendingDelete(null) }
  }

  return <Card><CardContent>
    <div className="card-kicker">Workout types</div>
    <p className="subtle" style={{ marginBottom: 12 }}>These show up as Focus options when logging a gym session. Add, rename, or remove them here — the Gym tab just reflects this list.</p>
    <div className="workout-type-list">
      {workoutTypes.map(t => <div className="workout-type-row" key={t.id}>
        {editingId === t.id
          ? <>
              <Input value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus onKeyDown={e => { if (e.key === 'Enter') void commitEdit(); if (e.key === 'Escape') setEditingId(null) }}/>
              <button className="icon-btn" onClick={commitEdit} aria-label="Save" disabled={busy}><Check size={15}/></button>
              <button className="icon-btn" onClick={() => setEditingId(null)} aria-label="Cancel"><X size={15}/></button>
            </>
          : <>
              <span className="workout-type-label">{t.label}</span>
              <button className="icon-btn" onClick={() => startEdit(t)} aria-label={`Rename ${t.label}`}><Pencil size={14}/></button>
              <button className="icon-btn icon-btn-danger" onClick={() => setPendingDelete(t)} aria-label={`Delete ${t.label}`}><Trash2 size={14}/></button>
            </>
        }
      </div>)}
    </div>
    <div className="workout-type-add">
      <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g. Abs" onKeyDown={e => { if (e.key === 'Enter') void handleAdd() }}/>
      <Button variant="outline" onClick={handleAdd} disabled={busy || !newLabel.trim()}><Plus size={15}/> Add</Button>
    </div>

    <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} title={`Delete "${pendingDelete?.label}"?`} description="Past logs that used this type will keep working, but will show as a plain id instead of this name. This can't be undone.">
      <div className="dialog-actions"><Button variant="ghost" onClick={() => setPendingDelete(null)}>Cancel</Button><Button variant="outline" onClick={confirmDelete} disabled={busy}>Delete</Button></div>
    </Dialog>
  </CardContent></Card>
}
