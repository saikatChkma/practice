import { ArrowRight, Sparkles, Workflow } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

export default function Home() {
  const { intake, ocrData, vitals, triageResult } = useSession()

  const intakeReady = Boolean(intake?.originalText || intake?.translatedText)
  const ocrReady = Boolean(ocrData?.medications?.length || ocrData?.diagnoses?.length || ocrData?.testResults?.length)
  const vitalsReady = Boolean(vitals?.overallAnomalyLevel && vitals?.overallAnomalyLevel !== 'None')
  const triageReady = Boolean(triageResult?.triageScore)

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-teal-600">Dashboard</div>
      <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Rural Healthcare Triage Assistant</h1>
      <p className="mt-1 text-sm text-slate-500 mb-8">
        A CHW-friendly workflow for voice intake, document scanning, vitals review, AI triage, and report generation.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-6">
          {/* Hero card */}
          <div className="rounded-2xl bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-500 p-8 text-white shadow-md">
            <div className="flex items-center gap-2 text-teal-100 mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-widest">Live workflow</span>
            </div>
            <h3 className="text-2xl font-bold leading-snug sm:text-3xl">
              Collect patient data, structure clinical context, and prepare a clear triage handoff.
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/90">
              Start with the intake page, add OCR findings and vitals, then generate triage output and a report.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/intake"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-teal-700 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Begin intake <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/report"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Open report view
              </Link>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Voice intake', value: intakeReady ? 'Ready' : 'Pending', hint: 'Original and translated text captured.' },
              { label: 'OCR history', value: ocrReady ? 'Ready' : 'Pending', hint: 'Medications, diagnoses, and lab values.' },
              { label: 'Vitals check', value: vitalsReady ? 'Flagged' : 'Stable', hint: 'Rule-based anomaly assessment.' },
              { label: 'Triage', value: triageReady ? triageResult.triageScore : 'Pending', hint: 'AI reasoning and referral guidance.' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs text-slate-400 mb-1">{s.label}</div>
                <div className="text-lg font-bold text-slate-800">{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.hint}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="font-semibold text-slate-700 mb-1">Suggested flow</div>
            <p className="text-xs text-slate-400 mb-4">Move through the pages in order to keep the clinical session structured.</p>
            <div className="space-y-2 text-sm text-slate-600">
              {['Intake', 'Document Scan', 'Vitals Entry', 'Triage Result'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <Workflow className="h-4 w-4 text-teal-600 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="font-semibold text-slate-700 mb-1">State snapshot</div>
            <p className="text-xs text-slate-400">
              The current session holds intake, OCR, vitals, and triage data in shared React context.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}