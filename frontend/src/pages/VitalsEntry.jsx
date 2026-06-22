import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Loader2, HeartPulse } from 'lucide-react'
import client from '../api/client'
import { useSession } from '../context/SessionContext'
import PageShell from '../components/PageShell'

const fields = [
  { key: 'bloodPressureSys', label: 'Blood Pressure Systolic', unit: 'mmHg', min: 50, max: 260 },
  { key: 'bloodPressureDia', label: 'Blood Pressure Diastolic', unit: 'mmHg', min: 30, max: 180 },
  { key: 'heartRate', label: 'Heart Rate', unit: 'bpm', min: 20, max: 240 },
  { key: 'temperature', label: 'Temperature', unit: '°C', min: 30, max: 45 },
  { key: 'oxygenSaturation', label: 'Oxygen Saturation', unit: '%', min: 50, max: 100 },
  { key: 'bloodGlucose', label: 'Blood Glucose', unit: 'mg/dL', min: 20, max: 600 },
]

function createInitialValues(vitals) {
  return fields.reduce((accumulator, field) => {
    accumulator[field.key] = vitals?.[field.key] ?? ''
    return accumulator
  }, {})
}

function getBannerStyles(level) {
  if (level === 'Severe') {
    return 'border-red-200 bg-red-50 text-red-800'
  }

  if (level === 'Mild') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-800'
}

function getBadgeStyles(status) {
  if (status === 'Severe') {
    return 'bg-red-100 text-red-800 ring-red-200'
  }

  if (status === 'Mild') {
    return 'bg-amber-100 text-amber-800 ring-amber-200'
  }

  return 'bg-emerald-100 text-emerald-800 ring-emerald-200'
}

export default function VitalsEntry() {
  const navigate = useNavigate()
  const { vitals: savedVitals, setVitals } = useSession()

  const [values, setValues] = useState(() => createInitialValues(savedVitals))
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(savedVitals?.overallAnomalyLevel ? savedVitals : null)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const bannerLevel = result?.overallAnomalyLevel || 'None'
  const bannerMessage = useMemo(() => {
    if (bannerLevel === 'Severe') {
      return 'Severe anomaly detected. Escalate immediately and review clinical safety before proceeding.'
    }

    if (bannerLevel === 'Mild') {
      return 'Mild anomalies detected. Continue with caution and ensure the CHW reviews all flagged values.'
    }

    return 'No anomaly assessment has been confirmed yet.'
  }, [bannerLevel])

  const validateField = (field, rawValue) => {
    if (rawValue === '' || rawValue === null || rawValue === undefined) {
      return `${field.label} is required.`
    }

    if (!/^\d+(\.\d+)?$/.test(String(rawValue))) {
      return `${field.label} must be a numeric value.`
    }

    const numericValue = Number(rawValue)

    if (!Number.isFinite(numericValue) || numericValue < field.min || numericValue > field.max) {
      return `${field.label} must be between ${field.min} and ${field.max} ${field.unit}.`
    }

    return ''
  }

  const validateForm = () => {
    const nextErrors = fields.reduce((accumulator, field) => {
      const message = validateField(field, values[field.key])
      if (message) {
        accumulator[field.key] = message
      }
      return accumulator
    }, {})

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleChange = (fieldKey, value) => {
    setValues((current) => ({ ...current, [fieldKey]: value }))

    const field = fields.find((item) => item.key === fieldKey)
    if (!field) {
      return
    }

    const message = validateField(field, value)
    setErrors((current) => {
      const next = { ...current }
      if (message) {
        next[fieldKey] = message
      } else {
        delete next[fieldKey]
      }
      return next
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setSubmitError('')

    const payload = fields.reduce((accumulator, field) => {
      accumulator[field.key] = Number(values[field.key])
      return accumulator
    }, {})

    try {
      const response = await client.post('/vitals-check', payload)
      const responseData = response.data || {}

      const mergedVitals = {
        ...payload,
        assessment: responseData.vitals || {},
        overallAnomalyLevel: responseData.overallAnomalyLevel || 'None',
      }

      setResult(mergedVitals)
      setVitals(mergedVitals)
    } catch (requestError) {
      setSubmitError(requestError?.response?.data?.message || 'Unable to evaluate vitals right now.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmContinue = () => {
    if (!result) {
      setSubmitError('Please run the vitals check before continuing.')
      return
    }

    setVitals(result)
    navigate('/triage')
  }

  return (
    <PageShell
      eyebrow="Vitals Entry"
      title="Assess patient vitals"
      description="Enter numeric measurements, run anomaly detection, review status badges, and continue to triage when ready."
    >
      <div className={`mb-6 rounded-[28px] border px-5 py-4 ${getBannerStyles(bannerLevel)}`}>
        <div className="flex items-start gap-3">
          <HeartPulse className="mt-0.5 h-5 w-5" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">Overall Anomaly Summary</p>
            <p className="mt-1 text-sm leading-6">{bannerMessage}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <label key={field.key} className="block text-sm font-medium text-slate-700">
                <span className="flex items-center justify-between gap-3">
                  <span>{field.label}</span>
                  <span className="text-xs font-medium text-slate-500">{field.unit}</span>
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={values[field.key]}
                  onChange={(event) => handleChange(field.key, event.target.value)}
                  onBlur={(event) => handleChange(field.key, event.target.value)}
                  className={`mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none transition focus:ring-2 ${errors[field.key] ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-brand-500'}`}
                  aria-invalid={Boolean(errors[field.key])}
                  aria-describedby={`${field.key}-error`}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
                <span className="mt-2 block text-xs text-slate-500">
                  Acceptable range: {field.min} - {field.max} {field.unit}
                </span>
                {errors[field.key] ? (
                  <span id={`${field.key}-error`} className="mt-2 block text-xs font-medium text-red-600">
                    {errors[field.key]}
                  </span>
                ) : null}
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
              {isLoading ? 'Checking vitals...' : 'Analyze Vitals'}
            </button>

            <button
              type="button"
              onClick={handleConfirmContinue}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm & Continue
            </button>
          </div>

          {submitError ? (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
          ) : null}
        </div>

        <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Assessment Results</h3>
            <p className="text-sm text-slate-500">Each vital is shown with its returned anomaly status.</p>
          </div>

          <div className="space-y-3">
            {fields.map((field) => {
              const status = result?.assessment?.[field.key]?.status || 'Normal'

              return (
                <div key={field.key} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{field.label}</p>
                    <p className="text-xs text-slate-500">
                      Value: {result?.assessment?.[field.key]?.value ?? values[field.key] ?? '—'} {field.unit}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getBadgeStyles(status)}`}>
                    {status}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Submit the form to calculate the anomaly results, then confirm to save the vitals into session state and continue to triage.
          </div>
        </div>
      </form>
    </PageShell>
  )
}