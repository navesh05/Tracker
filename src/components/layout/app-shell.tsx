import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Scale, Cloud, Check, Dumbbell, Footprints, Home, Menu, Moon, Settings, Sun, X, WifiOff, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/app/store'
import { Button } from '@/components/ui/button'

const groups = [
  { label: 'Overview', links: [{ to: '/', label: 'Home', icon: Home }] },
  { label: 'Track', links: [{ to: '/gym', label: 'Gym', icon: Dumbbell }, { to: '/run', label: 'Run', icon: Footprints }, { to: '/weight', label: 'Weight', icon: Scale }] },
]
export function AppShell() {
  const [open, setOpen] = useState(false); const location = useLocation(); const { theme, setTheme, saving, sync } = useAppStore()
  useEffect(() => setOpen(false), [location.pathname])
  const online = typeof navigator === 'undefined' ? true : navigator.onLine
  const syncLabel = saving ? 'Saving' : !online ? 'Offline' : sync.failed ? 'Sync needs attention' : sync.pending ? 'Sync pending' : sync.lastSyncedAt ? 'Synced' : 'Saved locally'
  const syncIcon = !online ? <WifiOff size={13}/> : sync.failed ? <Cloud size={13}/> : saving ? <Cloud size={13}/> : <Check size={13}/>
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  return <div className="app-shell">
    <aside className="desktop-sidebar"><Brand /><Nav /><SidebarFooter /></aside>
    {open && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside className={`mobile-drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="drawer-head"><Brand compact /><Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X size={18}/></Button></div><Nav onNavigate={() => setOpen(false)} /><SidebarFooter />
    </aside>
    <main className="app-main">
      <header className="topbar">
        <div className="topbar-left"><Button className="mobile-only" variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={19}/></Button><span className="mobile-brand">Tracker<span>.</span></span></div>
        <div className="topbar-right"><span className="save-indicator" title={sync.lastError || ''}>{syncIcon}{syncLabel}</span><Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</Button><div className="avatar">N</div></div>
      </header><div className="page-wrap"><Outlet /></div>
    </main>
  </div>
}
function Brand({ compact = false }: { compact?: boolean }) { return <div className={`brand ${compact ? 'compact' : ''}`}><div className="brand-mark">T</div><span>Tracker<span>.</span></span></div> }
function Nav({ onNavigate }: { onNavigate?: () => void }) { return <nav className="side-nav">{groups.map(group => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} end={to === '/'} onClick={onNavigate} className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={16}/><span>{label}</span></NavLink>)}</div>)}</nav> }
function SidebarFooter() {
  const name = useAppStore(s => s.profile.name)
  return <NavLink to="/settings" className={({isActive}) => `sidebar-footer ${isActive ? 'active' : ''}`}>
    <div className="footer-line"/>
    <div className="sidebar-footer-row">
      <div className="sidebar-footer-icon"><Settings size={15}/></div>
      <div><strong>{name}</strong><span>Settings & preferences</span></div>
      <ChevronRight size={15} className="sidebar-footer-chevron"/>
    </div>
  </NavLink>
}
