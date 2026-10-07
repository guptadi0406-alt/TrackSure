import { useState, useEffect } from "react";
import { dashboardAPI } from "../services/api";
import { RefreshCw, TrendingUp, AlertTriangle, Truck, Building2 } from "lucide-react";

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function Section({ title, subtitle, children, loading }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {loading && <RefreshCw size={13} className="animate-spin text-slate-400" />}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Bar({ label, value, max, color, suffix = "" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{value.toLocaleString()}{suffix}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Risk Trend mini-chart ─────────────────────────────────────────────────────
function TrendChart({ data }) {
  if (!data?.length) return <p className="py-6 text-center text-xs text-slate-400">No trend data</p>;

  const max = Math.max(...data.map(d => d.maximumScore), 1);

  return (
    <div>
      <div className="flex h-36 items-end gap-1">
        {data.map((d, i) => {
          const avgH = Math.round((d.averageScore / max) * 100);
          const maxH = Math.round((d.maximumScore / max) * 100);
          return (
            <div key={i} className="group relative flex flex-1 flex-col items-center gap-0.5">
              {/* max score bar (lighter) */}
              <div
                className="w-full rounded-t bg-red-100 transition-all"
                style={{ height: `${maxH}%` }}
              />
              {/* avg score bar (solid) */}
              <div
                className="absolute bottom-0 w-full rounded-t bg-slate-700 transition-all group-hover:bg-slate-900"
                style={{ height: `${avgH}%` }}
              />
              {/* tooltip */}
              <div className="pointer-events-none absolute -top-10 left-1/2 hidden -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] shadow-sm group-hover:block whitespace-nowrap">
                avg {d.averageScore} · max {d.maximumScore}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-slate-400">
        <span>{data[0]?.date?.slice(5)}</span>
        <span>{data[Math.floor(data.length / 2)]?.date?.slice(5)}</span>
        <span>{data[data.length - 1]?.date?.slice(5)}</span>
      </div>
      <div className="mt-4 flex items-center gap-4 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-3 rounded bg-slate-700" />Avg score</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-3 rounded bg-red-100" />Max score</span>
      </div>
    </div>
  );
}

// ── Donut for risk distribution ───────────────────────────────────────────────
function RiskDonut({ dist }) {
  const items = [
    { label: "Normal",   value: dist?.NORMAL   || 0, color: "#10b981", cls: "bg-emerald-500" },
    { label: "Watch",    value: dist?.WATCH    || 0, color: "#3b82f6", cls: "bg-blue-500" },
    { label: "Medium",   value: dist?.MEDIUM   || 0, color: "#f59e0b", cls: "bg-amber-500" },
    { label: "High",     value: dist?.HIGH     || 0, color: "#f97316", cls: "bg-orange-500" },
    { label: "Critical", value: dist?.CRITICAL || 0, color: "#ef4444", cls: "bg-red-500" },
  ];

  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  let offset = 0;

  const slices = items.map(item => {
    const pct = item.value / total;
    const slice = { ...item, pct, offset };
    offset += pct;
    return slice;
  });

  // SVG donut via conic-gradient trick (CSS only)
  const gradient = slices
    .map(s => `${s.color} ${(s.offset * 360).toFixed(1)}deg ${((s.offset + s.pct) * 360).toFixed(1)}deg`)
    .join(", ");

  return (
    <div className="flex items-center gap-8">
      <div
        className="relative h-32 w-32 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="absolute inset-5 rounded-full bg-white" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-lg font-semibold text-slate-900">{total.toLocaleString()}</p>
          <p className="text-[9px] text-slate-400">parcels</p>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {items.map(item => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${item.cls}`} />
              <span className="text-slate-600">{item.label}</span>
            </div>
            <span className="font-medium text-slate-800">
              {item.value.toLocaleString()}
              <span className="ml-1 text-slate-400 font-normal">
                ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Analytics() {
  const [riskDist,    setRiskDist]    = useState(null);
  const [facilities,  setFacilities]  = useState([]);
  const [routes,      setRoutes]      = useState([]);
  const [trend,       setTrend]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [days,        setDays]        = useState(7);

  const loadAll = async () => {
    setLoading(true);
    const [distRes, facRes, routeRes, trendRes] = await Promise.allSettled([
      dashboardAPI.riskDistribution(),
      dashboardAPI.facilityAnomalies(),
      dashboardAPI.routePerformance(),
      dashboardAPI.riskTrend(days),
    ]);
    const ok = (r) => (r.status === "fulfilled" ? r.value.data.data : (console.error(r.reason), null));
    setRiskDist(ok(distRes) || { NORMAL: 0, WATCH: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 });
    setFacilities(ok(facRes) || []);
    setRoutes(ok(routeRes) || []);
    setTrend(ok(trendRes) || []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [days]);

  const maxParcels = Math.max(...routes.map(r => r.totalParcels), 1);

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-auto p-7">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Analytics</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Risk intelligence across your parcel network
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:outline-none"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>

          <button
            onClick={loadAll}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Row 1: Risk distribution + Risk trend */}
      <div className="grid gap-5 xl:grid-cols-2">

        <Section
          title="Risk distribution"
          subtitle="Parcel severity breakdown across the network"
          loading={loading}
        >
          {riskDist
            ? <RiskDonut dist={riskDist} />
            : <p className="py-4 text-center text-xs text-slate-400">Loading…</p>
          }
        </Section>

        <Section
          title="Risk score trend"
          subtitle={`Average and max risk scores over the last ${days} days`}
          loading={loading}
        >
          <TrendChart data={trend} />
        </Section>

      </div>

      {/* Row 2: Route performance */}
      <div className="mt-5">
        <Section
          title="Route performance"
          subtitle="Delivery rate and parcel volume by route"
          loading={loading}
        >
          {routes.length === 0 && !loading && (
            <p className="py-4 text-center text-xs text-slate-400">No route data</p>
          )}

          <div className="space-y-5">
            {routes.map(route => (
              <div key={route.routeId} className="rounded-xl border border-slate-100 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{route.routeCode}</p>
                    <p className="text-xs text-slate-500">{route.name}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Delivery rate</p>
                      <p className={`text-lg font-semibold ${route.deliveryRate >= 80 ? "text-emerald-600" : route.deliveryRate >= 60 ? "text-amber-600" : "text-red-600"}`}>
                        {route.deliveryRate}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Total parcels</p>
                      <p className="text-lg font-semibold text-slate-900">{route.totalParcels.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { label: "Delivered", value: route.delivered, color: "bg-emerald-500" },
                    { label: "At risk",   value: route.atRisk,    color: "bg-orange-500" },
                    { label: "Delayed",   value: route.delayed,   color: "bg-amber-500" },
                    { label: "In transit",value: route.totalParcels - route.delivered - route.atRisk - route.delayed, color: "bg-blue-500" },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-lg bg-slate-50 px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span className={`h-1.5 w-1.5 rounded-full ${stat.color}`} />
                        {stat.label}
                      </div>
                      <p className="mt-1 text-base font-semibold text-slate-900">
                        {Math.max(stat.value, 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Row 3: Facility anomalies */}
      <div className="mt-5">
        <Section
          title="Facility anomalies"
          subtitle="Facilities ranked by anomaly alerts and high-risk parcel count"
          loading={loading}
        >
          {facilities.length === 0 && !loading && (
            <p className="py-4 text-center text-xs text-slate-400">No facility data</p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-left text-xs font-semibold text-slate-500">Facility</th>
                  <th className="pb-3 text-right text-xs font-semibold text-slate-500">Anomaly alerts</th>
                  <th className="pb-3 text-right text-xs font-semibold text-slate-500">High-risk parcels</th>
                  <th className="pb-3 text-right text-xs font-semibold text-slate-500">Health</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {facilities.map(f => {
                  const score = f.anomalyAlerts + f.highRiskParcels;
                  const health = score === 0 ? "Normal" : score <= 2 ? "Watch" : score <= 5 ? "At risk" : "Critical";
                  const healthColor = {
                    Normal:   "bg-emerald-50 text-emerald-700",
                    Watch:    "bg-blue-50 text-blue-700",
                    "At risk":"bg-amber-50 text-amber-700",
                    Critical: "bg-red-50 text-red-700",
                  }[health];

                  return (
                    <tr key={f.facilityId} className="hover:bg-slate-50">
                      <td className="py-3">
                        <p className="font-medium text-slate-900">{f.code}</p>
                        <p className="text-xs text-slate-400">{f.name} · {f.city}</p>
                      </td>
                      <td className="py-3 text-right">
                        <span className={`text-sm font-semibold ${f.anomalyAlerts > 0 ? "text-orange-600" : "text-slate-400"}`}>
                          {f.anomalyAlerts}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className={`text-sm font-semibold ${f.highRiskParcels > 0 ? "text-red-600" : "text-slate-400"}`}>
                          {f.highRiskParcels}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${healthColor}`}>
                          {health}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

    </section>
  );
}
