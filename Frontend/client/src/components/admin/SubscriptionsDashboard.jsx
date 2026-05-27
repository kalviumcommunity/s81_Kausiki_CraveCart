import React from 'react';

export default function SubscriptionsDashboard({ plans = [], subscriptions = [], editPlan, planForm, setPlanForm, savePlan, planSaving }) {
  return (
    <div className="cc-card-pad space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-[#F97316]">Subscriptions</p>
          <h2 className="text-xl font-semibold text-[#1F2933]">Manage plans and subscriptions</h2>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <p className="cc-muted text-sm">Plans</p>
          {plans.length === 0 ? <p className="cc-muted">No plans.</p> : plans.map((p) => (
            <div key={p._id} className="border border-black/5 rounded-xl px-3 py-2 bg-white/70 flex items-center justify-between">
              <div>
                <p className="font-semibold">{p.planType} - {p.mealsPerDay} / day</p>
                <p className="text-sm cc-muted">Price: {p.price}</p>
              </div>
              <div>
                <button onClick={() => editPlan(p)} className="rounded-lg px-3 py-1 text-sm">Edit</button>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="cc-muted text-sm">Subscriptions</p>
          {subscriptions.length === 0 ? <p className="cc-muted">No subscriptions.</p> : subscriptions.map((s) => (
            <div key={s._id} className="border border-black/5 rounded-xl px-3 py-2 bg-white/70">
              <p className="font-semibold">{s.userId?.email || s.userId?.name}</p>
              <p className="text-sm cc-muted">Plan: {s.planId?.planType} | Status: {s.status}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-black/5 bg-white/60 p-4">
        <p className="font-semibold mb-2">Create / Edit Plan</p>
        <select value={planForm.planType} onChange={(e) => setPlanForm({ ...planForm, planType: e.target.value })} className="w-full mb-2 rounded border px-3 py-2">
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <input value={planForm.mealsPerDay} onChange={(e) => setPlanForm({ ...planForm, mealsPerDay: e.target.value })} className="w-full mb-2 rounded border px-3 py-2" placeholder="Meals per day" />
        <input value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} className="w-full mb-2 rounded border px-3 py-2" placeholder="Price" />
        <div className="flex gap-2">
          <button className="cc-btn-primary rounded-lg px-4 py-2" onClick={savePlan} disabled={planSaving}>{planSaving ? 'Saving...' : 'Save plan'}</button>
        </div>
      </div>
    </div>
  );
}
