import React from 'react';

export default function KitchensDashboard({ kitchens = [], filteredKitchens = [], kitchenQuery, setKitchenQuery, kitchenStatusFilter, setKitchenStatusFilter, loadKitchenDetail, actionKey }) {
  const list = filteredKitchens.length ? filteredKitchens : kitchens;
  return (
    <div className="cc-card-pad space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-[#F97316]">Kitchen Management</p>
          <h2 className="text-xl font-semibold text-[#1F2933]">Monitor activity and suspension</h2>
        </div>
        <input value={kitchenQuery} onChange={(e) => setKitchenQuery(e.target.value)} placeholder="Search kitchens..." className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[ ["all", "All"], ["pending", "Pending"], ["verified", "Verified"], ["rejected", "Rejected"] ].map(([value, label]) => (
          <button key={value} onClick={() => setKitchenStatusFilter(value)} className={`rounded-full px-3 py-1 text-sm font-semibold border ${kitchenStatusFilter === value ? "bg-[#F97316] text-[#1F2933] border-[#F97316]/50" : "bg-white/70 text-[#1F2933] border-black/5"}`}>{label}</button>
        ))}
      </div>
      <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
        {list.length === 0 ? <p className="cc-muted">No kitchens found.</p> : list.map((kitchen) => (
          <div key={kitchen._id} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="font-semibold text-[#1F2933]">{kitchen.name}</p>
              <p className="text-sm cc-muted">Owner: {kitchen.ownerUserId?.email || kitchen.ownerUserId?.name || "-"}</p>
              <p className="text-sm cc-muted">Rating: {(kitchen.avgRating || 0).toFixed(1)} | Orders: {kitchen.orderCount ?? "-"}</p>
              <p className="text-sm cc-muted">Status: {kitchen.verificationStatus} | Active: {kitchen.isActive ? "Yes" : "No"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="cc-btn-primary rounded-lg px-3 py-1 text-sm" onClick={() => loadKitchenDetail(kitchen._id)} disabled={actionKey === `kitchen-${kitchen._id}`}>
                Inspect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
