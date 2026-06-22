export default function PageShell({ eyebrow, title, description, children }) {
  return (
    <section className="mx-auto max-w-6xl">
      <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-soft backdrop-blur md:p-8">
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600">{eyebrow}</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{title}</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-600 md:text-base">{description}</p>
        </div>
        {children}
      </div>
    </section>
  )
}