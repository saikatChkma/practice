import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, 
  Play, 
  Pause, 
  Download, 
  UserPlus, 
  ChevronRight, 
  History, 
  HeartPulse, 
  ShieldAlert,
  Loader2,
  Globe
} from 'lucide-react'
import client from '../api/client'
import { useSession } from '../context/SessionContext'
import PageShell from '../components/PageShell'

export default function SummaryReport() {
  const navigate = useNavigate()
  const { patientInfo, intake, ocrData, vitals, triageResult, resetSession } = useSession()

  const [language, setLanguage] = useState('en')
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isSynthesizingVoice, setIsSynthesizingVoice] = useState(false)
  const [reportUrl, setReportUrl] = useState('')
  const [error, setError] = useState('')

const sessionData = useMemo(() => ({
    patientInfo,
    intake,
    ocrData,
    vitals,
    triageResult,
  }), [patientInfo, intake, ocrData, vitals, triageResult])

  console.log("DEBUG ocrData:", ocrData)
  console.log("DEBUG vitals:", vitals)
  console.log("DEBUG sessionData:", sessionData)
  const handleToggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'bn' : 'en')
  }

  const handlePlayVoiceSummary = async () => {
    if (isPlaying && audio) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    if (audio) {
      audio.play()
      setIsPlaying(true)
      return
    }

    setIsSynthesizingVoice(true)
    setError('')

    try {
      // Construct summary text from triage result
      const summaryText = language === 'en' 
        ? `Triage Score: ${triageResult.triageScore}. Reasoning: ${triageResult.reasoning}. Referral needed: ${triageResult.referralNeeded ? 'Yes' : 'No'}.`
        : `ট্রায়াজ স্কোর: ${triageResult.triageScore}। কারণ: ${triageResult.reasoning}। রেফারেল প্রয়োজন: ${triageResult.referralNeeded ? 'হ্যাঁ' : 'না'}।`

      const response = await client.post('/tts', { text: summaryText, language })
      const { audioBase64 } = response.data

      const audioBlob = await fetch(`data:audio/mpeg;base64,${audioBase64}`).then(res => res.blob())
      const url = URL.createObjectURL(audioBlob)
      const newAudio = new Audio(url)
      
      newAudio.onended = () => {
        setIsPlaying(false)
        setAudio(null)
      }

      setAudio(newAudio)
      newAudio.play()
      setIsPlaying(true)
    } catch (err) {
      console.error(err)
      setError('Failed to generate voice summary.')
    } finally {
      setIsSynthesizingVoice(false)
    }
  }

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true)
    setError('')
    try {
      const response = await client.post('/report', sessionData)
      setReportUrl(response.data.reportUrl)
    } catch (err) {
      console.error(err)
      setError('Failed to generate PDF report.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleStartNewPatient = () => {
    if (audio) {
      audio.pause()
    }
    resetSession()
    navigate('/intake')
  }

  const handleDownload = () => {
    if (reportUrl) {
      window.open(`http://localhost:5000${reportUrl}`, '_blank')
    }
  }

  return (
    <PageShell
      eyebrow="Summary Report"
      title="Final clinical review"
      description="Review all patient data, listen to a voice summary, and generate a PDF for medical records."
    >
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Review Section */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 border-b border-slate-100 pb-4 mb-4">
              <FileText className="h-5 w-5 text-brand-600" />
              Patient Summary
            </h3>
            
            <div className="space-y-6 text-sm text-slate-700">
              {/* Personal Info */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 uppercase tracking-wider text-xs">Patient Information</h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                  <div>
                    <span className="text-slate-500 block">Name</span>
                    <span className="font-medium">{patientInfo.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Age / Gender</span>
                    <span className="font-medium">{patientInfo.age || 'N/A'} / {patientInfo.gender || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Intake */}
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-2 uppercase tracking-wider text-xs">
                  <ChevronRight className="h-3 w-3" /> Intake Summary
                </h4>
                <div className="p-4 rounded-2xl border border-slate-100 italic bg-white leading-6">
                  {intake.translatedText || intake.originalText || 'No intake data recorded.'}
                </div>
              </div>

              {/* OCR */}
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-2 uppercase tracking-wider text-xs">
                  <History className="h-3 w-3" /> Medical History (OCR)
                </h4>
                <div className="space-y-2">
                  <div className="p-4 rounded-2xl bg-slate-50">
                    <p className="font-medium text-slate-600 mb-1">Medications:</p>
                    {ocrData.medications?.length > 0 
                      ? ocrData.medications.map((m, i) => <div key={i}>• {m.name} ({m.dosage})</div>)
                      : 'None detected'}
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50">
                    <p className="font-medium text-slate-600 mb-1">Diagnoses:</p>
                    {ocrData.diagnoses?.length > 0 
                      ? ocrData.diagnoses.map((d, i) => <div key={i}>• {d}</div>)
                      : 'None detected'}
                  </div>
                </div>
              </div>

              {/* Vitals */}
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-2 uppercase tracking-wider text-xs">
                  <HeartPulse className="h-3 w-3" /> Vitals & Assessment
                </h4>
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 flex justify-between items-center">
                  <span className="font-medium">Overall Status</span>
                  <span className="font-bold uppercase tracking-widest">{vitals.overallAnomalyLevel || 'None'}</span>
                </div>
              </div>

              {/* Triage */}
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-2 uppercase tracking-wider text-xs">
                  <ShieldAlert className="h-3 w-3" /> Triage Recommendation
                </h4>
                <div className={`p-4 rounded-2xl font-bold text-center mb-2 ${
                  triageResult.triageScore === 'Red' ? 'bg-red-600 text-white' : 
                  triageResult.triageScore === 'Yellow' ? 'bg-amber-400 text-slate-900' : 
                  triageResult.triageScore === 'Black' ? 'bg-black text-white' : 'bg-emerald-500 text-white'
                }`}>
                  SCORE: {triageResult.triageScore || 'PENDING'}
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 leading-6 italic">
                  {triageResult.reasoning || 'No analysis generated.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Actions Section */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Final Actions</h3>
            
            <div className="space-y-4">
              {/* Language Selector */}
              <button 
                onClick={handleToggleLanguage}
                className="flex items-center justify-between w-full p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-brand-600" />
                  <span className="text-sm font-medium">Summary Language</span>
                </div>
                <span className="text-xs font-bold uppercase text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
                  {language === 'en' ? 'English' : 'Bengali'}
                </span>
              </button>

              {/* Voice Player */}
              <button
                onClick={handlePlayVoiceSummary}
                disabled={isSynthesizingVoice || !triageResult.triageScore}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSynthesizingVoice ? <Loader2 className="h-5 w-5 animate-spin" /> : isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                {isPlaying ? 'Pause Summary' : 'Play Voice Summary'}
              </button>

              {/* PDF Generator */}
              {!reportUrl ? (
                <button
                  onClick={handleGeneratePdf}
                  disabled={isGeneratingPdf}
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl border border-brand-200 text-brand-700 font-semibold hover:bg-brand-50 transition disabled:opacity-50"
                >
                  {isGeneratingPdf ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                  Generate PDF Report
                </button>
              ) : (
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition shadow-lg animate-in fade-in slide-in-from-bottom-2"
                >
                  <Download className="h-5 w-5" />
                  Download Report
                </button>
              )}

              <div className="pt-6 border-t border-slate-100">
                <button
                  onClick={handleStartNewPatient}
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl border border-dashed border-slate-300 text-slate-500 font-medium hover:border-slate-400 hover:text-slate-600 transition"
                >
                  <UserPlus className="h-5 w-5" />
                  Start New Patient
                </button>
              </div>
            </div>
            
            {error && (
              <p className="mt-4 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                {error}
              </p>
            )}
          </div>

          <div className="rounded-[28px] bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white shadow-soft">
            <h4 className="font-bold flex items-center gap-2 mb-2">
              <ShieldAlert className="h-4 w-4" />
              Clinical Reminder
            </h4>
            <p className="text-sm opacity-90 leading-6 leading-6">
              This summary is AI-generated for pre-diagnostic triage only. A licensed physician must review all cases before clinical decisions are finalized.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
