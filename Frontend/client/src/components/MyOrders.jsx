import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function MyOrders() {
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
      setError(e.message || "Failed to cancel order");
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
      setMessage("Reorder pre-booked successfully!");
      await load();
    } catch (e) {
      setError(e.message || "Failed to reorder");
    }
  };

  return (
    <div className="min-h-screen bg-[#F0E6DA] text-[#23120B] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4D5C3]">
          <div>
            <span className="micro-label text-[#4F6815]">ORDER HISTORY</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#75070C] mt-1">
              My Meal Orders
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5C52] mt-1">
              Track your upcoming pre-booked meals and past culinary deliveries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="cc-btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-4"
            >
              ← Back to Home
            </button>
            <button
              onClick={() => navigate("/browse-kitchens")}
              className="cc-btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-4"
            >
              Explore Kitchens
            </button>
          </div>
        </div>

        {error && <div className="cc-alert-error">{error}</div>}
        {message && <div className="cc-alert-success">{message}</div>}

        {/* Date Reorder Control */}
        <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="micro-label text-[#75070C]">1-CLICK REORDER</span>
            <p className="font-serif text-base font-bold text-[#23120B] mt-0.5">
              Set Target Date for Reordering:
            </p>
          </div>
          <input
            type="date"
            value={repeatDate}
            onChange={(e) => setRepeatDate(e.target.value)}
            className="bg-white border border-[#E4D5C3] px-3 py-2 rounded-xl text-xs font-semibold text-[#23120B] focus:border-[#75070C]"
          />
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <p className="font-serif text-lg text-[#75070C]">Fetching your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-12 text-center">
            <span className="text-4xl">🍲</span>
            <h3 className="font-serif text-2xl font-bold text-[#75070C] mt-4">No meal orders yet</h3>
            <p className="text-xs sm:text-sm text-[#6E5C52] mt-2">
              Browse neighborhood kitchens and pre-book freshly cooked dishes.
            </p>
            <button
              onClick={() => navigate("/browse-kitchens")}
              className="mt-6 cc-btn-primary text-xs uppercase tracking-wider font-bold py-3 px-6"
            >
              Start Exploring
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o._id}
                className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif text-xl font-bold text-[#75070C]">
                      {o.kitchenId?.name || "Artisanal Kitchen"}
                    </span>
                    <span className={`micro-label px-2.5 py-1 rounded-full ${
                      o.status === "prebooked"
                        ? "bg-[#FFFBEA] text-[#75070C] border border-[#F5EBCE]"
                        : o.status === "completed"
                        ? "bg-[#4F6815]/15 text-[#4F6815]"
                        : "bg-gray-200 text-gray-700"
                    }`}>
                      {o.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="font-semibold text-sm text-[#23120B] mt-1 capitalize">
                    {o.mealId?.title || o.mealType} • {o.qty} portion{o.qty > 1 ? "s" : ""}
                  </p>

                  <p className="text-xs text-[#6E5C52] mt-1">
                    Scheduled Date: <span className="font-semibold text-[#23120B]">{new Date(o.date).toISOString().slice(0, 10)}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate(`/kitchens/${o.kitchenId?._id || o.kitchenId}`)}
                    className="cc-btn-secondary text-xs uppercase tracking-wider font-bold py-2 px-4"
                  >
                    View Kitchen
                  </button>
                  <button
                    onClick={() => reorder(o)}
                    className="cc-btn-olive text-xs uppercase tracking-wider font-bold py-2 px-4"
                  >
                    Reorder for {repeatDate}
                  </button>
                  {o.status === "prebooked" && (
                    <button
                      onClick={() => cancelOrder(o._id)}
                      className="cc-btn-danger text-xs uppercase tracking-wider font-bold py-2 px-4"
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
}
