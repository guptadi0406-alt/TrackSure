import { useState, useEffect } from "react";
import { Search, Package, RefreshCw, X, Activity } from "lucide-react";
import { parcelAPI } from "../services/api";

const STATUS_STYLES = {
  IN_TRANSIT: "bg-blue-50 text-blue-700",
  AT_RISK:    "bg-amber-50 text-amber-700",
  CRITICAL:   "bg-red-50 text-red-700",
  DELIVERED:  "bg-emerald-50 text-emerald-700",
  DELAYED:    "bg-orange-50 text-orange-700",
  LOST:       "bg-slate-100 text-slate-600",
  RECOVERED:  "bg-purple-50 text-purple-700",
};

const STATUS_LABELS = {
  IN_TRANSIT: "In transit",
  AT_RISK:    "At risk",
  CRITICAL:   "Critical",
  DELIVERED:  "Delivered",
  DELAYED:    "Delayed",
  LOST:       "Lost",
  RECOVERED:  "Recovered",
};

const EVENT_COLORS = {
  CREATED:    "bg-slate-400",
  ARRIVED:    "bg-blue-500",
  SORTED:     "bg-violet-500",
  LOADED:     "bg-indigo-500",
  DISPATCHED: "bg-amber-500",
  DEPARTED:   "bg-orange-500",
  DELIVERED:  "bg-emerald-500",
};

const SEVERITY_RING = {
  NORMAL:   "border-emerald-400 bg-emerald-50 text-emerald-700",
  WATCH:    "border-blue-400 bg-blue-50 text-blue-700",
  MEDIUM:   "border-amber-400 bg-amber-50 text-amber-700",
  HIGH:     "border-orange-400 bg-orange-50 text-orange-700",
  CRITICAL: "border-red-500 bg-red-50 text-red-700",
};

export default function Parcels() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchParcels = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await parcelAPI.list(params);
      setParcels(data.data || []);
    } catch {
      setError("Failed to load parcels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchParcels(); }, [statusFilter]);

  const filtered = parcels.filter((p) =>
    p.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.currentFacilityId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col p-7">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Parcels</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {loading ? "Loading…" : `${filtered.length} parcels`}
          </p>
        </div>
        <button
          onClick={fetchParcels}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tracking number or facility…"
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-slate-400 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="IN_TRANSIT">In transit</option>
          <option value="AT_RISK">At risk</option>
          <option value="CRITICAL">Critical</option>
          <option value="DELIVERED">Delivered</option>
          <option value="DELAYED">Delayed</option>
          <option value="LOST">Lost</option>
          <option value="RECOVERED">Recovered</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">Tracking #</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">Status</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">Current facility</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">State</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-slate-400">Loading parcels…</td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-slate-400">No parcels found</td>
              </tr>
            )}
            {!loading && filtered.map((parcel) => (
              <tr
                key={parcel._id}
                onClick={() => setSelected(parcel)}
                className="cursor-pointer transition hover:bg-slate-50"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                      <Package size={13} className="text-slate-500" />
                    </div>
                    <span className="font-medium text-slate-900">{parcel.trackingNumber}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[parcel.status] || "bg-slate-100 text-slate-600"}`}>
                    {STATUS_LABELS[parcel.status] || parcel.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  {parcel.currentFacilityId
                    ? `${parcel.currentFacilityId.code} — ${parcel.currentFacilityId.name}`
                    : "—"}
                </td>
                <td className="px-5 py-3.5 capitalize text-slate-500">
                  {parcel.currentState?.toLowerCase().replace(/_/g, " ") || "—"}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-400">
                  {new Date(parcel.updatedAt).toLocaleString("en-IN", {
                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <ParcelDrawer parcel={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}

function ParcelDrawer({ parcel, onClose }) {
  const [scans, setScans]     = useState([]);
  const [risk, setRisk]       = useState(null);
  const [tab, setTab]         = useState("info");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!parcel) return;
    setLoading(true);
    Promise.allSettled([
      parcelAPI.getScans(parcel._id),
      parcelAPI.getRisk(parcel._id),
    ]).then(([sr, rr]) => {
      setScans(sr.status === "fulfilled" ? sr.value.data.data || [] : []);
      setRisk(rr.status  === "fulfilled" ? rr.value.data.data  || null : null);
    }).finally(() => setLoading(false));
  }, [parcel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tracking number</p>
            <h2 className="mt-0.5 text-lg font-semibold text-slate-900">{parcel.trackingNumber}</h2>
            <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[parcel.status] || "bg-slate-100 text-slate-600"}`}>
              {STATUS_LABELS[parcel.status] || parcel.status}
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-100 px-5 pt-3">
          {["info", "scans", "risk"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`mb-[-1px] rounded-t-lg px-4 py-2 text-xs font-semibold capitalize transition ${
                tab === t
                  ? "border border-b-white border-slate-100 bg-white text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}{t === "scans" ? ` (${scans.length})` : ""}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 py-5">
          {tab === "info" && (
            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              <Row label="Current facility" value={parcel.currentFacilityId ? `${parcel.currentFacilityId.code} — ${parcel.currentFacilityId.name}` : "—"} />
              <Row label="Current state" value={parcel.currentState?.toLowerCase().replace(/_/g, " ") || "—"} />
              <Row label="Route" value={parcel.routeId?.routeCode || parcel.routeId || "—"} />
              <Row label="Expected delivery" value={parcel.expectedDeliveryTime ? new Date(parcel.expectedDeliveryTime).toLocaleDateString("en-IN") : "—"} />
              {parcel.actualDeliveryTime && (
                <Row label="Delivered on" value={new Date(parcel.actualDeliveryTime).toLocaleString("en-IN")} />
              )}
              <Row label="Last updated" value={new Date(parcel.updatedAt).toLocaleString("en-IN")} />
            </div>
          )}

          {tab === "scans" && (
            <div>
              {loading && (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <RefreshCw size={18} className="animate-spin" />
                </div>
              )}
              {!loading && scans.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-400">No scans recorded</p>
              )}
              {!loading && scans.length > 0 && (
                <div className="relative">
                  {[...scans].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map((scan, idx, arr) => (
                    <div key={scan._id} className="flex gap-4 pb-5 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`h-3 w-3 rounded-full ${EVENT_COLORS[scan.eventType] || "bg-slate-300"}`} />
                        {idx < arr.length - 1 && <div className="mt-1 w-px flex-1 bg-slate-200" />}
                      </div>
                      <div className="min-w-0 pb-1">
                        <p className="text-xs font-semibold text-slate-900">{scan.eventType}</p>
                        <p className="text-[11px] text-slate-500">
                          {scan.facilityId?.code} — {scan.facilityId?.name || String(scan.facilityId)}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {new Date(scan.timestamp).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "risk" && (
            <div>
              {loading && (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <RefreshCw size={18} className="animate-spin" />
                </div>
              )}
              {!loading && !risk && (
                <p className="py-10 text-center text-sm text-slate-400">No risk data available</p>
              )}
              {!loading && risk && (
                <div className="space-y-4">
                  <div className={`flex items-center justify-between rounded-2xl border-2 p-5 ${SEVERITY_RING[risk.severity] || "border-slate-200 bg-slate-50 text-slate-700"}`}>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide opacity-60">Risk Score</p>
                      <p className="mt-0.5 text-4xl font-bold">{risk.score}</p>
                      <p className="text-sm font-semibold opacity-80">{risk.severity}</p>
                    </div>
                    <Activity size={40} className="opacity-20" />
                  </div>
                  <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                    {[
                      { label: "Delay",        value: risk.delayScore       || 0 },
                      { label: "Dwell time",   value: risk.dwellScore       || 0 },
                      { label: "Missing scan", value: risk.missingScanScore  || 0 },
                      { label: "Route",        value: risk.routeScore       || 0 },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-slate-500">{label}</span>
                          <span className="font-semibold text-slate-800">{value}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-slate-700 transition-all duration-700"
                            style={{ width: `${Math.min((value / 30) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-[11px] text-slate-400">
                    Calculated {risk.calculatedAt ? new Date(risk.calculatedAt).toLocaleString("en-IN") : ""}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-right text-xs font-medium capitalize text-slate-800">{value}</span>
    </div>
  );
}