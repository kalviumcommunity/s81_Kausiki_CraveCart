import React from 'react';

export default function ComplaintsDashboard({ complaints = [], filteredComplaints = [], complaintStatusFilter, setComplaintStatusFilter, changeComplaintStatus, actionKey }) {
  const list = filteredComplaints.length ? filteredComplaints : complaints;
  return (
    <div className="cc-card-pad space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-[#F97316]">Complaint Management</p>
          <h2 className="text-xl font-semibold text-[#1F2933]">View and resolve complaints</h2>
        </div>
        <select value={complaintStatusFilter} onChange={(e) => setComplaintStatusFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm">
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>
      <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
        {list.length === 0 ? <p className="cc-muted">No complaints found.</p> : list.map((c) => (
          <div key={c._id} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-semibold text-[#1F2933]">{c.title || 'Complaint'}</p>
                <p className="text-sm cc-muted">From: {c.userId?.email || c.userId?.name || '-'}</p>
                <p className="text-sm cc-muted">Status: {c.status}</p>
              </div>
              <div>
                <button className="rounded-lg px-3 py-1 text-sm" onClick={() => changeComplaintStatus(c._id, 'resolved')} disabled={actionKey === `complaint-${c._id}`}>Mark Resolved</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
