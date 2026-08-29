import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import PriorityBadge from "../components/PriorityBadge";
import TransactionDetail from "../components/TransactionDetail";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../components/StateBlocks";
import { formatINR, formatPercent, getErrorMessage } from "../lib/format";
import { getTransactions } from "../api/client";

export default function AiInsights() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getTransactions({
      priority: "VERY HIGH",
      sort_by: "recovery_probability",
      order: "desc",
      page: 1,
      page_size: 12,
    })
      .then((data) => setRows(data.results))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-semibold text-ink-900">AI Insights</h2>
        <p className="mt-0.5 text-[12.5px] text-ink-500">
          The highest-priority recoverable transactions, ready for a Gemini-generated explanation.
        </p>
      </div>

      {error && <ErrorBlock title="Couldn't load insights" detail={error} />}
      {loading && <LoadingBlock label="Loading top-priority transactions…" />}
      {!loading && !error && rows.length === 0 && (
        <EmptyBlock
          title="No VERY HIGH priority transactions found"
          detail="Once the model flags transactions above the top threshold, they'll appear here."
        />
      )}

      {!loading && rows.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <button
              key={row.transaction_id}
              onClick={() => setSelected(row)}
              className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 text-left shadow-card transition-shadow hover:shadow-raised"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[11.5px] text-ink-500">{row.transaction_id}</p>
                  <p className="font-mono text-[18px] font-semibold text-ink-900">
                    {formatINR(row.amount)}
                  </p>
                </div>
                <PriorityBadge priority={row.priority} />
              </div>
              <div className="flex items-center justify-between text-[12px] text-ink-500">
                <span>{row.failure_reason}</span>
                <span className="font-mono font-medium text-brand-600">
                  {formatPercent(row.recovery_probability * 100)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-md bg-brand-50 px-2.5 py-1.5 text-[11.5px] font-medium text-brand-700">
                <Sparkles size={12} />
                View AI explanation
              </div>
            </button>
          ))}
        </div>
      )}

      <TransactionDetail transaction={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
