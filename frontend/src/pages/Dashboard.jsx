import { useEffect, useState } from "react";
import { AlertTriangle, IndianRupee, TrendingUp, Zap } from "lucide-react";
import KpiCard from "../components/KpiCard";
import { ChartCard, LoadingBlock, ErrorBlock } from "../components/StateBlocks";
import {
  ProbabilityDistributionChart,
  PriorityDonutChart,
  RecoveryByMethodChart,
  RecoveredVsNotChart,
} from "../components/Charts";
import { formatINR, formatNumber, formatPercent, getErrorMessage } from "../lib/format";
import { getKpis, getCharts } from "../api/client";

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [charts, setCharts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getKpis(), getCharts()])
      .then(([k, c]) => {
        setKpis(k);
        setCharts(c);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <ErrorBlock title="Dashboard unavailable" detail={error} />;
  if (!kpis || !charts) return <LoadingBlock label="Loading dashboard…" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Failed Payments"
          value={formatNumber(kpis.total_failed_payments)}
          sublabel={`${formatINR(kpis.total_amount_at_risk)} at risk`}
          icon={AlertTriangle}
          accent="danger"
        />
        <KpiCard
          label="Recovery Rate"
          value={formatPercent(kpis.recovery_rate)}
          sublabel="Historical, based on actual outcomes"
          icon={TrendingUp}
          accent="brand"
        />
        <KpiCard
          label="Recoverable Amount"
          value={formatINR(kpis.recoverable_amount)}
          sublabel="Transactions with ≥60% recovery probability"
          icon={IndianRupee}
          accent="info"
        />
        <KpiCard
          label="High Priority Transactions"
          value={formatNumber(kpis.high_priority_transactions)}
          sublabel="Marked HIGH or VERY HIGH"
          icon={Zap}
          accent="warning"
        />
      </div>

      <div>
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-500">
          Recovery Overview
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard
            title="Recovery Probability Distribution"
            subtitle="Number of transactions per probability band"
          >
            <ProbabilityDistributionChart data={charts.probability_distribution} />
          </ChartCard>
          <ChartCard title="Priority Distribution" subtitle="Share of transactions by recovery priority">
            <PriorityDonutChart data={charts.priority_distribution} />
          </ChartCard>
          <ChartCard
            title="Recovery Rate by Payment Method"
            subtitle="Share of failed payments that were ultimately recovered"
          >
            <RecoveryByMethodChart data={charts.recovery_by_payment_method} />
          </ChartCard>
          <ChartCard title="Actual Recovered vs Not Recovered" subtitle="Overall outcome split">
            <RecoveredVsNotChart data={charts.recovered_vs_not} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
