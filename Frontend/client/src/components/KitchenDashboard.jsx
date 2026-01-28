import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

const todayStr = () => new Date().toISOString().slice(0, 10);

const KitchenDashboard = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [dailyOrderLimit, setDailyOrderLimit] = useState(50);

  const [ordersDate, setOrdersDate] = useState(todayStr());
  const [orders, setOrders] = useState([]);

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await apiFetch("/api/kitchens/my/profile");
      setProfile(res.kitchen);
      setDailyOrderLimit(res.kitchen?.dailyOrderLimit ?? 50);
    } catch (err) {
      setError(err.message || "Failed to load kitchen profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setError("");
    try {
      const res = await apiFetch(`/api/kitchens/my/orders?date=${encodeURIComponent(ordersDate)}`);
      setOrders(res.orders || []);
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, ordersDate]);

  const saveLimit = async () => {
    setError("");
    setMessage("");
    try {
      const res = await apiFetch("/api/kitchens/my/daily-order-limit", {
        method: "PATCH",
        body: JSON.stringify({ dailyOrderLimit: Number(dailyOrderLimit) }),
      });
      setProfile(res.kitchen);
      setMessage("Daily order limit updated.");
    } catch (e) {
      setError(e.message || "Failed to update limit");
    }
  };

  if (loading) {
    return (
      <div className="cc-page">
        <p className="cc-muted">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="cc-page">
        <div className="max-w-xl mx-auto cc-card-pad">
          <h1 className="text-3xl font-bold text-[#1F2933]">Kitchen Dashboard</h1>
          {error && <p className="text-[#B91C1C] mt-4">{error}</p>}
          <p className="cc-muted mt-4">No kitchen profile found for this account.</p>
          <button
            onClick={() => navigate("/register-kitchen")}
            className="mt-6 cc-btn-primary px-5 py-2"
          >
            Register Kitchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cc-page">
      <div className="cc-container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#1F2933]">Kitchen Dashboard</h1>
          <button
            onClick={() => navigate("/")}
            className="cc-btn-secondary px-5 py-2"
          >
            Home
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/kitchen-menu")}
            className="cc-btn-primary px-4 py-2"
          >
            Manage menu (breakfast / lunch / snacks / dinner)
          </button>
        </div>

        {error && <p className="text-[#B91C1C] mb-4">{error}</p>}
        {message && <p className="text-[#15803D] mb-4">{message}</p>}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="cc-card-pad">
            <h2 className="text-xl font-semibold text-[#F97316]">{profile.name}</h2>
            <p className="cc-muted mt-2">Verified: {profile.verified ? "Yes" : "No"}</p>
            <p className="cc-muted mt-1">Status: {profile.verificationStatus || "pending"}</p>
            <p className="cc-muted mt-1">FSSAI: {profile.fssai?.validationStatus || "pending"}</p>
            {profile.verificationStatus === "rejected" && profile.verificationRejectedReason ? (
              <p className="text-[#B91C1C] mt-2">Rejected: {profile.verificationRejectedReason}</p>
            ) : null}
            {profile.verifiedBadge ? (
              <p className="text-[#15803D] mt-2 font-semibold">Verified Home Kitchen</p>
            ) : null}

            <div className="mt-6">
              <label className="block text-[#1F2933] mb-2 font-semibold">Daily order limit</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min={0}
                  value={dailyOrderLimit}
                  onChange={(e) => setDailyOrderLimit(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] placeholder:text-[#6B7280]/80 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                />
                <button
                  onClick={saveLimit}
                  className="cc-btn-primary px-5 py-2"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          <div className="cc-card-pad">
            <h2 className="text-xl font-semibold text-[#1F2933]">Pre-orders</h2>
            <div className="mt-3 flex items-center gap-3">
              <label className="cc-muted">Date</label>
              <input
                type="date"
                value={ordersDate}
                onChange={(e) => setOrdersDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
              />
            </div>

            {orders.length === 0 ? (
              <p className="cc-muted mt-4">No pre-orders for this date.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {orders.map((o) => (
                  <div key={o._id} className="border border-black/5 rounded-xl p-4 bg-white/70">
                    <p className="text-[#F97316] font-semibold">{o.userId?.name || "Customer"}</p>
                    <p className="text-[#1F2933]">{o.mealId?.title || o.mealType}</p>
                    <p className="cc-muted text-sm mt-1">
                      {o.mealType} • Qty {o.qty} • {o.userId?.email || ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboard;
