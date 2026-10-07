import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Package, AlertTriangle, ChevronDown, RefreshCw } from "lucide-react";
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

export default function Parcels() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
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
    } catch (err) {
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
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
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
                <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                  Loading parcels…
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                  No parcels found
                </td>
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
                    <span className="font-medium text-slate-900">
                      {parcel.trackingNumber}
                    </span>
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

                <td className="px-5 py-3.5 text-slate-500 capitalize">
                  {parcel.currentState?.toLowerCase().replace(/_/g, " ") || "—"}
                </td>

                <td className="px-5 py-3.5 text-slate-400 text-xs">
                  {new Date(parcel.updatedAt).toLocaleString("en-IN", {
                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400">Tracking number</p>
                <h2 className="mt-0.5 text-lg font-semibold text-slate-900">
                  {selected.trackingNumber}
                </h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[selected.status] || "bg-slate-100 text-slate-600"}`}>
                {STATUS_LABELS[selected.status] || selected.status}
              </span>
            </div>

            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              <Row label="Current facility" value={selected.currentFacilityId ? `${selected.currentFacilityId.code} — ${selected.currentFacilityId.name}` : "—"} />
              <Row label="Current state" value={selected.currentState?.toLowerCase().replace(/_/g, " ") || "—"} />
              <Row label="Route" value={selected.routeId?.routeCode || "—"} />
              <Row label="Expected delivery" value={selected.expectedDeliveryTime ? new Date(selected.expectedDeliveryTime).toLocaleDateString("en-IN") : "—"} />
              <Row label="Last updated" value={new Date(selected.updatedAt).toLocaleString("en-IN")} />
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-5 w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-right text-xs font-medium text-slate-800 capitalize">{value}</span>
    </div>
  );
}