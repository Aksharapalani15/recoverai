import { useEffect, useState } from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import AiInsightPanel from "./AiInsightPanel";
import { formatINR } from "../lib/format";

export default function TransactionDetail({ transaction, onClose }) {
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    setInsight(null);
  }, [transaction?.transaction_id]);

  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-border bg-app shadow-raised sm:max-w-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-5 py-4">
          <div>
            <p className="font-mono text-[12px] text-ink-500">{transaction.transaction_id}</p>
            <h2 className="font-display text-[17px] font-bold text-ink-900">
              {formatINR(transaction.amount)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-500 hover:bg-app"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={transaction.priority} size="md" />
            <StatusPill recovered={transaction.actual_recovered} />
          </div>

          <div className="rounded-card border border-border bg-surface p-4">
            <h3 className="mb-3 text-[12.5px] font-semibold text-ink-800">Transaction Details</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="Payment method" value={transaction.payment_method} />
              <Field label="Merchant category" value={transaction.merchant_category} />
              <Field label="Failure reason" value={transaction.failure_reason} />
              <Field label="Attempt number" value={transaction.attempt_number} />
              <Field label="Previous successes" value={transaction.previous_successes} />
              <Field label="Previous failures" value={transaction.previous_failures} />
              <Field label="Customer tenure" value={`${transaction.customer_tenure_months} months`} />
              <Field label="Hours since failure" value={transaction.hours_since_failure} />
              <Field
                label="Subscription"
                value={transaction.is_subscription ? "Yes" : "No"}
              />
              <Field label="Transaction hour" value={`${transaction.transaction_hour}:00`} />
            </div>
          </div>

          <AiInsightPanel
            transaction={transaction}
            insight={insight}
            onInsightLoaded={setInsight}
          />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[10.5px] font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-0.5 text-[13px] font-medium text-ink-900">{value}</p>
    </div>
  );
}

function StatusPill({ recovered }) {
  if (recovered === 1) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-status-successSoft px-2.5 py-1 text-[11px] font-semibold text-status-success">
        <CheckCircle2 size={12} /> Recovered
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-status-dangerSoft px-2.5 py-1 text-[11px] font-semibold text-status-danger">
      <XCircle size={12} /> Not Recovered
    </span>
  );
}
