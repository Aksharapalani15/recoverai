export const formatINR = (value) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-IN").format(value);
};

export const formatPercent = (value, digits = 1) => {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(digits)}%`;
};

export const PRIORITY_STYLES = {
  "VERY HIGH": {
    text: "text-priority-veryhigh",
    bg: "bg-red-50",
    dot: "bg-priority-veryhigh",
    ring: "ring-red-100",
  },
  HIGH: {
    text: "text-priority-high",
    bg: "bg-amber-50",
    dot: "bg-priority-high",
    ring: "ring-amber-100",
  },
  MEDIUM: {
    text: "text-priority-medium",
    bg: "bg-blue-50",
    dot: "bg-priority-medium",
    ring: "ring-blue-100",
  },
  LOW: {
    text: "text-priority-low",
    bg: "bg-slate-100",
    dot: "bg-priority-low",
    ring: "ring-slate-200",
  },
};

// Pulls the most useful message out of an axios error so the UI can show
// what actually went wrong instead of a generic guess.
export const getErrorMessage = (err) => {
  if (err?.response) {
    // Backend responded, but with an error status. Our FastAPI exception
    // handler puts a real message in `detail` -- surface that.
    const detail = err.response.data?.detail;
    return detail || `Backend returned ${err.response.status} ${err.response.statusText || ""}`.trim();
  }
  if (err?.request) {
    // Request was sent but no response came back at all -- almost always
    // means the backend isn't running or isn't reachable at that URL.
    const url = err.config?.baseURL ? `${err.config.baseURL}${err.config.url}` : "the API";
    return `No response from ${url}. Check that the backend is running and VITE_API_BASE_URL is correct.`;
  }
  return err?.message || "Unknown error";
};

export const CHART_COLORS = {
  brand: "#0D9488",
  brandSoft: "#99F6E4",
  veryhigh: "#DC2626",
  high: "#D97706",
  medium: "#2563EB",
  low: "#64748B",
  ink: "#334155",
  grid: "#EEF1F5",
};
