export default function KpiCard({ label, value, sublabel, icon: Icon, accent = "brand" }) {
  const accentClasses = {
    brand: "bg-brand-500",
    danger: "bg-priority-veryhigh",
    warning: "bg-priority-high",
    info: "bg-priority-medium",
  };

  return (
    <div className="relative overflow-hidden rounded-card border border-border bg-surface p-5 shadow-card">
      <span className={`absolute left-0 top-0 h-full w-1 ${accentClasses[accent]}`} />
      <div className="flex items-start justify-between">
        <p className="text-[12.5px] font-medium text-ink-500">{label}</p>
        {Icon && (
          <div className="rounded-md bg-app p-1.5 text-ink-500">
            <Icon size={15} strokeWidth={2} />
          </div>
        )}
      </div>
      <p className="mt-3 font-mono text-[26px] font-semibold tabular-nums tracking-tight text-ink-900 sm:text-[28px]">
        {value}
      </p>
      {sublabel && <p className="mt-1 text-[12px] text-ink-500">{sublabel}</p>}
    </div>
  );
}
