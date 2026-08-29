import { Menu } from "lucide-react";

export default function Header({ title, subtitle, onMenuClick, aiOnline }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/80 px-5 py-4 backdrop-blur sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-md border border-border p-1.5 text-ink-500 hover:bg-app lg:hidden"
          >
            <Menu size={18} />
          </button>
          <div>
            <h1 className="font-display text-[19px] font-bold tracking-tight text-ink-900 sm:text-[22px]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-[12.5px] text-ink-500 sm:text-[13px]">{subtitle}</p>
            )}
          </div>
        </div>

        <div
          className={`hidden shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 sm:flex ${
            aiOnline
              ? "border-status-successSoft bg-status-successSoft/60"
              : "border-border bg-app"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              aiOnline ? "animate-pulse bg-status-success" : "bg-ink-400"
            }`}
          />
          <span
            className={`text-[11.5px] font-medium ${
              aiOnline ? "text-status-success" : "text-ink-500"
            }`}
          >
            {aiOnline ? "AI System Online" : "Checking system…"}
          </span>
        </div>
      </div>
    </header>
  );
}
