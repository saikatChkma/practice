import { createContext, useContext, useMemo, useState } from 'react'

const SessionContext = createContext(null)

const initialSession = {
  patientInfo: {
    name: '',
    age: '',
    gender: '',
    location: '',
  },
  intake: {
    originalText: '',
    translatedText: '',
  },
  ocrData: {
    medications: [],
    diagnoses: [],
    testResults: [],
  },
  vitals: {
    bloodPressureSys: '',
    bloodPressureDia: '',
    heartRate: '',
    temperature: '',
    oxygenSaturation: '',
    bloodGlucose: '',
    overallAnomalyLevel: 'None',
    vitals: {},
  },
  triageResult: {
    triageScore: '',
    reasoning: '',
    differentialDiagnoses: [],
    firstAidSteps: [],
    referralNeeded: false,
    referralUrgency: '',
  },
}

export function SessionProvider({ children }) {
  const [patientInfo, setPatientInfo] = useState(initialSession.patientInfo)
  const [intake, setIntake] = useState(initialSession.intake)
  const [ocrData, setOcrData] = useState(initialSession.ocrData)
  const [vitals, setVitals] = useState(initialSession.vitals)
  const [triageResult, setTriageResult] = useState(initialSession.triageResult)

  const resetSession = () => {
    setPatientInfo(initialSession.patientInfo)
    setIntake(initialSession.intake)
    setOcrData(initialSession.ocrData)
    setVitals(initialSession.vitals)
    setTriageResult(initialSession.triageResult)
  }

  const value = useMemo(
    () => ({
      patientInfo,
      setPatientInfo,
      intake,
      setIntake,
      ocrData,
      setOcrData,
      vitals,
      setVitals,
      triageResult,
      setTriageResult,
      resetSession,
    }),
    [patientInfo, intake, ocrData, vitals, triageResult],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)

  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }

  return context
}