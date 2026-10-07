import { useState } from "react";
import {
  Bell,
  LayoutDashboard,
  Package,
  Map,
  BarChart3,
  Settings,
  ChevronDown,
  ArrowUpRight,
  Clock3,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Parcels from "./pages/Parcels";
export default function App() {
   const [activePage, setActivePage] = useState("overview");
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">

          {/* Brand */}
          <div className="flex h-16 items-center border-b border-slate-200 px-6">
            <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              TS
            </div>

            <div>
              <h1 className="text-sm font-semibold tracking-tight">
                TrackSure
              </h1>
              <p className="text-[11px] text-slate-500">
                Parcel Operations
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5">

            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </p>

            <button
  onClick={() => setActivePage("overview")}
  className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    activePage === "overview"
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100"
  }`}
>
              <LayoutDashboard size={17} strokeWidth={1.8} />
              Overview
            </button>

          <button
  onClick={() => setActivePage("parcels")}
  className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    activePage === "parcels"
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100"
  }`}
>
  <Package size={17} strokeWidth={1.8} />
  Parcels
</button>

            <button
  onClick={() => setActivePage("alerts")}
  className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    activePage === "alerts"
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100"
  }`}
>
              <Bell size={17} strokeWidth={1.8} />
              Alerts

              <span className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                12
              </span>
            </button>

           <button
  onClick={() => setActivePage("live-map")}
  className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    activePage === "live-map"
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100"
  }`}
>
  <Map size={17} strokeWidth={1.8} />
  Live Map
</button>

            <button
  onClick={() => setActivePage("analytics")}
  className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    activePage === "analytics"
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100"
  }`}
>
  <BarChart3 size={17} strokeWidth={1.8} />
  Analytics
</button>

            <div className="my-5 border-t border-slate-100" />

            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              System
            </p>

           <button
  onClick={() => setActivePage("settings")}
  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100`}
>
  <Settings size={17} strokeWidth={1.8} />
  Settings
</button>
          </nav>

          {/* Current hub */}
          <div className="border-t border-slate-200 p-3">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                HB
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-800">
                  Hubli Bypass
                </p>
                <p className="text-[11px] text-slate-500">
                  Operations
                </p>
              </div>

              <ChevronDown size={15} className="text-slate-400" />
            </div>
          </div>

        </aside>

        {/* Main area */}
        <main className="flex min-w-0 flex-1 flex-col">

          {/* Topbar */}
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-7">

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Operations Overview
              </h2>

              <p className="text-xs text-slate-500">
                Monitor parcel movement across Hubli
              </p>
            </div>

            <div className="flex items-center gap-4">

              <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <Bell size={18} strokeWidth={1.8} />

                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
              </button>

              <div className="h-6 w-px bg-slate-200" />

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                  OP
                </div>

                <div className="hidden sm:block">
                  <p className="text-xs font-medium text-slate-800">
                    Operator
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Hubli Operations
                  </p>
                </div>
              </div>

            </div>
          </header>

         {/* Page content */}
{activePage === "overview" && (
  <section className="flex-1 p-7">

            <div className="mb-7">
              <p className="text-sm text-slate-500">
                Wednesday, 7 October 2026
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                Good afternoon.
              </h1>
            </div>

          

            {/* Overview metrics */}
<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">
          Total parcels
        </p>

        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          52,340
        </p>
      </div>

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
        <Package size={18} className="text-slate-600" />
      </div>
    </div>

    <div className="mt-4 flex items-center gap-1.5 text-xs">
      <ArrowUpRight size={14} className="text-emerald-600" />

      <span className="font-medium text-emerald-600">
        8.2%
      </span>

      <span className="text-slate-400">
        from yesterday
      </span>
    </div>
  </div>


  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">
          In transit
        </p>

        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          41,290
        </p>
      </div>

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
        <Map size={18} className="text-blue-600" />
      </div>
    </div>

    <div className="mt-4 text-xs text-slate-400">
      78.9% of today's parcels
    </div>
  </div>


  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">
          Delayed
        </p>

        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          2,814
        </p>
      </div>

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
        <Clock3 size={18} className="text-amber-600" />
      </div>
    </div>

    <div className="mt-4 text-xs text-slate-400">
      5.4% of today's parcels
    </div>
  </div>


  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">
          At risk
        </p>

        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          487
        </p>
      </div>

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
      <AlertTriangle size={18} className="text-red-600" />
      </div>
    </div>

    <div className="mt-4 text-xs">
      <span className="font-medium text-red-600">
        118 critical
      </span>

      <span className="ml-1 text-slate-400">
        require attention
      </span>
    </div>
  </div>

</div>


<div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">

  {/* Critical alerts */}
  <div className="rounded-xl border border-slate-200 bg-white">

    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Critical alerts
        </h2>

        <p className="mt-0.5 text-xs text-slate-500">
          Parcels that need attention
        </p>
      </div>

      <button className="text-xs font-medium text-slate-500 hover:text-slate-900">
        View all
      </button>

    </div>


    <div className="divide-y divide-slate-100">

      {/* Alert 1 */}
      <div className="flex items-center gap-4 px-5 py-4">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
          <AlertCircle size={17} className="text-red-600" />
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-900">
              P10042
            </p>

            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
              High
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Excessive dwell time at Hubli Bypass
          </p>

        </div>

        <div className="text-right">
          <p className="text-xs font-medium text-slate-700">
            4h 12m
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            beyond expected
          </p>
        </div>

        <ArrowRight size={15} className="text-slate-300" />

      </div>


      {/* Alert 2 */}
      <div className="flex items-center gap-4 px-5 py-4">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
          <AlertCircle size={17} className="text-red-600" />
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-900">
              P10218
            </p>

            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
              High
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Expected dispatch scan is missing
          </p>

        </div>

        <div className="text-right">
          <p className="text-xs font-medium text-slate-700">
            2h 48m
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            overdue
          </p>
        </div>

        <ArrowRight size={15} className="text-slate-300" />

      </div>


      {/* Alert 3 */}
      <div className="flex items-center gap-4 px-5 py-4">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
          <AlertTriangle size={17} className="text-amber-600" />
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-900">
              P10491
            </p>

            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
              Medium
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Route deviation detected
          </p>

        </div>

        <div className="text-right">
          <p className="text-xs font-medium text-slate-700">
            1h 36m
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            since last scan
          </p>
        </div>

        <ArrowRight size={15} className="text-slate-300" />

      </div>

    </div>

  </div>


  {/* Recent parcel activity */}
  <div className="rounded-xl border border-slate-200 bg-white">

    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Recent parcel activity
        </h2>

        <p className="mt-0.5 text-xs text-slate-500">
          Latest scan events
        </p>
      </div>

      <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Live
      </span>

    </div>


    <div className="divide-y divide-slate-100">

      <div className="flex items-center gap-3 px-5 py-3.5">

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50">
          <Package size={15} className="text-emerald-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-800">
            P10382
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Arrived at Hubli Bypass
          </p>
        </div>

        <span className="text-[10px] text-slate-400">
          2 min ago
        </span>

      </div>


      <div className="flex items-center gap-3 px-5 py-3.5">

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
          <Package size={15} className="text-blue-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-800">
            P10381
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Sorting completed
          </p>
        </div>

        <span className="text-[10px] text-slate-400">
          5 min ago
        </span>

      </div>


      <div className="flex items-center gap-3 px-5 py-3.5">

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
          <Package size={15} className="text-slate-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-800">
            P10379
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Dispatched towards Pune
          </p>
        </div>

        <span className="text-[10px] text-slate-400">
          8 min ago
        </span>

      </div>


      <div className="flex items-center gap-3 px-5 py-3.5">

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50">
          <Clock3 size={15} className="text-amber-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-800">
            P10376
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Sorting in progress
          </p>
        </div>

        <span className="text-[10px] text-slate-400">
          11 min ago
        </span>

      </div>

    </div>

  </div>

</div>

{/* Movement overview */}
<div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">

  {/* Scan activity */}
  <div className="rounded-xl border border-slate-200 bg-white">

    <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">

      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Parcel movement
        </h2>

        <p className="mt-0.5 text-xs text-slate-500">
          Scan activity across the last 24 hours
        </p>
      </div>

      <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-500">
        Last 24h
        <ChevronDown size={13} />
      </div>

    </div>


    <div className="px-5 pb-5 pt-6">

      {/* Chart */}
      <div className="flex h-52 gap-3">

        {/* Y-axis */}
        <div className="flex w-10 flex-col justify-between pb-5 text-right text-[10px] text-slate-400">
          <span>1.2k</span>
          <span>900</span>
          <span>600</span>
          <span>300</span>
          <span>0</span>
        </div>


        {/* Graph */}
        <div className="relative flex flex-1 items-end justify-between gap-2 border-b border-l border-slate-200 pb-5">

          {/* horizontal guides */}
          <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-slate-100" />
          <div className="pointer-events-none absolute inset-x-0 top-1/4 border-t border-dashed border-slate-100" />
          <div className="pointer-events-none absolute inset-x-0 top-2/4 border-t border-dashed border-slate-100" />
          <div className="pointer-events-none absolute inset-x-0 top-3/4 border-t border-dashed border-slate-100" />


          {/* bars */}
          <div className="group flex h-full flex-1 items-end">
            <div className="mx-auto w-full max-w-8 rounded-t bg-slate-200 transition group-hover:bg-slate-300" style={{ height: "34%" }} />
          </div>

          <div className="group flex h-full flex-1 items-end">
            <div className="mx-auto w-full max-w-8 rounded-t bg-slate-200 transition group-hover:bg-slate-300" style={{ height: "42%" }} />
          </div>

          <div className="group flex h-full flex-1 items-end">
            <div className="mx-auto w-full max-w-8 rounded-t bg-slate-300 transition group-hover:bg-slate-400" style={{ height: "51%" }} />
          </div>

          <div className="group flex h-full flex-1 items-end">
            <div className="mx-auto w-full max-w-8 rounded-t bg-slate-300 transition group-hover:bg-slate-400" style={{ height: "63%" }} />
          </div>

          <div className="group flex h-full flex-1 items-end">
            <div className="mx-auto w-full max-w-8 rounded-t bg-slate-300 transition group-hover:bg-slate-400" style={{ height: "57%" }} />
          </div>

          <div className="group flex h-full flex-1 items-end">
            <div className="mx-auto w-full max-w-8 rounded-t bg-blue-500 transition group-hover:bg-blue-600" style={{ height: "78%" }} />
          </div>

          <div className="group flex h-full flex-1 items-end">
            <div className="mx-auto w-full max-w-8 rounded-t bg-blue-500 transition group-hover:bg-blue-600" style={{ height: "88%" }} />
          </div>

          <div className="group flex h-full flex-1 items-end">
            <div className="mx-auto w-full max-w-8 rounded-t bg-blue-500 transition group-hover:bg-blue-600" style={{ height: "72%" }} />
          </div>

          <div className="group flex h-full flex-1 items-end">
            <div className="mx-auto w-full max-w-8 rounded-t bg-slate-300 transition group-hover:bg-slate-400" style={{ height: "61%" }} />
          </div>

          <div className="group flex h-full flex-1 items-end">
            <div className="mx-auto w-full max-w-8 rounded-t bg-slate-300 transition group-hover:bg-slate-400" style={{ height: "69%" }} />
          </div>

          <div className="group flex h-full flex-1 items-end">
            <div className="mx-auto w-full max-w-8 rounded-t bg-slate-300 transition group-hover:bg-slate-400" style={{ height: "54%" }} />
          </div>

          <div className="group flex h-full flex-1 items-end">
            <div className="mx-auto w-full max-w-8 rounded-t bg-slate-200 transition group-hover:bg-slate-300" style={{ height: "46%" }} />
          </div>

        </div>

      </div>


      {/* X-axis */}
      <div className="ml-10 flex justify-between pt-2 text-[10px] text-slate-400">
        <span>00:00</span>
        <span>04:00</span>
        <span>08:00</span>
        <span>12:00</span>
        <span>16:00</span>
        <span>20:00</span>
        <span>Now</span>
      </div>


      <div className="mt-5 flex items-center gap-5 text-[11px] text-slate-500">

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Scan events
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          Normal volume
        </div>

      </div>

    </div>

  </div>


  {/* Hub status */}
  <div className="rounded-xl border border-slate-200 bg-white">

    <div className="border-b border-slate-100 px-5 py-4">
      <h2 className="text-sm font-semibold text-slate-900">
        Hub status
      </h2>

      <p className="mt-0.5 text-xs text-slate-500">
        Current sorting operations
      </p>
    </div>


    <div className="divide-y divide-slate-100">

      {/* Hubli */}
      <div className="px-5 py-4">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-sm font-medium text-slate-800">
              Hubli Bypass
            </span>
          </div>

          <span className="text-[10px] font-medium text-emerald-600">
            Normal
          </span>

        </div>

        <div className="mt-3 flex justify-between text-[11px]">
          <span className="text-slate-400">
            Active parcels
          </span>

          <span className="font-medium text-slate-700">
            18,420
          </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: "68%" }}
          />
        </div>

      </div>


      {/* Gokul Road */}
      <div className="px-5 py-4">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-sm font-medium text-slate-800">
              Gokul Road
            </span>
          </div>

          <span className="text-[10px] font-medium text-emerald-600">
            Normal
          </span>

        </div>

        <div className="mt-3 flex justify-between text-[11px]">
          <span className="text-slate-400">
            Active parcels
          </span>

          <span className="font-medium text-slate-700">
            12,860
          </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: "52%" }}
          />
        </div>

      </div>


      {/* Exceptions */}
      <div className="px-5 py-4">

        <div className="flex items-center gap-2.5">

          <span className="h-2 w-2 rounded-full bg-amber-500" />

          <span className="text-sm font-medium text-slate-800">
            Sorting exceptions
          </span>

        </div>

        <div className="mt-3 flex items-end justify-between">

          <div>
            <p className="text-xl font-semibold tracking-tight text-slate-900">
              37
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400">
              parcels awaiting review
            </p>
          </div>

          <button className="text-xs font-medium text-slate-500 hover:text-slate-900">
            Review
          </button>

        </div>

      </div>

    </div>

  </div>

</div>

          </section>
)}

{activePage === "parcels" && <Parcels />}

{activePage === "alerts" && (
  <section className="flex-1 p-7">
    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
      Alerts
    </h1>

    <p className="mt-1 text-sm text-slate-500">
      Monitor parcels that need attention.
    </p>

    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-sm text-slate-600">
        Alert management will be available here.
      </p>
    </div>
  </section>
)}

{activePage === "live-map" && (
  <section className="flex-1 p-7">
    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
      Live Map
    </h1>

    <p className="mt-1 text-sm text-slate-500">
      Monitor parcel movement across the network.
    </p>

    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-sm text-slate-600">
        Live map will be available here.
      </p>
    </div>
  </section>
)}

{activePage === "analytics" && (
  <section className="flex-1 p-7">
    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
      Analytics
    </h1>

    <p className="mt-1 text-sm text-slate-500">
      Analyze parcel and hub performance.
    </p>

    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-sm text-slate-600">
        Analytics will be available here.
      </p>
    </div>
  </section>
)}

{activePage === "settings" && (
  <section className="flex-1 p-7">
    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
      Settings
    </h1>

    <p className="mt-1 text-sm text-slate-500">
      Manage application settings.
    </p>

    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-sm text-slate-600">
        Settings will be available here.
      </p>
    </div>
  </section>
)}

        </main>

      </div>
    </div>
  );
}
