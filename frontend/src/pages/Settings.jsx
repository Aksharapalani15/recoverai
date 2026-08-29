import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { getHealth, getModelMetrics } from "../api/client";
import { LoadingBlock } from "../components/StateBlocks";

export default function Settings() {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealth({ status: "unreachable" }));
    getModelMetrics().then(setMetrics).catch(() => {});
  }, []);

  if (!health) return <LoadingBlock label="Checking system status…" />;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-card border border-border bg-surface p-5 shadow-card">
        <h3 className="mb-4 text-[13.5px] font-semibold text-ink-900">System Status</h3>
        <StatusRow
          label="Backend API"
          ok={health.status === "ok"}
          detail={health.status === "ok" ? "Reachable at your configured API URL" : "Unreachable"}
        />
        <StatusRow
          label="Recovery Model"
          ok={!!metrics?.roc_auc}
          detail={metrics?.roc_auc ? `ROC-AUC ${metrics.roc_auc} on held-out test data` : "Not yet trained"}
        />
        <StatusRow
          label="Gemini AI Explanations"
          ok={!!health.gemini_configured}
          detail={
            health.gemini_configured
              ? "GEMINI_API_KEY detected on the backend"
              : "Not configured — showing rule-based fallback explanations"
          }
        />
      </div>

      <div className="rounded-card border border-border bg-surface p-5 shadow-card">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck size={16} className="text-brand-600" />
          <h3 className="text-[13.5px] font-semibold text-ink-900">API Key Handling</h3>
        </div>
        <p className="text-[12.5px] leading-relaxed text-ink-600">
          <code className="rounded bg-app px-1 py-0.5 font-mono text-[11.5px]">GEMINI_API_KEY</code>{" "}
          is read only from the backend's environment (<code className="font-mono">.env</code>) and is
          never sent to or stored in this frontend. To change it, edit{" "}
          <code className="font-mono">backend/.env</code> and restart the backend server.
        </p>
      </div>
    </div>
  );
}

function StatusRow({ label, ok, detail }) {
  return (
    <div className="flex items-start gap-3 border-b border-border py-3 last:border-0">
      {ok ? (
        <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-status-success" />
      ) : (
        <XCircle size={17} className="mt-0.5 shrink-0 text-ink-400" />
      )}
      <div>
        <p className="text-[13px] font-medium text-ink-900">{label}</p>
        <p className="text-[12px] text-ink-500">{detail}</p>
      </div>
    </div>
  );
}
