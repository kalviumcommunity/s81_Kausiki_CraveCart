import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch, resolveUploadUrl } from "../api";

const POPULAR_SEARCHES = [
  "Biryani",
  "Sourdough",
  "Ramen",
  "Salad",
  "Pizza",
  "Galette",
  "Pure Veg",
  "Healthy Bowls",
  "Breakfast",
  "Idly",
  "Dosa",
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [kitchens, setKitchens] = useState([]);
  const [realDishes, setRealDishes] = useState([]);
  const [loadingKitchens, setLoadingKitchens] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await apiFetch("/api/kitchens");
        if (!alive) return;
        setKitchens(res?.kitchens || []);

        try {
          const d = await apiFetch("/api/kitchens/explore/dishes");
          if (!alive) return;
          setRealDishes(d?.dishes || []);
        } catch {
          // explore dishes optional
        }

        try {
          const f = await apiFetch("/api/favorites/my");
          if (!alive) return;
          setFavorites(f.favorites || []);
        } catch {
          // favorites optional
        }
      } catch {
        // fallback
      } finally {
        if (alive) setLoadingKitchens(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const favoriteIds = useMemo(() => new Set((favorites || []).map((k) => String(k._id))), [favorites]);

  const toggleFavorite = async (kitchenId) => {
    try {
      const res = await apiFetch(`/api/favorites/${kitchenId}/toggle`, { method: "POST" });
      setFavorites(res.favorites || []);
    } catch {
      // ignore
    }
  };

  const allDishes = useMemo(() => {
    return (realDishes || []).map((m) => {
      const portionsLeft = Math.max(0, (m.totalQty || 0) - (m.soldQty || 0));
      return {
        id: m._id,
        _id: m._id,
        kitchenId: m.kitchenId?._id || m.kitchenId,
        name: m.title,
        chef: m.kitchenId?.name || "Artisanal Home Kitchen",
        cuisine: `${m.mealType ? m.mealType.charAt(0).toUpperCase() + m.mealType.slice(1) : "Breakfast"} • Home-Cooked`,
        rating: Number((m.kitchenId?.avgRating || 4.9).toFixed(1)),
        reviews: m.kitchenId?.ratingCount || 12,
        time: "20 min",
        price: `₹${m.price}`,
        rawPrice: m.price,
        tag: portionsLeft > 0 ? `${portionsLeft} portions left` : "Fresh Batch",
        isVeg: true,
        image: resolveUploadUrl(m.imageUrl) || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
        isReal: true,
      };
    });
  }, [realDishes]);

  // Filtered dishes
  const matchingDishes = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = allDishes;

    if (activeFilter === "veg") {
      list = list.filter((d) => d.isVeg);
    }

    if (!q) return list;

    return list.filter((d) => {
      return (
        d.name.toLowerCase().includes(q) ||
        d.chef.toLowerCase().includes(q) ||
        d.cuisine.toLowerCase().includes(q) ||
        (d.tag && d.tag.toLowerCase().includes(q))
      );
    });
  }, [allDishes, query, activeFilter]);

  // Filtered kitchens
  const matchingKitchens = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return kitchens;

    return (kitchens || []).filter((k) => {
      const haystack = [k?.name, k?.description, k?.addressText, k?.pincode]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, kitchens]);

  return (
    <div className="min-h-screen bg-[#F0E6DA] text-[#23120B] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#E4D5C3]">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-[#75070C] text-[#FFFBEA] flex items-center justify-center font-serif text-xl font-bold">
              C
            </div>
            <span className="font-serif text-2xl font-bold text-[#75070C]">CraveCart</span>
          </Link>

          <button
            onClick={() => navigate("/")}
            className="cc-btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-4"
          >
            ← Back to Home
          </button>
        </div>

        {/* Large Editorial Search Box */}
        <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-8 shadow-sm">
          <span className="micro-label text-[#4F6815]">EXPLORE FOOD & KITCHENS</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#75070C] mt-1">
            Search CraveCart
          </h1>

          <div className="relative mt-5">
            <input
              type="text"
              autoFocus
              placeholder="Search dishes, home chefs, cuisines, or keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white border-2 border-[#E4D5C3] focus:border-[#75070C] text-sm sm:text-base font-medium rounded-2xl px-5 py-4 pr-12 text-[#23120B] shadow-xs outline-none transition"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#6E5C52] hover:text-[#75070C] font-bold p-1"
              >
                ✕
              </button>
            ) : (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-[#6E5C52]">
                🔍
              </span>
            )}
          </div>

          {/* Popular Search Suggestions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs micro-label text-[#6E5C52] mr-1">POPULAR:</span>
            {POPULAR_SEARCHES.map((item) => (
              <button
                key={item}
                onClick={() => setQuery(item)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                  query.toLowerCase() === item.toLowerCase()
                    ? "bg-[#75070C] text-[#FFFBEA]"
                    : "bg-white border border-[#E4D5C3] text-[#23120B] hover:border-[#75070C]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Filter Pills */}
          <div className="mt-6 pt-6 border-t border-[#E4D5C3] flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Items" },
              { id: "dishes", label: "Dishes Only" },
              { id: "kitchens", label: "Kitchens Only" },
              { id: "veg", label: "Pure Veg 🌱" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition ${
                  activeFilter === tab.id
                    ? "bg-[#75070C] text-[#FFFBEA] shadow-sm"
                    : "bg-white border border-[#E4D5C3] text-[#23120B] hover:border-[#75070C]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-8">
          
          {/* Dishes Results */}
          {activeFilter !== "kitchens" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-2xl font-bold text-[#75070C]">
                  Artisanal Dishes {query ? `matching "${query}"` : ""}
                </h2>
                <span className="text-xs text-[#6E5C52] font-semibold">
                  {matchingDishes.length} dish{matchingDishes.length !== 1 ? "es" : ""} found
                </span>
              </div>

              {matchingDishes.length === 0 ? (
                <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-8 text-center">
                  <p className="font-serif text-lg text-[#75070C]">No dishes match your query</p>
                  <p className="text-xs text-[#6E5C52] mt-1">Try another keyword like "Biryani", "Ramen", or "Sourdough".</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchingDishes.map((dish) => (
                    <div
                      key={dish.id}
                      className="group rounded-3xl bg-[#FAF6F0] border border-[#E4D5C3] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-48 w-full overflow-hidden bg-[#E4D5C3]">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                          <div className="absolute top-3 left-3 flex gap-1.5">
                            <span className="micro-label bg-[#FAF6F0]/90 backdrop-blur text-[#75070C] px-2.5 py-1 rounded-lg border border-[#E4D5C3]">
                              {dish.tag}
                            </span>
                            {dish.isVeg ? (
                              <span className="micro-label bg-[#4F6815] text-[#FFFBEA] px-2 py-1 rounded-lg">
                                VEG 🌱
                              </span>
                            ) : (
                              <span className="micro-label bg-[#75070C] text-[#FFFBEA] px-2 py-1 rounded-lg">
                                NON-VEG 🍗
                              </span>
                            )}
                          </div>
                          <div className="absolute bottom-3 right-3 bg-[#23120B]/80 backdrop-blur text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">
                            ⏱ {dish.time}
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="flex items-center justify-between text-xs text-[#6E5C52]">
                            <span className="micro-label text-[#4F6815]">{dish.cuisine}</span>
                            <span className="font-semibold text-[#75070C] flex items-center gap-1">
                              ★ {dish.rating.toFixed(1)} <span className="text-[#6E5C52] font-normal">({dish.reviews})</span>
                            </span>
                          </div>

                          <h3 className="font-serif text-xl font-bold text-[#23120B] mt-2 group-hover:text-[#75070C] transition">
                            {dish.name}
                          </h3>
                          <p className="text-xs text-[#6E5C52] mt-1">by <span className="font-semibold text-[#23120B]">{dish.chef}</span></p>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-2 border-t border-[#E4D5C3]/60 flex items-center justify-between">
                        <span className="font-serif text-lg font-extrabold text-[#75070C]">
                          {dish.price}
                        </span>
                        <button
                          onClick={() => dish.kitchenId ? navigate(`/kitchens/${dish.kitchenId}`) : navigate("/browse-kitchens")}
                          className="cc-btn-primary text-xs uppercase tracking-wider font-bold py-2 px-4 rounded-xl"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Kitchens Results */}
          {activeFilter !== "dishes" && (
            <div className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-2xl font-bold text-[#75070C]">
                  Verified Home Kitchens {query ? `matching "${query}"` : ""}
                </h2>
                <span className="text-xs text-[#6E5C52] font-semibold">
                  {matchingKitchens.length} kitchen{matchingKitchens.length !== 1 ? "s" : ""} found
                </span>
              </div>

              {loadingKitchens ? (
                <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-8 text-center flex items-center justify-center gap-2 text-sm text-[#75070C]">
                  <div className="w-5 h-5 border-2 border-[#75070C] border-t-transparent rounded-full animate-spin" />
                  <span>Loading kitchens...</span>
                </div>
              ) : matchingKitchens.length === 0 ? (
                <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-8 text-center">
                  <p className="font-serif text-lg text-[#75070C]">No home kitchens found for this search</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {matchingKitchens.map((k) => (
                    <div
                      key={k._id}
                      className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif text-xl font-bold text-[#75070C]">{k.name}</h3>
                              <span className="cc-badge-olive text-[10px]">Verified</span>
                            </div>
                            <p className="text-xs text-[#6E5C52] mt-1.5 leading-relaxed">
                              {k.description || "Artisanal home kitchen cooking fresh seasonal meals."}
                            </p>
                            {k.addressText && (
                              <p className="text-xs text-[#4F6815] font-semibold mt-2">
                                📍 {k.addressText} {k.pincode ? `(${k.pincode})` : ""}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => toggleFavorite(k._id)}
                            className="text-lg hover:scale-110 transition p-1"
                          >
                            {favoriteIds.has(String(k._id)) ? "❤️" : "🤍"}
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[#E4D5C3]/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#75070C]">
                          ★ {(k.avgRating || 0).toFixed(1)} ({k.ratingCount || 0} reviews)
                        </span>
                        <button
                          onClick={() => navigate(`/kitchens/${k._id}`)}
                          className="cc-btn-primary text-xs uppercase tracking-wider font-bold py-2 px-4"
                        >
                          View Menu →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
