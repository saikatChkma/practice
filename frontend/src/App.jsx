import { Routes, Route, Navigate } from 'react-router-dom'
import { SessionProvider } from './context/SessionContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Intake from './pages/Intake'
import DocumentScan from './pages/DocumentScan'
import VitalsEntry from './pages/VitalsEntry'
import TriageResult from './pages/TriageResult'
import SummaryReport from './pages/SummaryReport'

export default function App() {
  return (
    <SessionProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/intake" element={<Intake />} />
          <Route path="/scan" element={<DocumentScan />} />
          <Route path="/vitals" element={<VitalsEntry />} />
          <Route path="/triage" element={<TriageResult />} />
          <Route path="/report" element={<SummaryReport />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </SessionProvider>
  )
}