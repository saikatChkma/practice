import Sidebar from './Sidebar'
import StepProgress from './StepProgress'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col xl:flex-row">
        <Sidebar />
        <main className="flex-1 bg-mesh bg-grid flex flex-col">
          <StepProgress />
          <div className="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}