import { useState, useEffect } from "react";
import {
  Building2, RefreshCw, Package, AlertTriangle, MapPin,
  ChevronRight, X, Activity, Search
} from "lucide-react";
import { facilityAPI } from "../services/api";

const TYPE_COLORS = {
  HUB:                  "bg-violet-50 text-violet-700",
  SORTING_CENTER:       "bg-blue-50   text-blue-700",
  DISTRIBUTION_CENTER:  "bg-emerald-50 text-emerald-700",
  WAREHOUSE:            "bg-amber-50  text-amber-700",
  DELIVERY_CENTER:      "bg-orange-50 text-orange-700",
};

const SEVERITY = {
  CRITICAL: "bg-red-50 text-red-700",
  HIGH:     "bg-orange-50 text-orange-700",
  MEDIUM:   "bg-amber-50 text-amber-700",
  WATCH:    "bg-blue-50 text-blue-700",
  NORMAL:   "bg-slate-100 text-slate-500",
};

function Badge({ label, cls }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>{label}</span>
  );
}

function FacilityDrawer({ facility, onClose }) {
  const [tab, setTab]       = useState("parcels");
  const [parcels, setParcels] = useState([]);
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!facility) return;
    setLoading(true);
    Promise.allSettled([
      facilityAPI.getParcels(facility._id),
      facilityAPI.getAlerts(facility._id),
    ]).then(([pr, ar]) => {
      setParcels(pr.status === "fulfilled" ? pr.value.data.data || [] : []);
      setAlerts(ar.status  === "fulfilled" ? ar.value.data.data  || [] : []);
    }).finally(() => setLoading(false));
  }, [facility]);

  if (!facility) return null;

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
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {facility.code}
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-slate-900">{facility.name}</h2>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <MapPin size={12} /> {facility.city}, {facility.state}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Meta chips */}
        <div className="flex gap-2 border-b border-slate-100 px-6 py-3">
          <Badge label={facility.type?.replace(/_/g, " ")} cls={TYPE_COLORS[facility.type] || "bg-slate-100 text-slate-600"} />
          <Badge label={facility.isActive ? "Active" : "Inactive"} cls={facility.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-100 px-5 pt-3">
          {["parcels", "alerts"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`mb-[-1px] rounded-t-lg px-4 py-2 text-xs font-semibold capitalize transition ${
                tab === t
                  ? "border border-b-white border-slate-100 text-slate-900 bg-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}
              {t === "parcels" && ` (${parcels.length})`}
              {t === "alerts"  && ` (${alerts.length})`}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <RefreshCw size={20} className="animate-spin" />
            </div>
          )}

          {!loading && tab === "parcels" && parcels.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">No parcels at this facility</p>
          )}

          {!loading && tab === "parcels" && parcels.map((p) => (
            <div key={p._id} className="mb-2 flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{p.trackingNumber}</p>
                <p className="text-[11px] text-slate-400 capitalize">{p.currentState?.toLowerCase().replace(/_/g, " ")}</p>
              </div>
              <Badge
                label={p.status}
                cls={
                  p.status === "IN_TRANSIT" ? "bg-blue-50 text-blue-700" :
                  p.status === "DELIVERED"  ? "bg-emerald-50 text-emerald-700" :
                  p.status === "AT_RISK"    ? "bg-amber-50 text-amber-700" :
                  p.status === "CRITICAL"   ? "bg-red-50 text-red-700" :
                  p.status === "DELAYED"    ? "bg-orange-50 text-orange-700" :
                  "bg-slate-100 text-slate-600"
                }
              />
            </div>
          ))}

          {!loading && tab === "alerts" && alerts.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">No alerts for this facility</p>
          )}

          {!loading && tab === "alerts" && alerts.map((a) => (
            <div key={a._id} className={`mb-2 rounded-xl border p-4 ${SEVERITY[a.severity] || "border-slate-100 bg-white"}`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">{a.type?.replace(/_/g, " ")}</p>
                <Badge label={a.severity} cls={SEVERITY[a.severity] || "bg-slate-100 text-slate-600"} />
              </div>
              <p className="mt-1 text-[11px] opacity-80">{a.message}</p>
              <p className="mt-1 text-[10px] opacity-50">{new Date(a.createdAt).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [search, setSearch]         = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await facilityAPI.list();
      setFacilities(data.data || []);
    } catch { setFacilities([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = facilities.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.code?.toLowerCase().includes(search.toLowerCase()) ||
    f.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col p-7">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Facilities</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {loading ? "Loading…" : `${filtered.length} facilities in the network`}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, code or city…"
          className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-4 text-sm focus:border-slate-400 focus:outline-none"
        />
      </div>

      {/* Grid */}
      {loading && (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <RefreshCw size={24} className="animate-spin" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {!loading && filtered.map((f) => (
          <button
            key={f._id}
            onClick={() => setSelected(f)}
            className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <Building2 size={20} className="text-slate-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{f.code}</p>
                <Badge label={f.type?.replace(/_/g, " ")} cls={TYPE_COLORS[f.type] || "bg-slate-100 text-slate-600"} />
              </div>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">{f.name}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin size={10} /> {f.city}, {f.state}
              </p>
            </div>
            <ChevronRight size={16} className="mt-1 shrink-0 text-slate-300 transition group-hover:text-slate-500" />
          </button>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Building2 size={36} className="mb-3 opacity-30" />
          <p className="text-sm">No facilities found</p>
        </div>
      )}

      <FacilityDrawer facility={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
