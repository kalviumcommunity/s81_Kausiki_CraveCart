import React from 'react';

export default function OrdersDashboard({ orders = [], filteredOrders = [], orderStatusFilter, setOrderStatusFilter }) {
  const list = filteredOrders.length ? filteredOrders : orders;
  return (
    <div className="cc-card-pad space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-[#F97316]">Order Monitoring</p>
          <h2 className="text-xl font-semibold text-[#1F2933]">View all orders and track status</h2>
        </div>
        <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm">
          <option value="all">All statuses</option>
          <option value="prebooked">Prebooked</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
          <option value="fulfilled">Fulfilled</option>
        </select>
      </div>
      <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
        {list.length === 0 ? <p className="cc-muted">No orders found.</p> : list.map((order) => (
          <div key={order._id} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-semibold text-[#1F2933]">{order.kitchenId?.name || "Kitchen"}</p>
                <p className="text-sm cc-muted">User: {order.userId?.email || order.userId?.name || "-"}</p>
                <p className="text-sm cc-muted">Status: {order.status} | Total: {order.total ?? "-"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
