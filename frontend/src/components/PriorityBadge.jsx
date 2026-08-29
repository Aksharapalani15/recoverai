import { PRIORITY_STYLES } from "../lib/format";

export default function PriorityBadge({ priority, size = "sm" }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.LOW;
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide ${padding} ${style.bg} ${style.text} ring-1 ring-inset ${style.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {priority}
    </span>
  );
}
