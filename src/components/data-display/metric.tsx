import type { LucideIcon } from 'lucide-react'
export function Metric({ label, value, hint, icon: Icon }: { label: string; value: string; hint?: string; icon?: LucideIcon }) { return <div className="metric"><div className="metric-top"><span>{label}</span>{Icon && <Icon size={15}/>}</div><strong>{value}</strong>{hint && <small>{hint}</small>}</div> }
