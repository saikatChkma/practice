import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react'
import client from '../api/client'
import { useSession } from '../context/SessionContext'
import PageShell from '../components/PageShell'

function buildMedicalHistory(ocrData) {
  return {
    medications: Array.isArray(ocrData?.medications) ? ocrData.medications : [],
    diagnoses: Array.isArray(ocrData?.diagnoses) ? ocrData.diagnoses : [],
    testResults: Array.isArray(ocrData?.testResults) ? ocrData.testResults : [],
  }
}

function buildVitalsAnomalyFlags(vitals) {
  return {
    bloodPressureSys: vitals?.assessment?.bloodPressureSys || vitals?.bloodPressureSys || '',
    bloodPressureDia: vitals?.assessment?.bloodPressureDia || vitals?.bloodPressureDia || '',
    heartRate: vitals?.assessment?.heartRate || vitals?.heartRate || '',
    temperature: vitals?.assessment?.temperature || vitals?.temperature || '',
    oxygenSaturation: vitals?.assessment?.oxygenSaturation || vitals?.oxygenSaturation || '',
    bloodGlucose: vitals?.assessment?.bloodGlucose || vitals?.bloodGlucose || '',
    overallAnomalyLevel: vitals?.overallAnomalyLevel || 'None',
    assessment: vitals?.assessment || {},
  }
}

function getScoreStyles(score) {
  if (score === 'Yellow') return 'bg-amber-400 text-slate-900'
  if (score === 'Red') return 'bg-red-600 text-white'
  if (score === 'Black') return 'bg-slate-950 text-white'
  return 'bg-emerald-500 text-white'
}

function getReferralStyles(urgency) {
  if (urgency === 'immediate') {
    return 'border-red-300 bg-red-50 text-red-800'
  }
  return 'border-amber-200 bg-amber-50 text-amber-900'
}

function formatList(items) {
  return Array.isArray(items) ? items.filter(Boolean) : []
}

export default function TriageResult() {
  const navigate = useNavigate()
  const { intake, ocrData, vitals, triageResult, setTriageResult } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [checklist, setChecklist] = useState({})
  const [analysis, setAnalysis] = useState(triageResult?.triageScore ? triageResult : null)

  const payload = useMemo(() => ({
    symptoms: intake?.translatedText || intake?.originalText || '',
    medicalHistory: buildMedicalHistory(ocrData),
    vitalsAnomalyFlags: buildVitalsAnomalyFlags(vitals),
  }), [intake, ocrData, vitals])

  useEffect(() => {
    let active = true

    async function runAnalysis() {
      if (!payload.symptoms.trim()) {
        if (active) {
          setError('No intake text found. Please complete patient intake first.')
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const response = await client.post('/analyze', payload)
        const result = response.data || {}

        if (!active) return

        setAnalysis(result)
        setTriageResult(result)
        setChecklist(
          Array.isArray(result.firstAidSteps)
            ? result.firstAidSteps.reduce((accumulator, step, index) => {
                accumulator[index] = false
                return accumulator
              }, {})
            : {},
        )
      } catch (requestError) {
        if (!active) return
        setError(requestError?.response?.data?.message || 'Unable to analyze the patient data right now.')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    runAnalysis()

    return () => {
      active = false
    }
  }, [payload, setTriageResult])

  const triageScore = analysis?.triageScore || 'Green'
  const diagnoses = formatList(analysis?.differentialDiagnoses)
  const firstAidSteps = formatList(analysis?.firstAidSteps)

  const toggleChecklist = (index) => {
    setChecklist((current) => ({ ...current, [index]: !current[index] }))
  }

  const handleGenerateReport = () => {
    if (analysis) {
      setTriageResult(analysis)
    }

    navigate('/report')
  }

  return (
    <PageShell
      eyebrow="Triage Result"
      title="AI triage is ready for demo"
      description="This page automatically analyzes the intake, OCR history, and vitals anomaly flags as soon as it loads."
    >
      {isLoading ? (
        <div className="flex min-h-[58vh] flex-col items-center justify-center rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-brand-900 to-brand-700 p-10 text-white shadow-soft">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
            <Brain className="h-12 w-12 animate-pulse text-white" />
          </div>
          <div className="mt-6 flex items-center gap-3 text-lg font-semibold">
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing patient data...
          </div>
          <p className="mt-3 max-w-xl text-center text-sm leading-6 text-white/80">
            The model is reviewing symptoms, OCR medical history, and vitals anomalies to produce a triage recommendation.
          </p>
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5" />
            <div>
              <h3 className="text-base font-semibold">Analysis error</h3>
              <p className="mt-1 text-sm leading-6">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`rounded-[36px] px-6 py-8 text-center shadow-soft ring-1 ring-slate-200 ${getScoreStyles(triageScore)}`}>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] opacity-90">Triage Score</p>
            <div className="mt-4 text-6xl font-black md:text-7xl">{triageScore}</div>
            <p className="mt-3 text-sm opacity-90">
              {triageScore === 'Black'
                ? 'Life-threatening: transfer immediately.'
                : triageScore === 'Red'
                  ? 'Emergency: specialist attention needed now.'
                  : triageScore === 'Yellow'
                    ? 'Urgent: monitor closely and act early.'
                    : 'Routine: continue standard care and observation.'}
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Reasoning</h3>
                <p className="mt-3 text-sm leading-7 text-slate-700">{analysis?.reasoning || 'No reasoning returned.'}</p>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Differential Diagnoses</h3>
                {diagnoses.length > 0 ? (
                  <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-700">
                    {diagnoses.map((diagnosis, index) => (
                      <li key={`${diagnosis}-${index}`}>{diagnosis}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No differential diagnoses returned.</p>
                )}
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Immediate First-Aid Steps</h3>
                {firstAidSteps.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {firstAidSteps.map((step, index) => (
                      <label key={`${step}-${index}`} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                        <input
                          type="checkbox"
                          checked={Boolean(checklist[index])}
                          onChange={() => toggleChecklist(index)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className={checklist[index] ? 'text-slate-500 line-through' : ''}>{step}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No first-aid steps returned.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {analysis?.referralNeeded ? (
                <div className={`rounded-[28px] border p-5 shadow-sm ${getReferralStyles(analysis.referralUrgency)}`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5" />
                    <div>
                      <h3 className="text-base font-semibold">Referral required</h3>
                      <p className="mt-1 text-sm leading-6">
                        Referral urgency: <span className="font-semibold">{analysis.referralUrgency || 'urgent'}</span>
                      </p>
                      <p className="mt-2 text-sm leading-6">
                        {analysis.referralUrgency === 'immediate'
                          ? 'Immediate escalation is recommended. Arrange transfer or specialist intervention now.'
                          : 'Referral should be arranged according to the urgency indicated by the AI triage output.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-soft">
                <h3 className="text-lg font-semibold">Session Snapshot</h3>
                <div className="mt-4 space-y-2 text-sm leading-6 text-slate-200">
                  <p><span className="font-semibold text-white">Symptoms:</span> {payload.symptoms || 'n/a'}</p>
                  <p><span className="font-semibold text-white">Medications:</span> {payload.medicalHistory.medications.length || 0}</p>
                  <p><span className="font-semibold text-white">Diagnoses:</span> {payload.medicalHistory.diagnoses.length || 0}</p>
                  <p><span className="font-semibold text-white">Vitals anomaly:</span> {payload.vitalsAnomalyFlags.overallAnomalyLevel}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateReport}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Generate Final Report
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}