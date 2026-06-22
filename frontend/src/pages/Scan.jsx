import { useSession } from '../context/SessionContext'
import PageShell from '../components/PageShell'

export default function Scan() {
  const { ocrData, setOcrData } = useSession()

  const updateArray = (field, index, key, value) => {
    const next = [...ocrData[field]]
    next[index] = { ...next[index], [key]: value }
    setOcrData({ ...ocrData, [field]: next })
  }

  return (
    <PageShell
      eyebrow="Document Scan"
      title="OCR findings and medical history"
      description="Review extracted medication names, diagnoses, and test results from scanned documents."
    >
      <div className="grid gap-6 xl:grid-cols-3">
        {['medications', 'diagnoses', 'testResults'].map((field) => (
          <div key={field} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-base font-semibold capitalize text-slate-900">{field}</h3>
            <div className="mt-4 space-y-3">
              {(ocrData[field].length ? ocrData[field] : field === 'diagnoses' ? [''] : [{ name: '', dosage: '', testName: '', value: '', unit: '' }]).map((entry, index) => (
                <div key={index} className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
                  {field === 'medications' ? (
                    <>
                      <input className="w-full rounded-xl border border-slate-200 px-3 py-2" value={entry.name || ''} onChange={(event) => updateArray(field, index, 'name', event.target.value)} placeholder="Medication name" />
                      <input className="w-full rounded-xl border border-slate-200 px-3 py-2" value={entry.dosage || ''} onChange={(event) => updateArray(field, index, 'dosage', event.target.value)} placeholder="Dosage" />
                    </>
                  ) : field === 'diagnoses' ? (
                    <input className="w-full rounded-xl border border-slate-200 px-3 py-2" value={entry || ''} onChange={(event) => {
                      const next = [...ocrData[field]]
                      next[index] = event.target.value
                      setOcrData({ ...ocrData, [field]: next })
                    }} placeholder="Diagnosis" />
                  ) : (
                    <>
                      <input className="w-full rounded-xl border border-slate-200 px-3 py-2" value={entry.testName || ''} onChange={(event) => updateArray(field, index, 'testName', event.target.value)} placeholder="Test name" />
                      <div className="grid grid-cols-2 gap-2">
                        <input className="w-full rounded-xl border border-slate-200 px-3 py-2" value={entry.value || ''} onChange={(event) => updateArray(field, index, 'value', event.target.value)} placeholder="Value" />
                        <input className="w-full rounded-xl border border-slate-200 px-3 py-2" value={entry.unit || ''} onChange={(event) => updateArray(field, index, 'unit', event.target.value)} placeholder="Unit" />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}