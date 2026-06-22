export default function ActionCard({ title, text, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}