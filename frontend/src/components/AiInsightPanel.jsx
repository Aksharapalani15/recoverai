import { useState } from "react";
import { Sparkles, RefreshCw, MessageCircle, Lightbulb } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import { formatINR, formatPercent } from "../lib/format";
import { getAiInsight } from "../api/client";
import { getErrorMessage } from "../lib/format";
import { LoadingBlock } from "./StateBlocks";

export default function AiInsightPanel({ transaction, insight, onInsightLoaded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsight = async (refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAiInsight(transaction.transaction_id, refresh);
      onInsightLoaded(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-card border border-brand-100 bg-gradient-to-b from-brand-50/50 to-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500/10">
            <Sparkles size={14} className="text-brand-600" />
          </div>
          <h3 className="text-[14px] font-semibold text-ink-900">RecoverAI Recommendation</h3>
        </div>
        {insight && (
          <button
            onClick={() => fetchInsight(true)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-ink-500 hover:bg-app"
            title="Regenerate"
          >
            <RefreshCw size={12} />
            Regenerate
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Recovery probability" value={formatPercent(transaction.recovery_probability * 100)} />
        <Stat label="Priority" value={<PriorityBadge priority={transaction.priority} />} />
        <Stat label="Recommended action" value={transaction.recommended_action} small />
        <Stat label="Recommended channel" value={transaction.recommended_channel} small />
      </div>

      <div className="mt-5 border-t border-brand-100/70 pt-4">
        {!insight && !loading && (
          <button
            onClick={() => fetchInsight(false)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink-900 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-ink-700"
          >
            <Sparkles size={14} />
            Generate AI Explanation
          </button>
        )}

        {loading && <LoadingBlock label="Asking Gemini for a recovery explanation…" />}

        {error && <p className="text-[12.5px] text-status-danger">{error}</p>}

        {insight && !loading && (
          <div className="space-y-4">
            {insight.source === "fallback_rule_based" && (
              <div className="rounded-md bg-amber-50 px-3 py-2 text-[11.5px] text-amber-700">
                Showing a rule-based explanation because Gemini isn't configured
                {insight.error ? ` (${insight.error})` : ""}. Add{" "}
                <code className="font-mono">GEMINI_API_KEY</code> to the backend{" "}
                <code className="font-mono">.env</code> to enable live AI explanations.
              </div>
            )}

            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-800">
                <Lightbulb size={13} className="text-brand-600" />
                Why this payment is recoverable
              </div>
              <p className="text-[13px] leading-relaxed text-ink-700">{insight.why_recoverable}</p>
            </div>

            {insight.why_action && (
              <div>
                <div className="mb-1.5 text-[12.5px] font-semibold text-ink-800">
                  Why this action fits
                </div>
                <p className="text-[13px] leading-relaxed text-ink-700">{insight.why_action}</p>
              </div>
            )}

            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-800">
                <MessageCircle size={13} className="text-brand-600" />
                Customer Recovery Message
              </div>
              <p className="rounded-lg border border-border bg-app px-3.5 py-3 text-[13px] italic leading-relaxed text-ink-700">
                "{insight.customer_message}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, small }) {
  return (
    <div>
      <p className="text-[10.5px] font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p
        className={`mt-1 font-medium text-ink-900 ${
          small ? "text-[12px] leading-snug" : "font-mono text-[15px]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
