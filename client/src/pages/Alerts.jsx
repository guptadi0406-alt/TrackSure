import { useState, useEffect } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { alertAPI } from "../services/api";

const SEVERITY_STYLES = {
  CRITICAL: "bg-red-50 text-red-700 border-red-100",
  HIGH:     "bg-orange-50 text-orange-700 border-orange-100",
  MEDIUM:   "bg-amber-50 text-amber-700 border-amber-100",
  WATCH:    "bg-blue-50 text-blue-700 border-blue-100",
  NORMAL:   "bg-slate-50 text-slate-600 border-slate-100",
};

const TYPE_LABELS = {
  EXCESSIVE_DELAY: "Excessive delay",
  EXCESSIVE_DWELL: "Excessive dwell",
  MISSING_SCAN:    "Missing scan",
  ROUTE_DEVIATION: "Route deviation",
  FACILITY_ANOMALY:"Facility anomaly",
};

const STATUS_OPTIONS = ["OPEN","ACKNOWLEDGED","INVESTIGATING","RESOLVED","DISMISSED"];

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [updating, setUpdating] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await alertAPI.list(params);
      setAlerts(data.data || data.alerts || []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [statusFilter]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await alertAPI.update(id, status);
      await fetchAlerts();
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Alerts</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {loading ? "Loading…" : `${alerts.length} alerts`}
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className="mb-5 flex gap-1.5">
        {["", "OPEN", "INVESTIGATING", "RESOLVED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
              statusFilter === s
                ? "bg-slate-900 text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s === "" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="flex-1 space-y-3 overflow-auto">
        {loading && (
          <div className="py-12 text-center text-sm text-slate-400">Loading alerts…</div>
        )}

        {!loading && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <CheckCircle size={32} className="mb-3 opacity-40" />
            <p className="text-sm">No alerts for this filter</p>
          </div>
        )}

        {!loading && alerts.map((alert) => (
          <div
            key={alert._id}
            className={`flex items-start gap-4 rounded-xl border bg-white p-5 ${SEVERITY_STYLES[alert.severity] || "border-slate-200"}`}
          >
            <div className="mt-0.5">
              {alert.severity === "CRITICAL" || alert.severity === "HIGH"
                ? <AlertCircle size={18} />
                : <AlertTriangle size={18} />
              }
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">{TYPE_LABELS[alert.type] || alert.type}</span>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium border">
                  {alert.severity}
                </span>
                <span className="text-[10px] text-current opacity-60">{alert.status}</span>
              </div>

              <p className="mt-1 text-xs opacity-80">{alert.message}</p>

              {alert.parcelId && (
                <p className="mt-1.5 text-[11px] font-medium opacity-70">
                  📦 {alert.parcelId.trackingNumber}
                </p>
              )}

              <p className="mt-1 text-[10px] opacity-50">
                {new Date(alert.createdAt).toLocaleString("en-IN")}
              </p>
            </div>

            {/* Quick action */}
            {alert.status === "OPEN" && (
              <select
                disabled={updating === alert._id}
                defaultValue=""
                onChange={(e) => e.target.value && updateStatus(alert._id, e.target.value)}
                className="mt-0.5 rounded-lg border border-current border-opacity-30 bg-white/60 px-2 py-1.5 text-xs font-medium focus:outline-none"
              >
                <option value="" disabled>Update…</option>
                <option value="ACKNOWLEDGED">Acknowledge</option>
                <option value="INVESTIGATING">Investigate</option>
                <option value="RESOLVED">Resolve</option>
                <option value="DISMISSED">Dismiss</option>
              </select>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
