import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  LineChart,
  Sparkles,
  Settings as SettingsIcon,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/analytics", label: "Recovery Analytics", icon: LineChart },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink-900/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed z-40 flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/15">
              <Sparkles size={16} className="text-brand-500" />
            </div>
            <span className="font-display text-[17px] font-bold tracking-tight text-white">
              Recover<span className="text-brand-500">AI</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-ink-400 hover:bg-white/5 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-0.5 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-active text-white"
                    : "text-ink-400 hover:bg-white/5 hover:text-ink-200"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-500 transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <Icon size={17} strokeWidth={2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mx-3 mb-5 rounded-lg border border-sidebar-border bg-white/[0.03] p-3.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
            <span className="text-[11px] font-medium text-ink-200">AI System Online</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-ink-500">
            Recovery model + Gemini explanations active
          </p>
        </div>
      </aside>
    </>
  );
}
