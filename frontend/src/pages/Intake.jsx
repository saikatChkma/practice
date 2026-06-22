import { useState, useRef } from 'react'
import { useSession } from '../context/SessionContext'
import PageShell from '../components/PageShell'

export default function Intake() {
  const { intake, setIntake, patientInfo, setPatientInfo } = useSession()
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  async function startRecording() {
    setError('')
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    chunksRef.current = []

    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data)
mediaRecorder.onstop = async () => {
  const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
  const formData = new FormData()
  formData.append('audio', blob, 'recording.webm')

  setLoading(true)
  try {
    const res = await fetch('http://localhost:5000/api/transcribe', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    console.log('transcribe response:', data)
    setIntake(prev => ({
      ...prev,
      originalText: data.originalText || data.text || '',
      translatedText: data.translatedText || data.text || ''
    }))
  } catch (err) {
    setError('Transcription failed. Check backend.')
  } finally {
    setLoading(false)
  }
}
    mediaRecorder.start()
    setRecording(true)
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <PageShell
      eyebrow="Patient Intake"
      title="Voice transcript and translation"
      description="Capture symptoms in Bengali or English, then store the translated version for downstream triage."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Patient Name
            <input
              value={patientInfo.name}
              onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-brand-500 transition focus:ring-2"
              placeholder="Enter patient name"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            {['age', 'gender', 'location'].map((field) => (
              <label key={field} className="block text-sm font-medium capitalize text-slate-700">
                {field}
                <input
                  value={patientInfo[field]}
                  onChange={(e) => setPatientInfo({ ...patientInfo, [field]: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-brand-500 transition focus:ring-2"
                  placeholder={`Enter ${field}`}
                />
              </label>
            ))}
          </div>

{/* Voice Record Button */}
<div className="flex items-center gap-4">
  {!recording ? (
    <button
      onClick={startRecording}
      style={{ backgroundColor: '#0d9488', color: 'white', padding: '12px 24px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      🎙️ Start Recording
    </button>
  ) : (
    <button
      onClick={stopRecording}
      style={{ backgroundColor: '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      ⏹️ Stop Recording
    </button>
  )}
  {loading && <span style={{ color: '#64748b', fontSize: '14px' }}>Transcribing...</span>}
  {error && <span style={{ color: '#ef4444', fontSize: '14px' }}>{error}</span>}
</div>

          <label className="block text-sm font-medium text-slate-700">
            Original Intake Text
            <textarea
              rows={8}
              value={intake.originalText}
              onChange={(e) => setIntake({ ...intake, originalText: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-brand-500 transition focus:ring-2"
              placeholder="Voice transcription from backend will appear here"
            />
          </label>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Translated / Normalized Text
            <textarea
              rows={10}
              value={intake.translatedText}
              onChange={(e) => setIntake({ ...intake, translatedText: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-brand-500 transition focus:ring-2"
              placeholder="English normalized symptoms go here"
            />
          </label>

          <div className="rounded-3xl border border-dashed border-brand-200 bg-brand-50 p-5 text-sm leading-6 text-brand-900">
            Use this page to stage the intake payload before sending it to triage. The shared context keeps the workflow persistent across routes.
          </div>
        </div>
      </div>
    </PageShell>
  )
}