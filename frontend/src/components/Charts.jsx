import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { CHART_COLORS } from "../lib/format";

const tooltipStyle = {
  fontSize: 12.5,
  borderRadius: 10,
  border: "1px solid #E4E7EC",
  boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
  padding: "8px 12px",
};

export function ProbabilityDistributionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: -20, right: 8, top: 4 }}>
        <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey="bucket"
          tick={{ fontSize: 11.5, fill: "#64748B" }}
          axisLine={{ stroke: "#E4E7EC" }}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11.5, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(13,148,136,0.06)" }} />
        <Bar dataKey="count" fill={CHART_COLORS.brand} radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RecoveryByMethodChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4 }}>
        <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 11.5, fill: "#64748B" }}
          axisLine={false}
          tickLine={false}
          unit="%"
        />
        <YAxis
          type="category"
          dataKey="payment_method"
          tick={{ fontSize: 12, fill: "#334155" }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [`${v}%`, "Recovery rate"]}
          cursor={{ fill: "rgba(13,148,136,0.06)" }}
        />
        <Bar dataKey="recovery_rate" fill={CHART_COLORS.brand} radius={[0, 6, 6, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FailureReasonChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: -20, right: 8, top: 4 }}>
        <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey="failure_reason"
          tick={{ fontSize: 10.5, fill: "#64748B" }}
          axisLine={{ stroke: "#E4E7EC" }}
          tickLine={false}
          interval={0}
          angle={-18}
          textAnchor="end"
          height={54}
        />
        <YAxis tick={{ fontSize: 11.5, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(13,148,136,0.06)" }} />
        <Bar dataKey="count" fill={CHART_COLORS.ink} radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const PRIORITY_COLOR_MAP = {
  "VERY HIGH": CHART_COLORS.veryhigh,
  HIGH: CHART_COLORS.high,
  MEDIUM: CHART_COLORS.medium,
  LOW: CHART_COLORS.low,
};

export function PriorityDonutChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={200} className="max-w-[200px]">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="priority"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.priority} fill={PRIORITY_COLOR_MAP[entry.priority]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid w-full grid-cols-2 gap-2.5 sm:w-auto">
        {data.map((entry) => (
          <div key={entry.priority} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: PRIORITY_COLOR_MAP[entry.priority] }}
            />
            <div>
              <p className="text-[11.5px] font-medium leading-tight text-ink-700">
                {entry.priority}
              </p>
              <p className="font-mono text-[11.5px] leading-tight text-ink-500">
                {entry.count} · {total ? ((entry.count / total) * 100).toFixed(0) : 0}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MerchantCategoryChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: -20, right: 8, top: 4 }}>
        <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey="merchant_category"
          tick={{ fontSize: 11, fill: "#64748B" }}
          axisLine={{ stroke: "#E4E7EC" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11.5, fill: "#64748B" }}
          axisLine={false}
          tickLine={false}
          unit="%"
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [`${v}%`, "Recovery rate"]}
          cursor={{ fill: "rgba(13,148,136,0.06)" }}
        />
        <Bar dataKey="recovery_rate" fill={CHART_COLORS.brand} radius={[6, 6, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RecoveredVsNotChart({ data }) {
  const colors = { Recovered: CHART_COLORS.brand, "Not Recovered": "#E2E8F0" };
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={180} className="max-w-[180px]">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" innerRadius={48} outerRadius={72} strokeWidth={0}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={colors[entry.status]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2.5">
        {data.map((entry) => (
          <div key={entry.status} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[entry.status] }} />
            <p className="text-[12.5px] font-medium text-ink-700">
              {entry.status}: <span className="font-mono text-ink-900">{entry.count}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
