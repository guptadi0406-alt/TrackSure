import { useState, useEffect } from "react";
import {
  Bell, LayoutDashboard, Package, Map, BarChart3,
  Settings, ArrowUpRight, Clock3, Building2, Route,
  AlertTriangle, AlertCircle, ArrowRight, LogOut, RefreshCw, FileSearch,
} from "lucide-react";

import { useAuth } from "./context/AuthContext";
import { dashboardAPI } from "./services/api";
import Login from "./pages/Login";
import Parcels from "./pages/Parcels";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import Facilities from "./pages/Facilities";
import Routes from "./pages/Routes";
import Investigations from "./pages/Investigations";

// ── small helpers ──────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconBg, trend, trendLabel }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {value ?? <span className="text-slate-300">—</span>}
          </p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={18} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <ArrowUpRight size={14} className="text-emerald-600" />
          <span className="font-medium text-emerald-600">{trend}</span>
          <span className="text-slate-400">{trendLabel}</span>
        </div>
      )}
      {trend === undefined && trendLabel && (
        <div className="mt-4 text-xs text-slate-400">{trendLabel}</div>
      )}
    </div>
  );
}

// ── Dashboard overview (connected) ────────────────────
function Overview() {
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewRes, alertsRes] = await Promise.all([
          dashboardAPI.overview(),
          dashboardAPI.recentAlerts(5),
        ]);
        setData(overviewRes.data.data);
        setAlerts(alertsRes.data.data || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const p = data?.parcels || {};
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const SEVERITY_ICON = {
    CRITICAL: <AlertCircle size={17} className="text-red-600" />,
    HIGH:     <AlertCircle size={17} className="text-orange-600" />,
    MEDIUM:   <AlertTriangle size={17} className="text-amber-600" />,
    WATCH:    <AlertTriangle size={17} className="text-blue-600" />,
  };
  const SEVERITY_BG = {
    CRITICAL: "bg-red-50",
    HIGH:     "bg-orange-50",
    MEDIUM:   "bg-amber-50",
    WATCH:    "bg-blue-50",
  };
  const SEVERITY_BADGE = {
    CRITICAL: "bg-red-50 text-red-600",
    HIGH:     "bg-orange-50 text-orange-600",
    MEDIUM:   "bg-amber-50 text-amber-700",
    WATCH:    "bg-blue-50 text-blue-700",
  };

  return (
    <section className="flex-1 overflow-auto p-7">
      <div className="mb-7">
        <p className="text-sm text-slate-500">{today}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Operations Overview
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total parcels"
          value={loading ? null : p.total?.toLocaleString()}
          icon={Package}
          iconBg="bg-slate-100 text-slate-600"
        />
        <StatCard
          label="In transit"
          value={loading ? null : p.inTransit?.toLocaleString()}
          icon={Map}
          iconBg="bg-blue-50 text-blue-600"
          trendLabel={p.total ? `${((p.inTransit / p.total) * 100).toFixed(1)}% of total` : ""}
        />
        <StatCard
          label="Delayed"
          value={loading ? null : p.delayed?.toLocaleString()}
          icon={Clock3}
          iconBg="bg-amber-50 text-amber-600"
          trendLabel={p.total ? `${((p.delayed / p.total) * 100).toFixed(1)}% of total` : ""}
        />
        <StatCard
          label="At risk"
          value={loading ? null : p.atRisk?.toLocaleString()}
          icon={AlertTriangle}
          iconBg="bg-red-50 text-red-600"
          trendLabel={p.critical ? `${p.critical} critical` : ""}
        />
      </div>

      {/* Recent alerts */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Recent alerts</h2>
            <p className="mt-0.5 text-xs text-slate-500">Latest anomalies detected by the risk engine</p>
          </div>
          {loading && <RefreshCw size={14} className="animate-spin text-slate-400" />}
        </div>

        <div className="divide-y divide-slate-100">
          {!loading && alerts.length === 0 && (
            <p className="px-5 py-6 text-sm text-slate-400">No recent alerts.</p>
          )}
          {alerts.map((alert) => (
            <div key={alert._id} className="flex items-center gap-4 px-5 py-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${SEVERITY_BG[alert.severity] || "bg-slate-100"}`}>
                {SEVERITY_ICON[alert.severity] || <AlertTriangle size={17} className="text-slate-500" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-900">
                    {alert.parcelId?.trackingNumber || "—"}
                  </p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${SEVERITY_BADGE[alert.severity] || "bg-slate-100 text-slate-500"}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{alert.message}</p>
              </div>

              <div className="text-right">
                <p className="text-xs font-medium text-slate-700 capitalize">
                  {alert.type?.replace(/_/g, " ").toLowerCase()}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">{alert.status}</p>
              </div>

              <ArrowRight size={15} className="text-slate-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Delivery stats */}
      {data && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium text-slate-500">Delivered</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{p.delivered?.toLocaleString()}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.total ? (p.delivered / p.total * 100) : 0}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">{p.total ? ((p.delivered / p.total) * 100).toFixed(1) : 0}% delivery rate</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium text-slate-500">Open alerts</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{data.alerts?.open?.toLocaleString()}</p>
            <p className="mt-3 text-[11px] text-slate-400">Awaiting review or action</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium text-slate-500">Recovered</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{p.recovered?.toLocaleString()}</p>
            <p className="mt-3 text-[11px] text-slate-400">Parcels recovered after investigation</p>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Placeholder pages ──────────────────────────────────
function PlaceholderPage({ title, description }) {
  return (
    <section className="flex-1 p-7">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-400">Coming soon.</p>
      </div>
    </section>
  );
}

// ── Main shell ─────────────────────────────────────────
export default function App() {
  const { user, logout, isLoggedIn } = useAuth();
  const [activePage, setActivePage] = useState("overview");

  if (!isLoggedIn) return <Login />;

  const NAV = [
    { id: "overview",        label: "Overview",        icon: LayoutDashboard },
    { id: "parcels",         label: "Parcels",         icon: Package },
    { id: "alerts",          label: "Alerts",          icon: Bell },
    { id: "investigations",  label: "Investigations",  icon: FileSearch },
    { id: "facilities",      label: "Facilities",      icon: Building2 },
    { id: "routes",          label: "Routes",          icon: Route },
    { id: "analytics",       label: "Analytics",       icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
          <div className="flex h-16 items-center border-b border-slate-200 px-6">
            <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              TS
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">TrackSure</h1>
              <p className="text-[11px] text-slate-500">Parcel Operations</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-5">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Workspace</p>
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  activePage === id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={17} strokeWidth={1.8} />
                {label}
              </button>
            ))}

            <div className="my-5 border-t border-slate-100" />
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">System</p>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100">
              <Settings size={17} strokeWidth={1.8} /> Settings
            </button>
          </nav>

          {/* User */}
          <div className="border-t border-slate-200 p-3">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-800">{user?.name}</p>
                <p className="text-[11px] text-slate-500">{user?.role}</p>
              </div>
              <button onClick={logout} title="Sign out">
                <LogOut size={15} className="text-slate-400 hover:text-slate-700" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-7">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {NAV.find(n => n.id === activePage)?.label || "Operations"}
              </h2>
              <p className="text-xs text-slate-500">TrackSure · Parcel Intelligence Platform</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setActivePage("alerts")} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <Bell size={18} strokeWidth={1.8} />
              </button>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          </header>

          {activePage === "overview"       && <Overview />}
          {activePage === "parcels"        && <Parcels />}
          {activePage === "alerts"         && <Alerts />}
          {activePage === "investigations" && <Investigations />}
          {activePage === "facilities"     && <Facilities />}
          {activePage === "routes"         && <Routes />}
          {activePage === "analytics"      && <Analytics />}
        </main>
      </div>
    </div>
  );
}
