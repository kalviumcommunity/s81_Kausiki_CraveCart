import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

const todayStr = () => new Date().toISOString().slice(0, 10);

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [repeatDate, setRepeatDate] = useState(todayStr());

  const load = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await apiFetch("/api/orders/my");
      setOrders(res.orders || []);
    } catch (e) {
      setError(e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cancelOrder = async (orderId) => {
    setError("");
    setMessage("");
    try {
      await apiFetch(`/api/orders/${orderId}/cancel`, { method: "PATCH" });
      setMessage("Order cancelled.");
      await load();
    } catch (e) {
      setError(e.message || "Failed to cancel");
    }
  };

  const reorder = async (o) => {
    setError("");
    setMessage("");
    try {
      await apiFetch("/api/orders/prebook", {
        method: "POST",
        body: JSON.stringify({
          kitchenId: o.kitchenId?._id || o.kitchenId,
          date: repeatDate,
          mealType: o.mealType,
          qty: o.qty,
        }),
      });
      setMessage("Reorder placed.");
      await load();
    } catch (e) {
      setError(e.message || "Failed to reorder");
    }
  };

  return (
    <div className="cc-page">
      <div className="cc-container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#1F2933]">My Orders</h1>
          <button
            onClick={() => navigate("/")}
            className="cc-btn-secondary px-5 py-2"
          >
            Home
          </button>
        </div>

        {error && <p className="text-[#B91C1C] mb-4">{error}</p>}
        {message && <p className="text-[#15803D] mb-4">{message}</p>}

        <div className="cc-card-pad mb-6">
          <label className="text-[#1F2933] font-semibold">Reorder date</label>
          <div className="mt-2">
            <input
              type="date"
              value={repeatDate}
              onChange={(e) => setRepeatDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
            />
          </div>
        </div>

        {loading ? (
          <p className="cc-muted">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="cc-muted">No orders yet.</p>
        ) : (
          <div className="grid gap-6">
            {orders.map((o) => (
              <div key={o._id} className="cc-card-pad">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[#F97316]">{o.kitchenId?.name || "Kitchen"}</h2>
                    <p className="text-[#1F2933] mt-1">{o.mealId?.title || o.mealType}</p>
                    <p className="cc-muted text-sm mt-2">
                      {new Date(o.date).toISOString().slice(0, 10)} • {o.mealType} • Qty {o.qty} • {o.status}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/kitchens/${o.kitchenId?._id || o.kitchenId}`)}
                    className="cc-btn-secondary px-4 py-2"
                  >
                    View
                  </button>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => reorder(o)}
                    className="cc-btn-primary px-5 py-2"
                  >
                    Reorder
                  </button>
                  {o.status === "prebooked" && (
                    <button
                      onClick={() => cancelOrder(o._id)}
                      className="cc-btn-danger px-5 py-2"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
