import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api";

const todayStr = () => new Date().toISOString().slice(0, 10);

const KitchenDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [kitchen, setKitchen] = useState(null);
  const [meals, setMeals] = useState([]);
  const [date, setDate] = useState(todayStr());

  const [qty, setQty] = useState(1);
  const [mealType, setMealType] = useState("breakfast");
  const [activeType, setActiveType] = useState("breakfast");
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  const isFavorite = useMemo(() => {
    return (favorites || []).some((k) => String(k._id) === String(id));
  }, [favorites, id]);

  const load = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const k = await apiFetch(`/api/kitchens/${id}`);
      setKitchen(k.kitchen);

      const a = await apiFetch(`/api/kitchens/${id}/availability?date=${encodeURIComponent(date)}`);
      setMeals(a.meals || []);

      try {
        const f = await apiFetch("/api/favorites/my");
        setFavorites(f.favorites || []);
      } catch {
        setFavorites([]);
      }
    } catch (e) {
      setError(e.message || "Failed to load kitchen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, date]);

  const toggleFavorite = async () => {
    setError("");
    setMessage("");
    try {
      const res = await apiFetch(`/api/favorites/${id}/toggle`, { method: "POST" });
      setFavorites(res.favorites || []);
    } catch (e) {
      setError(e.message || "Failed to update favorite");
    }
  };

  const prebook = async () => {
    setError("");
    setMessage("");
    try {
      const prebookRes = await apiFetch("/api/orders/prebook", {
        method: "POST",
        body: JSON.stringify({ kitchenId: id, date, mealType, qty: Number(qty) }),
      });
      const createdOrder = prebookRes?.order;
      setPendingOrderId(createdOrder?._id || null);
      setPaymentMethod(null);
      setMessage("Pre-booked successfully. Choose a payment method to confirm.");
      const a = await apiFetch(`/api/kitchens/${id}/availability?date=${encodeURIComponent(date)}`);
      setMeals(a.meals || []);
    } catch (e) {
      setError(e.message || "Failed to pre-book");
    }
  };

  const setPayment = async (method) => {
    if (!pendingOrderId) {
      setError("No pending order found. Please pre-book first.");
      return;
    }
    setError("");
    setMessage("");
    try {
      const res = await apiFetch(`/api/orders/${pendingOrderId}/payment-method`, {
        method: "PATCH",
        body: JSON.stringify({ paymentMethod: method }),
      });
      setPaymentMethod(res?.order?.paymentMethod || method);
      setMessage(`Payment method saved: ${method.toUpperCase()}.`);
    } catch (e) {
      setError(e.message || "Failed to set payment method");
    }
  };

  const submitRating = async () => {
    setError("");
    setMessage("");
    try {
      await apiFetch(`/api/kitchens/${id}/rating`, {
        method: "POST",
        body: JSON.stringify({ rating: Number(rating), feedback }),
      });
      setMessage("Thanks for your feedback.");
      const k = await apiFetch(`/api/kitchens/${id}`);
      setKitchen(k.kitchen);
    } catch (e) {
      setError(e.message || "Failed to submit rating");
    }
  };

  const remainingFor = (type) => {
    const m = (meals || []).find((x) => x.mealType === type);
    if (!m) return "Not set";
    if (!m.isAvailable) return "Unavailable";
    return `${m.remainingQty} left`;
  };

  const mealFor = (type) => (meals || []).find((x) => x.mealType === type);

  if (loading) {
    return (
      <div className="cc-page">
        <p className="cc-muted">Loading...</p>
      </div>
    );
  }

  if (!kitchen) {
    return (
      <div className="cc-page">
        <p className="cc-muted">Kitchen not found.</p>
        <button
          onClick={() => navigate("/browse-kitchens")}
          className="mt-4 cc-btn-secondary px-5 py-2"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="cc-page">
      <div className="max-w-3xl mx-auto cc-card-pad">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#F97316]">{kitchen.name}</h1>
            <p className="cc-muted mt-2">{kitchen.description || ""}</p>
            <p className="cc-muted text-sm mt-2">
              Rating: {(kitchen.avgRating || 0).toFixed(1)} ({kitchen.ratingCount || 0})
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleFavorite}
              className="text-[#F97316] font-semibold"
              title="Save as favorite"
            >
              {isFavorite ? "★" : "☆"}
            </button>
            <button
              onClick={() => navigate("/browse-kitchens")}
              className="cc-btn-secondary px-5 py-2"
            >
              Back
            </button>
          </div>
        </div>

        {error && <p className="text-[#B91C1C] mt-4">{error}</p>}
        {message && <p className="text-[#15803D] mt-4">{message}</p>}

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-[#1F2933]">Real-time Availability</h2>
          <div className="mt-3 flex items-center gap-3">
            <label className="cc-muted">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["breakfast", "lunch", "snacks", "dinner"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setActiveType(t);
                  setMealType(t);
                }}
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                  activeType === t
                    ? "bg-[#F97316] text-[#1F2933] border-[#F97316]/50"
                    : "bg-white/70 text-[#1F2933] border-black/5 hover:bg-white"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="mt-4 border border-black/5 rounded-xl p-5 bg-white/70">
            {(() => {
              const meal = mealFor(activeType);
              if (!meal) {
                return <p className="cc-muted">No {activeType} menu set for this date.</p>;
              }
              return (
                <div className="grid md:grid-cols-[2fr_1fr] gap-4 items-start">
                  <div>
                    <p className="text-[#1F2933] font-semibold capitalize">{activeType}</p>
                    <p className="text-[#1F2933] mt-1 text-lg font-semibold">{meal.title}</p>
                    {meal.description ? (
                      <p className="cc-muted mt-2 leading-relaxed">{meal.description}</p>
                    ) : null}
                    <p className="text-[#F97316] text-sm mt-3 font-semibold">₹{meal.price} • {remainingFor(activeType)}</p>
                  </div>
                  {meal.imageUrl ? (
                    <img
                      src={meal.imageUrl}
                      alt={meal.title || activeType}
                      className="w-full h-40 object-cover rounded-lg border border-black/5"
                    />
                  ) : null}
                </div>
              );
            })()}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-[#1F2933]">Pre-book Meal</h2>
          <div className="mt-3 grid md:grid-cols-3 gap-3">
            <select
              value={mealType}
              onChange={(e) => {
                setMealType(e.target.value);
                setActiveType(e.target.value);
              }}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="snacks">Snacks</option>
              <option value="dinner">Dinner</option>
            </select>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] placeholder:text-[#6B7280]/80 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
              placeholder="Qty"
            />
            <button
              onClick={prebook}
              className="cc-btn-primary px-5 py-2"
            >
              Pre-book
            </button>
          </div>

          {pendingOrderId ? (
            <div className="mt-4 border border-[#F97316]/25 bg-[#F97316]/10 rounded-xl p-4">
              <p className="text-[#1F2933] font-semibold">Choose payment method</p>
              <p className="cc-muted text-sm mt-1">Order ID: {pendingOrderId}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  onClick={() => setPayment("upi")}
                  className="cc-btn-primary rounded-lg px-4 py-2"
                >
                  Pay with UPI
                </button>
                <button
                  onClick={() => setPayment("card")}
                  className="cc-btn-secondary rounded-lg px-4 py-2"
                >
                  Pay with Card
                </button>
              </div>
              {paymentMethod ? (
                <p className="text-[#15803D] text-sm mt-2">Selected: {paymentMethod.toUpperCase()}</p>
              ) : (
                <p className="cc-muted text-sm mt-2">No payment selected yet.</p>
              )}
            </div>
          ) : null}

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => navigate("/subscriptions")}
              className="cc-btn-primary px-5 py-2"
            >
              Subscription Plans
            </button>
            <button
              onClick={() => navigate("/my-orders")}
              className="cc-btn-secondary px-5 py-2"
            >
              My Orders
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-[#1F2933]">Rating & Feedback</h2>
          <div className="mt-3 grid gap-3">
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
            >
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Good</option>
              <option value={3}>3 - Okay</option>
              <option value={2}>2 - Poor</option>
              <option value={1}>1 - Bad</option>
            </select>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              placeholder="Share feedback (optional)"
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] placeholder:text-[#6B7280]/80 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
            />

            <button
              onClick={submitRating}
              className="cc-btn-primary px-5 py-2"
            >
              Submit
            </button>
          </div>
          <p className="cc-muted text-sm mt-3">(Login required to submit.)</p>
        </div>
      </div>
    </div>
  );
};

export default KitchenDetail;
