import { ClipboardList, FileScan, Home, HeartPulse, ShieldAlert, FileText } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/intake', label: 'Patient Intake', icon: ClipboardList },
  { to: '/scan', label: 'Document Scan', icon: FileScan },
  { to: '/vitals', label: 'Vitals Entry', icon: HeartPulse },
  { to: '/triage', label: 'Triage Result', icon: ShieldAlert },
  { to: '/report', label: 'Summary Report', icon: FileText },
]

export default function Sidebar() {
  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white/90 backdrop-blur xl:w-80">
      <div className="border-b border-slate-200 px-6 py-6">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-brand-800 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-soft">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">CSE Carnival</p>
            <h1 className="text-lg font-bold text-slate-900">Triage Assistant</h1>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-5">
        <div className="space-y-2">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-brand-600 text-white shadow-soft'
                    : 'text-slate-700 hover:bg-brand-50 hover:text-brand-800',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-200 px-6 py-5 text-xs leading-5 text-slate-500">
        Built for fast clinical handoff, structured intake, and live demo flow.
      </div>
    </aside>
  )
}