import { useState, useEffect } from "react";
import {
  Search, RefreshCw, FileSearch, X, ChevronRight, Plus, CheckCircle
} from "lucide-react";
import { investigationAPI, parcelAPI } from "../services/api";

const STATUS_STYLES = {
  OPEN:         "bg-red-50 text-red-700 border-red-100",
  INVESTIGATING:"bg-amber-50 text-amber-700 border-amber-100",
  RECOVERED:    "bg-emerald-50 text-emerald-700 border-emerald-100",
  NOT_FOUND:    "bg-slate-50 text-slate-600 border-slate-200",
  CLOSED:       "bg-slate-50 text-slate-400 border-slate-100",
};

const REASONS = [
  "MIS_SORTED", "STUCK_IN_FACILITY", "MISSING_SCAN", "WRONG_ROUTE", "DAMAGED", "UNKNOWN"
];

function InvestigationDetail({ inv, onClose, onUpdated }) {
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(inv.status);
  const [newNotes, setNewNotes] = useState(inv.notes || "");

  const save = async () => {
    setUpdating(true);
    try {
      await investigationAPI.update(inv._id, { status: newStatus, notes: newNotes });
      onUpdated();
      onClose();
    } catch { /* ignore */ }
    finally { setUpdating(false); }
  };

  const close = async () => {
    setUpdating(true);
    try {
      await investigationAPI.close(inv._id, { notes: newNotes });
      onUpdated();
      onClose();
    } catch { /* ignore */ }
    finally { setUpdating(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Investigation</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">
              {inv.parcelId?.trackingNumber || "Unknown Parcel"}
            </h2>
            <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${STATUS_STYLES[inv.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {inv.status}
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
          {/* Meta */}
          <div className="rounded-xl bg-slate-50 p-4 space-y-2.5">
            {[
              ["Reason",     inv.reason?.replace(/_/g, " ") || "—"],
              ["Started At", inv.startedAt ? new Date(inv.startedAt).toLocaleString("en-IN") : "—"],
              ["Parcel",     inv.parcelId?.trackingNumber || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-slate-400">{k}</span>
                <span className="font-medium text-slate-800 capitalize">{v?.toString().toLowerCase()}</span>
              </div>
            ))}
          </div>

          {/* Update status */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">Update Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
            >
              {["OPEN","INVESTIGATING","RECOVERED","NOT_FOUND","CLOSED"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">Notes</label>
            <textarea
              rows={4}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none resize-none"
              placeholder="Add investigation notes…"
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-slate-100 px-6 py-4">
          <button
            onClick={save}
            disabled={updating}
            className="flex-1 rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {updating ? "Saving…" : "Save Changes"}
          </button>
          {inv.status !== "CLOSED" && (
            <button
              onClick={close}
              disabled={updating}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateModal({ onClose, onCreated }) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [reason, setReason] = useState("UNKNOWN");
  const [notes, setNotes]   = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const submit = async () => {
    setError("");
    setSaving(true);
    try {
      const parcelRes = await parcelAPI.getByTracking(trackingNumber.trim());
      const parcelId = parcelRes.data.data?._id;
      if (!parcelId) throw new Error("Parcel not found");
      await investigationAPI.create({ parcelId, reason, notes });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create investigation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-semibold text-slate-900">New Investigation</h2>
        <p className="mt-0.5 text-xs text-slate-400 mb-5">Open a new parcel investigation</p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Tracking Number</label>
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. TRK-000042"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes…"
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={submit}
            disabled={saving || !trackingNumber.trim()}
            className="flex-1 rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create Investigation"}
          </button>
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Investigations() {
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await investigationAPI.list(params);
      setInvestigations(data.data || []);
    } catch { setInvestigations([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const filtered = investigations.filter((inv) =>
    inv.parcelId?.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
    inv.reason?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col p-7">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Investigations</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {loading ? "Loading…" : `${filtered.length} investigations`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            <Plus size={14} /> New
          </button>
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tracking #…"
            className="rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5">
          {["", "OPEN", "INVESTIGATING", "RECOVERED", "CLOSED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                statusFilter === s
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s === "" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading && (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <RefreshCw size={24} className="animate-spin" />
        </div>
      )}

      <div className="space-y-2.5 overflow-auto">
        {!loading && filtered.map((inv) => (
          <button
            key={inv._id}
            onClick={() => setSelected(inv)}
            className={`group flex w-full items-center gap-4 rounded-xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md ${STATUS_STYLES[inv.status] || "border-slate-200"}`}
          >
            <FileSearch size={20} className="shrink-0 opacity-70" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">
                  {inv.parcelId?.trackingNumber || "—"}
                </p>
                <span className="text-[11px] opacity-60 capitalize">
                  {inv.reason?.replace(/_/g, " ").toLowerCase() || "—"}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] opacity-60">
                {inv.notes ? inv.notes.slice(0, 80) + (inv.notes.length > 80 ? "…" : "") : "No notes"}
              </p>
              <p className="mt-1 text-[10px] opacity-40">
                {inv.startedAt ? new Date(inv.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${STATUS_STYLES[inv.status]}`}>
                {inv.status}
              </span>
              <ChevronRight size={16} className="text-current opacity-40 transition group-hover:opacity-70" />
            </div>
          </button>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <CheckCircle size={36} className="mb-3 opacity-30" />
          <p className="text-sm">No investigations for this filter</p>
        </div>
      )}

      {selected && (
        <InvestigationDetail
          inv={selected}
          onClose={() => setSelected(null)}
          onUpdated={load}
        />
      )}

      {creating && (
        <CreateModal
          onClose={() => setCreating(false)}
          onCreated={load}
        />
      )}
    </section>
  );
}
