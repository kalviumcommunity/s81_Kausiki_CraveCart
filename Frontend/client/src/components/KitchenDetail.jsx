import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch, resolveUploadUrl } from "../api";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function KitchenDetail() {
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

  const [selectedMealId, setSelectedMealId] = useState("");

  const dishesForType = (type) => (meals || []).filter((x) => x.mealType === type);

  const prebook = async (targetMeal = null) => {
    setError("");
    setMessage("");
    try {
      const meal = targetMeal || (meals || []).find((m) => m._id === selectedMealId) || (meals || []).find((m) => m.mealType === mealType);
      const chosenMealType = meal?.mealType || mealType;
      const chosenMealId = meal?._id || undefined;

      const prebookRes = await apiFetch("/api/orders/prebook", {
        method: "POST",
        body: JSON.stringify({
          kitchenId: id,
          mealId: chosenMealId,
          date,
          mealType: chosenMealType,
          qty: Number(qty),
        }),
      });
      const createdOrder = prebookRes?.order;
      setPendingOrderId(createdOrder?._id || null);
      setPaymentMethod(null);
      setMessage(`Pre-booked "${meal?.title || chosenMealType}" successfully. Choose a payment method below to finalize.`);
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
      setMessage("Thank you for your rating & feedback!");
      const k = await apiFetch(`/api/kitchens/${id}`);
      setKitchen(k.kitchen);
    } catch (e) {
      setError(e.message || "Failed to submit rating");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0E6DA] flex items-center justify-center p-6 text-center">
        <p className="font-serif text-xl text-[#75070C]">Loading artisanal kitchen details...</p>
      </div>
    );
  }

  if (!kitchen) {
    return (
      <div className="min-h-screen bg-[#F0E6DA] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#75070C]">Kitchen not found</h2>
        <button
          onClick={() => navigate("/browse-kitchens")}
          className="mt-4 cc-btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-5"
        >
          ← Back to Kitchens
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0E6DA] text-[#23120B] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="micro-label bg-[#75070C] text-[#FFFBEA] px-3 py-1 rounded-full">
                  CERTIFIED HOME CHEF
                </span>
                <span className="cc-badge-olive text-[10px]">
                  ✓ Verified Kitchen
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#75070C] mt-3">
                {kitchen.name}
              </h1>

              <p className="text-xs sm:text-sm text-[#6E5C52] mt-2 leading-relaxed max-w-xl">
                {kitchen.description || "Authentic home-cooked meals prepared fresh daily with curated organic spices and heritage techniques."}
              </p>

              {kitchen.addressText && (
                <p className="text-xs text-[#4F6815] font-semibold mt-2">
                  📍 {kitchen.addressText} {kitchen.pincode ? `(${kitchen.pincode})` : ""}
                </p>
              )}

              <div className="mt-4 flex items-center gap-3 text-xs">
                <span className="font-bold text-[#75070C] bg-[#FFFBEA] px-2.5 py-1 rounded-lg">
                  ★ {(kitchen.avgRating || 0).toFixed(1)} / 5.0
                </span>
                <span className="text-[#6E5C52] font-semibold">({kitchen.ratingCount || 0} reviews)</span>
              </div>
            </div>

            <div className="flex items-center sm:flex-col gap-2 self-start">
              <button
                onClick={toggleFavorite}
                className="bg-white border border-[#E4D5C3] h-10 w-10 rounded-xl flex items-center justify-center text-lg hover:scale-105 transition"
                title="Favorite"
              >
                {isFavorite ? "❤️" : "🤍"}
              </button>
              <button
                onClick={() => navigate("/browse-kitchens")}
                className="cc-btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-4"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {error && <div className="cc-alert-error">{error}</div>}
        {message && <div className="cc-alert-success">{message}</div>}

        {/* Real-time Availability & Meal Slots */}
        <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4D5C3]">
            <div>
              <span className="micro-label text-[#4F6815]">DAILY MENUS</span>
              <h2 className="font-serif text-2xl font-bold text-[#75070C] mt-0.5">
                Real-Time Menu & Availability
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-[#6E5C52]">Menu Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white border border-[#E4D5C3] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#23120B] focus:border-[#75070C]"
              />
            </div>
          </div>

          {/* Meal Slot Tabs */}
          <div className="flex flex-wrap gap-2 mt-6">
            {["breakfast", "lunch", "snacks", "dinner"].map((t) => {
              const count = dishesForType(t).length;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setActiveType(t);
                    setMealType(t);
                    setSelectedMealId("");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                    activeType === t
                      ? "bg-[#75070C] text-[#FFFBEA] shadow-sm"
                      : "bg-white border border-[#E4D5C3] text-[#23120B] hover:border-[#75070C]"
                  }`}
                >
                  <span className="capitalize">{t}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeType === t ? "bg-white/20 text-white" : "bg-[#75070C]/10 text-[#75070C]"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Meal Category Dishes Grid */}
          <div className="mt-6">
            {dishesForType(activeType).length === 0 ? (
              <div className="border border-[#E4D5C3] rounded-2xl p-8 bg-white text-center">
                <p className="font-serif text-base text-[#6E5C52]">
                  No {activeType} dishes are listed for {date} yet.
                </p>
                <p className="text-xs text-[#6E5C52]/70 mt-1">Check another meal slot or select a different date.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {dishesForType(activeType).map((meal) => {
                  const portionsLeft = Math.max(0, (meal.totalQty || 0) - (meal.soldQty || 0));
                  const isSoldOut = !meal.isAvailable || portionsLeft === 0;

                  return (
                    <div
                      key={meal._id}
                      className="border border-[#E4D5C3] rounded-2xl p-5 bg-white flex flex-col justify-between hover:border-[#75070C]/40 transition shadow-xs"
                    >
                      <div className="grid grid-cols-[1fr_auto] gap-4">
                        <div>
                          <span className="micro-label text-[#4F6815]">{activeType.toUpperCase()} ITEM</span>
                          <h3 className="font-serif text-xl font-bold text-[#23120B] mt-0.5">
                            {meal.title}
                          </h3>
                          {meal.description && (
                            <p className="text-xs text-[#6E5C52] mt-1 line-clamp-2 leading-relaxed">
                              {meal.description}
                            </p>
                          )}
                          <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <span className="font-serif text-xl font-extrabold text-[#75070C]">
                              ₹{meal.price}
                            </span>
                            <span className={`micro-label px-2.5 py-0.5 rounded-lg font-bold text-[11px] ${
                              isSoldOut ? "bg-red-50 text-red-700 border border-red-200" : "bg-[#FFFBEA] text-[#4F6815] border border-[#E4D5C3]"
                            }`}>
                              {isSoldOut ? "Sold Out" : `${portionsLeft} portions left`}
                            </span>
                          </div>
                        </div>

                        {meal.imageUrl ? (
                          <img
                            src={resolveUploadUrl(meal.imageUrl)}
                            alt={meal.title}
                            className="w-24 h-24 object-cover rounded-xl border border-[#E4D5C3]"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-xl bg-[#FFFBEA] border border-[#E4D5C3] flex items-center justify-center font-serif text-[#75070C] text-xs font-bold text-center p-2">
                            Fresh {activeType}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#E4D5C3]/60 flex items-center justify-between gap-3">
                        <span className="text-[11px] text-[#6E5C52]">
                          Daily Prep: <span className="font-semibold text-[#23120B]">{meal.totalQty}</span>
                        </span>
                        <button
                          onClick={() => {
                            setSelectedMealId(meal._id);
                            prebook(meal);
                          }}
                          disabled={isSoldOut}
                          className={`text-xs uppercase tracking-wider font-bold py-2 px-4 rounded-xl transition ${
                            isSoldOut
                              ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                              : "bg-[#75070C] text-[#FFFBEA] hover:bg-[#5C0509] shadow-xs"
                          }`}
                        >
                          {isSoldOut ? "Sold Out" : "Pre-Book Dish →"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pre-book & Order Section */}
        <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-8 shadow-sm">
          <span className="micro-label text-[#75070C]">CUSTOM ORDER SELECTION</span>
          <h2 className="font-serif text-2xl font-bold text-[#75070C] mt-0.5">
            Pre-Book Custom Portions
          </h2>
          <p className="text-xs text-[#6E5C52] mt-1">
            Choose your meal slot and dish portions. Hand-crafted fresh before delivery.
          </p>

          <div className="mt-6 grid sm:grid-cols-4 gap-3">
            <div>
              <label className="micro-label text-[#6E5C52] block mb-1">MEAL SLOT</label>
              <select
                value={mealType}
                onChange={(e) => {
                  setMealType(e.target.value);
                  setActiveType(e.target.value);
                  setSelectedMealId("");
                }}
                className="w-full bg-white border border-[#E4D5C3] px-3 py-2.5 rounded-xl text-xs font-semibold text-[#23120B]"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snacks">Snacks</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>

            <div>
              <label className="micro-label text-[#6E5C52] block mb-1">SELECT DISH</label>
              <select
                value={selectedMealId}
                onChange={(e) => setSelectedMealId(e.target.value)}
                className="w-full bg-white border border-[#E4D5C3] px-3 py-2.5 rounded-xl text-xs font-semibold text-[#23120B]"
              >
                <option value="">Any Available {mealType.toUpperCase()} Dish</option>
                {dishesForType(mealType).map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title} (₹{m.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="micro-label text-[#6E5C52] block mb-1">PORTIONS (QTY)</label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full bg-white border border-[#E4D5C3] px-3 py-2.5 rounded-xl text-xs font-semibold text-[#23120B]"
                placeholder="1"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => prebook()}
                className="w-full cc-btn-primary text-xs uppercase tracking-wider font-bold py-3"
              >
                Pre-Book Portion →
              </button>
            </div>
          </div>

          {/* Pending Order Payment Confirmation */}
          {pendingOrderId && (
            <div className="mt-6 border border-[#75070C]/30 bg-[#FFFBEA] rounded-2xl p-5">
              <p className="font-serif text-base font-bold text-[#75070C]">
                Select Payment Method for Order #{pendingOrderId.slice(-6)}
              </p>
              <p className="text-xs text-[#23120B]/80 mt-1">Choose your preferred settlement method:</p>
              
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => setPayment("upi")}
                  className="cc-btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-5"
                >
                  Pay with UPI
                </button>
                <button
                  onClick={() => setPayment("card")}
                  className="cc-btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-5"
                >
                  Pay with Card
                </button>
                <button
                  onClick={() => setPayment("cash")}
                  className="cc-btn-olive text-xs uppercase tracking-wider font-bold py-2.5 px-5"
                >
                  Cash on Delivery
                </button>
              </div>

              {paymentMethod && (
                <p className="text-xs font-bold text-[#4F6815] mt-3">
                  ✓ Confirmed Payment: {paymentMethod.toUpperCase()}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-[#E4D5C3] flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/subscriptions")}
              className="cc-btn-butter text-xs uppercase tracking-wider font-bold py-2.5 px-5"
            >
              Explore Weekly Subscription Plans
            </button>
            <button
              onClick={() => navigate("/my-orders")}
              className="cc-btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-5"
            >
              View Order History
            </button>
          </div>
        </div>

        {/* Rating & Feedback */}
        <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-8 shadow-sm">
          <span className="micro-label text-[#4F6815]">COMMUNITY TASTING REVIEWS</span>
          <h2 className="font-serif text-2xl font-bold text-[#75070C] mt-0.5">
            Leave Feedback for the Chef
          </h2>

          <div className="mt-4 space-y-3">
            <div className="grid sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="micro-label text-[#6E5C52] block mb-1">STAR RATING</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full bg-white border border-[#E4D5C3] px-3 py-2 rounded-xl text-xs font-semibold text-[#23120B]"
                >
                  <option value={5}>★★★★★ (5 - Outstanding)</option>
                  <option value={4}>★★★★☆ (4 - Very Good)</option>
                  <option value={3}>★★★☆☆ (3 - Good)</option>
                  <option value={2}>★★☆☆☆ (2 - Fair)</option>
                  <option value={1}>★☆☆☆☆ (1 - Poor)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="micro-label text-[#6E5C52] block mb-1">TASTING NOTES (OPTIONAL)</label>
                <input
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell others what you loved about this dish..."
                  className="w-full bg-white border border-[#E4D5C3] px-3 py-2 rounded-xl text-xs text-[#23120B]"
                />
              </div>
            </div>

            <button
              onClick={submitRating}
              className="cc-btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-5"
            >
              Submit Tasting Review
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
