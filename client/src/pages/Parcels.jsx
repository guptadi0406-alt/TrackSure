import {
  Download,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Package,
} from "lucide-react";

import { useState } from "react";

const parcels = [
  {
    id: "P10382",
    origin: "Bengaluru",
    destination: "Pune",
    status: "In transit",
    lastScan: "Hubli Bypass",
    time: "2 min ago",
  },
  {
    id: "P10381",
    origin: "Mumbai",
    destination: "Bengaluru",
    status: "Sorting",
    lastScan: "Gokul Road",
    time: "5 min ago",
  },
  {
    id: "P10379",
    origin: "Bengaluru",
    destination: "Mumbai",
    status: "In transit",
    lastScan: "Hubli Bypass",
    time: "8 min ago",
  },
  {
    id: "P10376",
    origin: "Pune",
    destination: "Bengaluru",
    status: "Delayed",
    lastScan: "Hubli Bypass",
    time: "11 min ago",
  },
  {
    id: "P10371",
    origin: "Bengaluru",
    destination: "Pune",
    status: "At risk",
    lastScan: "Gokul Road",
    time: "18 min ago",
  },
  {
    id: "P10368",
    origin: "Mumbai",
    destination: "Pune",
    status: "In transit",
    lastScan: "Hubli Bypass",
    time: "24 min ago",
  },
];

function StatusBadge({ status }) {
  const styles = {
    "In transit": "bg-blue-50 text-blue-600",
    Sorting: "bg-slate-100 text-slate-600",
    Delayed: "bg-amber-50 text-amber-600",
    "At risk": "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function Parcels() {
   const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [dateFilter, setDateFilter] = useState("Today");
  const [showDateFilter, setShowDateFilter] = useState(false);

 const [selectedParcel, setSelectedParcel] = useState(null);

 const handleSearchChange = (value) => {
  setSearch(value);
  setCurrentPage(1);
};

  const filteredParcels = parcels.filter((parcel) => {
    const matchesSearch =
      parcel.id.toLowerCase().includes(search.toLowerCase()) ||
      parcel.origin.toLowerCase().includes(search.toLowerCase()) ||
      parcel.destination.toLowerCase().includes(search.toLowerCase()) ||
      parcel.lastScan.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      parcel.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
    const parcelsPerPage = 3;

  const startIndex = (currentPage - 1) * parcelsPerPage;

  const displayedParcels = filteredParcels.slice(
    startIndex,
    startIndex + parcelsPerPage
  );

  
  return (
    <section className="flex-1 p-7">

      {/* Page heading */}
      <div className="flex items-start justify-between">

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Parcels
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Search and monitor parcels moving through the network.
          </p>
        </div>

        <button
  onClick={() => {
    const csv = [
      ["Parcel", "Origin", "Destination", "Status", "Last Scan", "Updated"],
      ...filteredParcels.map((parcel) => [
        parcel.id,
        parcel.origin,
        parcel.destination,
        parcel.status,
        parcel.lastScan,
        parcel.time,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "parcels.csv";
    link.click();

    URL.revokeObjectURL(url);
  }}
  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
>
  <Download size={15} />
  Export
</button>

      </div>


      {/* Search and filters */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">

        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

           <input
  type="text"
  placeholder="Search parcel ID, destination, or hub..."
  value={search}
 onChange={(e) => handleSearchChange(e.target.value)}
  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
/>
          </div>

        <button
  onClick={() => setShowFilters(!showFilters)}
  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
>
  <SlidersHorizontal size={15} />
  Filters
</button>
<div className="relative">
  <div className="relative">
  <button
    onClick={() => setShowDateFilter(!showDateFilter)}
    className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
  >
    {dateFilter}
    <ChevronDown size={14} />
  </button>

  {showDateFilter && (
    <div className="absolute right-0 z-20 mt-2 w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
      {["Today", "Yesterday", "Last 7 days"].map((date) => (
        <button
          key={date}
          onClick={() => {
            setDateFilter(date);
            setShowDateFilter(false);
          }}
          className="w-full rounded-md px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50"
        >
          {date}
        </button>
      ))}
    </div>
  )}
</div>

  {showDateFilter && (
    <div className="absolute right-0 z-20 mt-2 w-32 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
      {["Today", "Yesterday", "Last 7 days"].map((option) => (
        <button
          key={option}
          onClick={() => {
            setDateFilter(option);
            setShowDateFilter(false);
          }}
          className="w-full rounded-md px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50"
        >
          {option}
        </button>
      ))}
    </div>
  )}
</div>
        </div>
   
   </div>

{showFilters && (
  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
    <p className="mb-2 text-xs font-medium text-slate-600">
      Filter by status
    </p>

    <div className="flex flex-wrap gap-2">
      {["All", "In transit", "Sorting", "Delayed", "At risk"].map(
        (status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setShowFilters(false);
            }}
            className={`rounded-lg border px-3 py-2 text-xs font-medium ${
              statusFilter === status
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {status}
          </button>
        )
      )}
    </div>
  </div>
)}

{/* Status tabs */}
<div className="mt-4 flex items-center gap-6 border-b border-slate-100">
  
        {/* Status tabs */}
       <div className="mt-4 flex items-center gap-6 border-b border-slate-100">

  <button
    onClick={() => {
        setStatusFilter("All");
        setCurrentPage(1);
    }}
    className={`pb-3 text-xs font-medium ${
      statusFilter === "All"
        ? "border-b-2 border-slate-900 text-slate-900"
        : "text-slate-500 hover:text-slate-800"
    }`}
  >
    All parcels
    <span className="ml-2 text-slate-400">52,340</span>
  </button>

  <button
    onClick={() => {
        setStatusFilter("In transit");
        setCurrentPage(1);
    }}
    className={`pb-3 text-xs font-medium ${
      statusFilter === "In transit"
        ? "border-b-2 border-slate-900 text-slate-900"
        : "text-slate-500 hover:text-slate-800"
    }`}
  >
    In transit
  </button>

  <button
    onClick={() =>{
        setStatusFilter("Delayed");
     setCurrentPage(1);
    }}
    className={`pb-3 text-xs font-medium ${
      statusFilter === "Delayed"
        ? "border-b-2 border-slate-900 text-slate-900"
        : "text-slate-500 hover:text-slate-800"
    }`}
  >
    Delayed
  </button>

  <button
    onClick={() =>{
         setStatusFilter("At risk");
          setCurrentPage(1);
    }}
    className={`pb-3 text-xs font-medium ${
      statusFilter === "At risk"
        ? "border-b-2 border-slate-900 text-slate-900"
        : "text-slate-500 hover:text-slate-800"
    }`}
  >
    At risk
  </button>

</div>

      </div>


      {/* Parcel table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px] border-collapse">

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left">

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Parcel
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Origin
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Destination
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Status
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Last scan
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Updated
                </th>

              </tr>
            </thead>


            <tbody className="divide-y divide-slate-100">

              {displayedParcels.map((parcel) => (
             <tr
  key={parcel.id}
onClick={() => setSelectedParcel(parcel)}
  className="group cursor-pointer transition hover:bg-slate-50"
>

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                        <Package
                          size={15}
                          className="text-slate-500"
                        />
                      </div>

                      <span className="text-xs font-semibold text-slate-800">
                        {parcel.id}
                      </span>

                    </div>

                  </td>


                  <td className="px-5 py-4 text-xs text-slate-600">
                    {parcel.origin}
                  </td>


                  <td className="px-5 py-4 text-xs text-slate-600">
                    {parcel.destination}
                  </td>


                  <td className="px-5 py-4">
                    <StatusBadge status={parcel.status} />
                  </td>


                  <td className="px-5 py-4">

                    <p className="text-xs font-medium text-slate-700">
                      {parcel.lastScan}
                    </p>

                  </td>


                  <td className="px-5 py-4 text-xs text-slate-400">
                    {parcel.time}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">

          <p className="text-[11px] text-slate-400">
          Showing {startIndex + 1}-
{Math.min(startIndex + parcelsPerPage, filteredParcels.length)}
of {filteredParcels.length} parcels
          </p>

          <div className="flex items-center gap-1">

            <button
     onClick={() => setCurrentPage(currentPage - 1)}
     disabled={currentPage === 1}
     className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600 disabled:text-slate-300"
     >
      Previous
   </button>

    <button
     className="rounded-md bg-slate-900 px-2.5 py-1 text-[11px] text-white"
    >
    {currentPage}
   </button>

    <button
  onClick={() => setCurrentPage(currentPage + 1)}
  disabled={startIndex + parcelsPerPage >= filteredParcels.length}
  className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600 disabled:text-slate-300"
   >
  Next
</button>

          </div>

        </div>

      </div>


      {selectedParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-6">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Parcel
                </p>

                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {selectedParcel.id}
                </h2>
              </div>

              <button
                onClick={() => setSelectedParcel(null)}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">

              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">
                  Origin
                </span>
                <span className="text-sm font-medium text-slate-800">
                  {selectedParcel.origin}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">
                  Destination
                </span>
                <span className="text-sm font-medium text-slate-800">
                  {selectedParcel.destination}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">
                  Status
                </span>
                <StatusBadge status={selectedParcel.status} />
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">
                  Last scan
                </span>
                <span className="text-sm font-medium text-slate-800">
                  {selectedParcel.lastScan}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-slate-500">
                  Updated
                </span>
                <span className="text-sm font-medium text-slate-800">
                  {selectedParcel.time}
                </span>
              </div>

            </div>
          </div>
        </div>
      )}


    </section>
  );
}