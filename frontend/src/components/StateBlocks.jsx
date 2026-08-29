export function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div className={`rounded-card border border-border bg-surface p-5 shadow-card ${className}`}>
      <div className="mb-4">
        <h3 className="text-[13.5px] font-semibold text-ink-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[12px] text-ink-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function LoadingBlock({ label = "Loading…" }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-2 text-ink-400">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />
      <span className="text-[12.5px]">{label}</span>
    </div>
  );
}

export function EmptyBlock({ title = "No data available", detail }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-1 text-center text-ink-400">
      <span className="text-[13px] font-medium text-ink-500">{title}</span>
      {detail && <span className="max-w-xs text-[12px]">{detail}</span>}
    </div>
  );
}

export function ErrorBlock({ title = "Couldn't load this data", detail }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-1 text-center">
      <span className="text-[13px] font-medium text-status-danger">{title}</span>
      {detail && <span className="max-w-xs text-[12px] text-ink-500">{detail}</span>}
    </div>
  );
}
