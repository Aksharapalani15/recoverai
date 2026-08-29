import { useEffect, useState } from "react";
import { ChartCard, LoadingBlock, ErrorBlock } from "../components/StateBlocks";
import {
  FailureReasonChart,
  MerchantCategoryChart,
  PriorityDonutChart,
  ProbabilityDistributionChart,
} from "../components/Charts";
import { getCharts, getModelMetrics } from "../api/client";
import { getErrorMessage } from "../lib/format";

export default function Analytics() {
  const [charts, setCharts] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getCharts(), getModelMetrics()])
      .then(([c, m]) => {
        setCharts(c);
        setMetrics(m);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <ErrorBlock title="Analytics unavailable" detail={error} />;
  if (!charts) return <LoadingBlock label="Loading analytics…" />;

  return (
    <div className="space-y-6">
      {metrics && metrics.roc_auc && (
        <div className="rounded-card border border-border bg-surface p-4 shadow-card">
          <h3 className="mb-2 text-[12.5px] font-semibold text-ink-800">Model Quality (held-out test set)</h3>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <Metric label="Accuracy" value={metrics.accuracy} />
            <Metric label="Precision" value={metrics.precision} />
            <Metric label="Recall" value={metrics.recall} />
            <Metric label="F1 Score" value={metrics.f1} />
            <Metric label="ROC-AUC" value={metrics.roc_auc} />
          </div>
          {metrics.note && <p className="mt-2 text-[11.5px] text-ink-500">{metrics.note}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Failed Transactions by Failure Reason"
          subtitle="Count and amount at risk per failure type"
        >
          <FailureReasonChart data={charts.failures_by_reason} />
        </ChartCard>
        <ChartCard
          title="Recovery Performance by Merchant Category"
          subtitle="Recovery rate across merchant categories"
        >
          <MerchantCategoryChart data={charts.recovery_by_merchant_category} />
        </ChartCard>
        <ChartCard title="Priority Distribution" subtitle="Share of transactions by recovery priority">
          <PriorityDonutChart data={charts.priority_distribution} />
        </ChartCard>
        <ChartCard
          title="Recovery Probability Distribution"
          subtitle="Number of transactions per probability band"
        >
          <ProbabilityDistributionChart data={charts.probability_distribution} />
        </ChartCard>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-[10.5px] font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className="font-mono text-[16px] font-semibold text-ink-900">{value}</p>
    </div>
  );
}
