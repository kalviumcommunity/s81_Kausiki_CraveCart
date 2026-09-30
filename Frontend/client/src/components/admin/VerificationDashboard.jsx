import React from 'react';

export default function VerificationDashboard({
  kitchens = [],
  loadKitchenDetail,
  kitchenQuery,
  setKitchenQuery,
  kitchenStatusFilter,
  setKitchenStatusFilter,
  actionKey,
}) {
  return (
    <div className="cc-card-pad space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-[#F97316]">Kitchen Verification Management</p>
          <h2 className="text-xl font-semibold text-[#1F2933]">Review, Approve, or Re-evaluate Kitchen Applications</h2>
        </div>
        <input
          value={kitchenQuery}
          onChange={(e) => setKitchenQuery(e.target.value)}
          placeholder="Search kitchens..."
          className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ["all", "All"],
          ["pending", "Pending"],
          ["verified", "Approved / Verified"],
          ["rejected", "Rejected"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setKitchenStatusFilter(value)}
            className={`rounded-full px-3 py-1 text-sm font-semibold border transition ${
              kitchenStatusFilter === value
                ? "bg-[#F97316] text-[#1F2933] border-[#F97316]/50"
                : "bg-white/70 text-[#1F2933] border-black/5 hover:bg-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
        {kitchens.length === 0 ? (
          <p className="cc-muted">No kitchens found.</p>
        ) : (
          kitchens.map((kitchen) => (
            <div key={kitchen._id} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70 hover:border-black/15 transition">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#1F2933] text-base">{kitchen.name}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                        kitchen.verificationStatus === "verified"
                          ? "bg-[#15803D]/10 text-[#15803D]"
                          : kitchen.verificationStatus === "rejected"
                          ? "bg-[#B91C1C]/10 text-[#B91C1C]"
                          : "bg-[#F97316]/10 text-[#F97316]"
                      }`}
                    >
                      {kitchen.verificationStatus === "verified"
                        ? "✓ Verified"
                        : kitchen.verificationStatus === "rejected"
                        ? "✗ Rejected"
                        : "⏳ Pending Review"}
                    </span>
                  </div>
                  <p className="text-sm cc-muted mt-0.5">
                    Owner:{" "}
                    {kitchen.documents?.governmentId?.nameOnId ||
                      kitchen.ownerName ||
                      (kitchen.ownerUserId?.name && kitchen.ownerUserId?.name !== "Admin"
                        ? kitchen.ownerUserId?.name
                        : "") ||
                      "Applicant"}{" "}
                    (
                    {kitchen.contactEmail ||
                      (kitchen.ownerUserId?.email !== "cravecart05@gmail.com" ? kitchen.ownerUserId?.email : "") ||
                      "-"}
                    )
                  </p>
                  <p className="text-xs cc-muted mt-0.5">
                    Pincode: {kitchen.pincode || "Not Set"}
                    {kitchen.verificationRejectedReason ? (
                      <span className="text-[#B91C1C] ml-2">Reason: {kitchen.verificationRejectedReason}</span>
                    ) : null}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="cc-btn-primary rounded-lg px-3 py-1.5 text-xs font-semibold"
                    onClick={() => loadKitchenDetail(kitchen._id)}
                    disabled={actionKey === `kitchen-${kitchen._id}`}
                  >
                    View Details & Docs
                  </button>
                  <button
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition shadow-xs"
                    onClick={() => loadKitchenDetail(kitchen._id)}
                    disabled={actionKey === `kitchen-${kitchen._id}`}
                    title="Edit approval or rejection decision"
                  >
                    ✏️ Edit Decision
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
