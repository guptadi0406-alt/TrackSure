import { useState, useEffect } from "react";
import {
  Route as RouteIcon, RefreshCw, ChevronRight, X,
  MapPin, TrendingUp, Package, Search
} from "lucide-react";
import { routeAPI } from "../services/api";

const STATUS_STYLE = {
  IN_TRANSIT: "bg-blue-50 text-blue-700",
  DELIVERED:  "bg-emerald-50 text-emerald-700",
  DELAYED:    "bg-orange-50 text-orange-700",
  AT_RISK:    "bg-amber-50 text-amber-700",
  CRITICAL:   "bg-red-50 text-red-700",
  LOST:       "bg-slate-100 text-slate-600",
  RECOVERED:  "bg-purple-50 text-purple-700",
};

function StatPill({ label, value, cls }) {
  return (
    <div className={`rounded-lg px-3 py-2 text-center ${cls}`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] font-medium opacity-70">{label}</p>
    </div>
  );
}

function RouteDrawer({ route, onClose }) {
  const [summary, setSummary]   = useState(null);
  const [parcels, setParcels]   = useState([]);
  const [tab, setTab]           = useState("summary");
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!route) return;
    setLoading(true);
    Promise.allSettled([
      routeAPI.getSummary(route._id),
      routeAPI.getParcels(route._id),
    ]).then(([sr, pr]) => {
      setSummary(sr.status === "fulfilled" ? sr.value.data.data : null);
      setParcels(pr.status === "fulfilled" ? pr.value.data.data || [] : []);
    }).finally(() => setLoading(false));
  }, [route]);

  if (!route) return null;
  const sb = summary?.statusBreakdown || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{route.routeCode}</p>
            <h2 className="mt-0.5 text-lg font-semibold text-slate-900">{route.name}</h2>
            {summary && (
              <p className="mt-1 text-xs text-slate-400">
                {summary.origin?.city} → {summary.destination?.city} · {summary.totalStops} stops
              </p>
            )}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-100 px-5 pt-3">
          {["summary", "parcels"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`mb-[-1px] rounded-t-lg px-4 py-2 text-xs font-semibold capitalize transition ${
                tab === t ? "border border-b-white border-slate-100 bg-white text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}{t === "parcels" ? ` (${parcels.length})` : ""}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <RefreshCw size={20} className="animate-spin" />
            </div>
          )}

          {!loading && tab === "summary" && summary && (
            <div className="space-y-5">
              {/* Status breakdown */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Parcel Status</p>
                <div className="grid grid-cols-3 gap-2">
                  <StatPill label="Total"      value={summary.parcelCount}      cls="bg-slate-50 text-slate-700" />
                  <StatPill label="Delivered"  value={sb.DELIVERED  || 0}       cls="bg-emerald-50 text-emerald-700" />
                  <StatPill label="In Transit" value={sb.IN_TRANSIT || 0}       cls="bg-blue-50 text-blue-700" />
                  <StatPill label="At Risk"    value={sb.AT_RISK    || 0}       cls="bg-amber-50 text-amber-700" />
                  <StatPill label="Delayed"    value={sb.DELAYED    || 0}       cls="bg-orange-50 text-orange-700" />
                  <StatPill label="Critical"   value={sb.CRITICAL   || 0}       cls="bg-red-50 text-red-700" />
                  <StatPill label="Lost"       value={sb.LOST       || 0}       cls="bg-slate-100 text-slate-600" />
                  <StatPill label="Recovered"  value={sb.RECOVERED  || 0}       cls="bg-purple-50 text-purple-700" />
                  <StatPill label="Delivery %"
                    value={summary.parcelCount > 0 ? `${((sb.DELIVERED || 0) / summary.parcelCount * 100).toFixed(0)}%` : "—"}
                    cls="bg-emerald-50 text-emerald-700"
                  />
                </div>
              </div>

              {/* Stops */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Route Stops</p>
                <div className="space-y-2">
                  {summary.stops?.map((stop, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                        {stop.sequence}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900">
                          {stop.facilityId?.code} — {stop.facilityId?.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Dwell: {stop.expectedDwellMinutes} min
                          {stop.expectedTransitMinutes ? ` · Transit: ${stop.expectedTransitMinutes} min` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && tab === "parcels" && parcels.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">No parcels on this route</p>
          )}

          {!loading && tab === "parcels" && parcels.map((p) => (
            <div key={p._id} className="mb-2 flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{p.trackingNumber}</p>
                <p className="text-[11px] text-slate-400 capitalize">{p.currentState?.toLowerCase().replace(/_/g, " ")}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[p.status] || "bg-slate-100 text-slate-600"}`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Routes() {
  const [routes, setRoutes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch]   = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await routeAPI.list();
      setRoutes(data.data || []);
    } catch { setRoutes([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = routes.filter(r =>
    r.routeCode?.toLowerCase().includes(search.toLowerCase()) ||
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Routes</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {loading ? "Loading…" : `${filtered.length} shipping corridors`}
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
          placeholder="Search by route code or name…"
          className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-4 text-sm focus:border-slate-400 focus:outline-none"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <RefreshCw size={24} className="animate-spin" />
        </div>
      )}

      <div className="space-y-3">
        {!loading && filtered.map((r) => (
          <button
            key={r._id}
            onClick={() => setSelected(r)}
            className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <RouteIcon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{r.routeCode}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">{r.name}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin size={10} />
                {r.originId?.city || "Origin"} → {r.destinationId?.city || "Destination"}
                · {r.stops?.length || 0} stops
              </p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-slate-300 transition group-hover:text-slate-500" />
          </button>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <RouteIcon size={36} className="mb-3 opacity-30" />
          <p className="text-sm">No routes found</p>
        </div>
      )}

      <RouteDrawer route={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
