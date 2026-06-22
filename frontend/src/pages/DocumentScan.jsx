import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloudUpload, FileImage, Loader2, ScanSearch, CheckCircle2, SkipForward } from 'lucide-react'
import client from '../api/client'
import { useSession } from '../context/SessionContext'
import PageShell from '../components/PageShell'

const createEmptyOcrData = () => ({
  medications: [],
  diagnoses: [],
  testResults: [],
})

function normalizeOcrData(data) {
  return {
    medications: Array.isArray(data?.medications)
      ? data.medications.map((item) => ({
          name: item?.name || '',
          dosage: item?.dosage || '',
        }))
      : [],
    diagnoses: Array.isArray(data?.diagnoses)
      ? data.diagnoses.map((item) => String(item || ''))
      : [],
    testResults: Array.isArray(data?.testResults)
      ? data.testResults.map((item) => ({
          testName: item?.testName || '',
          value: item?.value || '',
          unit: item?.unit || '',
        }))
      : [],
  }
}

export default function DocumentScan() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { ocrData, setOcrData } = useSession()

  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [draftData, setDraftData] = useState(normalizeOcrData(ocrData))

  useEffect(() => () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFile = (file) => {
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.')
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError('')
  }

  const handleBrowse = () => {
    fileInputRef.current?.click()
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    handleFile(event.dataTransfer.files?.[0])
  }

  const updateMedication = (index, key, value) => {
    setDraftData((current) => {
      const next = [...current.medications]
      next[index] = { ...next[index], [key]: value }
      return { ...current, medications: next }
    })
  }

  const updateDiagnosis = (index, value) => {
    setDraftData((current) => {
      const next = [...current.diagnoses]
      next[index] = value
      return { ...current, diagnoses: next }
    })
  }

  const updateTestResult = (index, key, value) => {
    setDraftData((current) => {
      const next = [...current.testResults]
      next[index] = { ...next[index], [key]: value }
      return { ...current, testResults: next }
    })
  }

  const addMedication = () => {
    setDraftData((current) => ({
      ...current,
      medications: [...current.medications, { name: '', dosage: '' }],
    }))
  }

  const addDiagnosis = () => {
    setDraftData((current) => ({
      ...current,
      diagnoses: [...current.diagnoses, ''],
    }))
  }

  const addTestResult = () => {
    setDraftData((current) => ({
      ...current,
      testResults: [...current.testResults, { testName: '', value: '', unit: '' }],
    }))
  }

  const handleExtract = async () => {
    if (!selectedFile) {
      setError('Please choose an image first.')
      return
    }

    const formData = new FormData()
    formData.append('document', selectedFile)

    setIsLoading(true)
    setError('')

    try {
      const response = await client.post('/ocr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const nextData = normalizeOcrData(response.data)
      setDraftData(nextData)
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Failed to extract document data.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = () => {
    setOcrData(draftData)
    navigate('/vitals')
  }

  const handleSkip = () => {
    setOcrData(createEmptyOcrData())
    navigate('/vitals')
  }

  return (
    <PageShell
      eyebrow="Document Scan"
      title="Scan prescriptions or lab reports"
      description="Upload a photo, extract medical text, then correct any OCR mistakes before continuing to vitals."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.2fr]">
        <div className="space-y-6">
          <div
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDrop={handleDrop}
            onClick={handleBrowse}
            className={`cursor-pointer rounded-[28px] border-2 border-dashed p-8 transition ${
              isDragging ? 'border-brand-500 bg-brand-50' : 'border-brand-200 bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-600 text-white shadow-soft">
                <CloudUpload className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">Drag and drop a document image</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                Tap to browse, or use the device camera directly on mobile. Supported files are images only.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                <ScanSearch className="h-4 w-4 text-brand-600" />
                capture="environment"
              </div>
            </div>
          </div>

          {previewUrl ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <FileImage className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Selected image</p>
                  <p className="text-xs text-slate-500">{selectedFile?.name}</p>
                </div>
              </div>
              <img
                src={previewUrl}
                alt="Document preview"
                className="mt-4 max-h-80 w-full rounded-3xl border border-slate-200 object-contain bg-slate-50"
              />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExtract}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
              {isLoading ? 'Extracting...' : 'Extract Data'}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <SkipForward className="h-4 w-4" />
              Skip this step
            </button>
          </div>

          {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Medications</h3>
                <p className="text-sm text-slate-500">Name and dosage extracted from the document.</p>
              </div>
              <button type="button" onClick={addMedication} className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                Add medication
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {draftData.medications.length > 0 ? draftData.medications.map((item, index) => (
                <div key={index} className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-2">
                  <input
                    value={item.name}
                    onChange={(event) => updateMedication(index, 'name', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Medication name"
                  />
                  <input
                    value={item.dosage}
                    onChange={(event) => updateMedication(index, 'dosage', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Dosage"
                  />
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">No medications extracted yet.</div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Diagnoses</h3>
                <p className="text-sm text-slate-500">Editable diagnosis list from OCR parsing.</p>
              </div>
              <button type="button" onClick={addDiagnosis} className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                Add diagnosis
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {draftData.diagnoses.length > 0 ? draftData.diagnoses.map((item, index) => (
                <input
                  key={index}
                  value={item}
                  onChange={(event) => updateDiagnosis(index, event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Diagnosis"
                />
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">No diagnoses extracted yet.</div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Test Results</h3>
                <p className="text-sm text-slate-500">Table-style editing for numeric results and units.</p>
              </div>
              <button type="button" onClick={addTestResult} className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                Add result
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Test name</th>
                    <th className="px-4 py-3 font-medium">Value</th>
                    <th className="px-4 py-3 font-medium">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {draftData.testResults.length > 0 ? draftData.testResults.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <input
                          value={item.testName}
                          onChange={(event) => updateTestResult(index, 'testName', event.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Test name"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={item.value}
                          onChange={(event) => updateTestResult(index, 'value', event.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Value"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={item.unit}
                          onChange={(event) => updateTestResult(index, 'unit', event.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Unit"
                        />
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={3}>
                        No test results extracted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm & Continue
          </button>
        </div>
      </div>
    </PageShell>
  )
}