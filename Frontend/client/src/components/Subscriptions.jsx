import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

const todayStr = () => new Date().toISOString().slice(0, 10);

const Subscriptions = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [mySubs, setMySubs] = useState([]);
  const [startDate, setStartDate] = useState(todayStr());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const p = await apiFetch("/api/subscriptions/plans");
      setPlans(p.plans || []);

      try {
        const m = await apiFetch("/api/subscriptions/my");
        setMySubs(m.subscriptions || []);
      } catch {
        setMySubs([]);
      }
    } catch (e) {
      setError(e.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const subscribe = async (planId) => {
    setError("");
    setMessage("");
    try {
      await apiFetch("/api/subscriptions/subscribe", {
        method: "POST",
        body: JSON.stringify({ planId, startDate }),
      });
      setMessage("Subscribed successfully.");
      const m = await apiFetch("/api/subscriptions/my");
      setMySubs(m.subscriptions || []);
    } catch (e) {
      setError(e.message || "Failed to subscribe");
    }
  };

  return (
    <div className="cc-page">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#1F2933]">Subscription Meal Plans</h1>
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
          <label className="text-[#1F2933] font-semibold">Start date</label>
          <div className="mt-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
            />
          </div>
        </div>

        {loading ? (
          <p className="cc-muted">Loading...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((p) => (
              <div key={p._id} className="cc-card-pad">
                <h2 className="text-xl font-semibold text-[#F97316] capitalize">{p.planType}</h2>
                <p className="cc-muted mt-2">Meals per day: {p.mealsPerDay}</p>
                <p className="cc-muted mt-1">Price: {p.price}</p>
                <button
                  onClick={() => subscribe(p._id)}
                  className="mt-4 cc-btn-primary px-5 py-2"
                >
                  Subscribe
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-[#1F2933] mb-4">My Subscriptions</h2>
          {mySubs.length === 0 ? (
            <p className="cc-muted">No subscriptions yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {mySubs.map((s) => (
                <div key={s._id} className="cc-card-pad">
                  <h3 className="text-xl font-semibold text-[#F97316] capitalize">{s.planId?.planType}</h3>
                  <p className="cc-muted mt-2">Meals/day: {s.planId?.mealsPerDay}</p>
                  <p className="cc-muted mt-1">Status: {s.status}</p>
                  <p className="cc-muted text-sm mt-2">
                    {new Date(s.startDate).toISOString().slice(0, 10)} → {new Date(s.endDate).toISOString().slice(0, 10)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
