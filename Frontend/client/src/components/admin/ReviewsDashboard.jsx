import React from 'react';

export default function ReviewsDashboard({ reviews = [], reviewQuery, setReviewQuery, deleteReview, actionKey }) {
  const list = reviews || [];
  return (
    <div className="cc-card-pad space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-[#F97316]">Reviews</p>
          <h2 className="text-xl font-semibold text-[#1F2933]">Moderate and remove reviews</h2>
        </div>
        <input value={reviewQuery} onChange={(e) => setReviewQuery(e.target.value)} placeholder="Search reviews..." className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm" />
      </div>
      <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
        {list.length === 0 ? <p className="cc-muted">No reviews found.</p> : list.map((r) => (
          <div key={r._id} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="font-semibold text-[#1F2933]">{r.kitchenId?.name || 'Review'}</p>
              <p className="text-sm cc-muted">User: {r.userId?.email || r.userId?.name || '-'}</p>
              <p className="text-sm cc-muted">Rating: {r.rating} — {r.feedback}</p>
            </div>
            <div>
              <button className="rounded-lg px-3 py-1 text-sm cc-btn-danger" onClick={() => deleteReview(r._id)} disabled={actionKey === `review-${r._id}`}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
