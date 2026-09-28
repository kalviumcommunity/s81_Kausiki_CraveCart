import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Subscriptions() {
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
      setMessage("Subscription confirmed! Welcome to curated daily home meals.");
      const m = await apiFetch("/api/subscriptions/my");
      setMySubs(m.subscriptions || []);
    } catch (e) {
      setError(e.message || "Failed to subscribe");
    }
  };

  return (
    <div className="min-h-screen bg-[#F0E6DA] text-[#23120B] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4D5C3]">
          <div>
            <span className="micro-label text-[#4F6815]">DAILY TASTING BOXES</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#75070C] mt-1">
              Curated Meal Subscriptions
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5C52] mt-1">
              Never worry about what to eat. Receive fresh home-cooked meals every single day.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="cc-btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-4"
          >
            ← Back to Home
          </button>
        </div>

        {error && <div className="cc-alert-error">{error}</div>}
        {message && <div className="cc-alert-success">{message}</div>}

        {/* Start Date Selector */}
        <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="micro-label text-[#75070C]">SUBSCRIPTION TIMELINE</span>
            <p className="font-serif text-base font-bold text-[#23120B] mt-0.5">
              Select Starting Date for Your Plan:
            </p>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-white border border-[#E4D5C3] px-3 py-2 rounded-xl text-xs font-semibold text-[#23120B] focus:border-[#75070C]"
          />
        </div>

        {/* Available Plans */}
        <div>
          <span className="micro-label text-[#4F6815]">TIERS & PRICING</span>
          <h2 className="font-serif text-2xl font-bold text-[#75070C] mt-1 mb-6">
            Choose Your Dining Plan
          </h2>

          {loading ? (
            <div className="py-12 text-center">
              <p className="font-serif text-base text-[#75070C]">Loading subscription plans...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-8 text-center">
              <p className="font-serif text-lg text-[#75070C]">No plans available at this moment.</p>
              <p className="text-xs text-[#6E5C52] mt-1">New chef tasting plans launch weekly.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((p) => (
                <div
                  key={p._id}
                  className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="micro-label bg-[#FFFBEA] text-[#75070C] px-2.5 py-1 rounded-md border border-[#F5EBCE]">
                      {p.planType.toUpperCase()}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#75070C] mt-3 capitalize">
                      {p.planType} Plan
                    </h3>
                    <p className="text-xs text-[#6E5C52] mt-2">
                      {p.mealsPerDay} fresh meal{p.mealsPerDay > 1 ? "s" : ""} delivered daily to your doorstep.
                    </p>

                    <div className="mt-6 pt-4 border-t border-[#E4D5C3]">
                      <span className="font-serif text-3xl font-extrabold text-[#75070C]">
                        ₹{p.price}
                      </span>
                      <span className="text-xs text-[#6E5C52] ml-1">/ cycle</span>
                    </div>
                  </div>

                  <button
                    onClick={() => subscribe(p._id)}
                    className="mt-6 cc-btn-primary text-xs uppercase tracking-wider font-bold py-3 w-full"
                  >
                    Subscribe Now →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Active Subscriptions */}
        <div className="mt-12 pt-8 border-t border-[#E4D5C3]">
          <span className="micro-label text-[#75070C]">ACTIVE MEMBERSHIPS</span>
          <h2 className="font-serif text-2xl font-bold text-[#75070C] mt-1 mb-6">
            My Subscriptions
          </h2>

          {mySubs.length === 0 ? (
            <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-6 text-center">
              <p className="text-xs sm:text-sm text-[#6E5C52]">You have no active subscription plans.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {mySubs.map((s) => (
                <div key={s._id} className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl font-bold text-[#75070C] capitalize">
                      {s.planId?.planType} Subscription
                    </h3>
                    <span className="cc-badge-olive text-[10px]">
                      {s.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-[#6E5C52] mt-2">
                    Meals per Day: <span className="font-semibold text-[#23120B]">{s.planId?.mealsPerDay}</span>
                  </p>
                  <p className="text-xs text-[#6E5C52] mt-1">
                    Duration: <span className="font-semibold text-[#23120B]">{new Date(s.startDate).toISOString().slice(0, 10)}</span> to <span className="font-semibold text-[#23120B]">{new Date(s.endDate).toISOString().slice(0, 10)}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
