import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

export default function BrowseKitchens() {
  const navigate = useNavigate();
  const location = useLocation();

  const [kitchens, setKitchens] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const offersOnly = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("offers") === "1";
  }, [location.search]);

  const favoriteIds = useMemo(() => new Set((favorites || []).map((k) => String(k._id))), [favorites]);

  const filteredKitchens = useMemo(() => {
    const q = String(searchQuery || "").trim().toLowerCase();
    const parts = q ? q.split(/\s+/).filter(Boolean) : [];

    const matchesOffer = (k) => {
      if (!k) return false;
      if (k.hasOffer === true || k.offer === true) return true;
      if (typeof k.offerText === "string" && k.offerText.trim()) return true;
      if (typeof k.offerTitle === "string" && k.offerTitle.trim()) return true;
      if (typeof k.discount === "number" && k.discount > 0) return true;
      if (typeof k.discountPercent === "number" && k.discountPercent > 0) return true;
      const text = [k?.name, k?.description, k?.addressText].filter(Boolean).join(" ").toLowerCase();
      return /(offer|discount|deal|%\s*off|\boff\b|save\b)/.test(text);
    };

    return (kitchens || []).filter((k) => {
      if (offersOnly && !matchesOffer(k)) return false;
      if (filterRating === "4plus" && (k.avgRating || 0) < 4.0) return false;
      if (filterRating === "45plus" && (k.avgRating || 0) < 4.5) return false;

      const haystack = [k?.name, k?.description, k?.addressText, k?.pincode]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!parts.length) return true;
      return parts.every((p) => haystack.includes(p));
    });
  }, [kitchens, searchQuery, offersOnly, filterRating]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const k = await apiFetch("/api/kitchens");
      setKitchens(k.kitchens || []);

      try {
        const f = await apiFetch("/api/favorites/my");
        setFavorites(f.favorites || []);
      } catch {
        setFavorites([]);
      }
    } catch (e) {
      setError(e.message || "Failed to load kitchens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleFavorite = async (kitchenId) => {
    setError("");
    try {
      const res = await apiFetch(`/api/favorites/${kitchenId}/toggle`, { method: "POST" });
      setFavorites(res.favorites || []);
    } catch (e) {
      setError(e.message || "Failed to update favorite");
    }
  };

  return (
    <div className="min-h-screen bg-[#F0E6DA] text-[#23120B] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E4D5C3]">
          <div>
            <span className="micro-label text-[#4F6815]">DIRECTORY • VERIFIED PRODUCERS</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#75070C] mt-1">
              Verified Home Kitchens
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5C52] mt-1">
              Discover certified home chefs cooking small-batch daily meals.
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
              onClick={() => navigate("/offers")}
              className="cc-btn-butter text-xs uppercase tracking-wider font-bold py-2.5 px-4"
            >
              View Offers
            </button>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search kitchens by name, cuisine, address, or pincode..."
              className="w-full rounded-xl border border-[#E4D5C3] bg-white px-4 py-2.5 pr-10 text-xs sm:text-sm text-[#23120B] focus:border-[#75070C]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6E5C52] hover:text-[#75070C]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="micro-label text-[#6E5C52] hidden sm:inline">RATING:</span>
            <button
              onClick={() => setFilterRating("all")}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition ${
                filterRating === "all"
                  ? "bg-[#75070C] text-[#FFFBEA]"
                  : "bg-white border border-[#E4D5C3] text-[#23120B]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRating("4plus")}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition ${
                filterRating === "4plus"
                  ? "bg-[#75070C] text-[#FFFBEA]"
                  : "bg-white border border-[#E4D5C3] text-[#23120B]"
              }`}
            >
              ★ 4.0+
            </button>
            <button
              onClick={() => setFilterRating("45plus")}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition ${
                filterRating === "45plus"
                  ? "bg-[#75070C] text-[#FFFBEA]"
                  : "bg-white border border-[#E4D5C3] text-[#23120B]"
              }`}
            >
              ★ 4.5+
            </button>
          </div>
        </div>

        {error && <div className="cc-alert-error mb-6">{error}</div>}

        {loading ? (
          <div className="py-20 text-center">
            <p className="font-serif text-lg text-[#75070C]">Fetching artisanal kitchen directory...</p>
          </div>
        ) : kitchens.length === 0 ? (
          <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-12 text-center">
            <span className="text-4xl">🍳</span>
            <h3 className="font-serif text-2xl font-bold text-[#75070C] mt-4">No verified kitchens found yet</h3>
            <p className="text-xs sm:text-sm text-[#6E5C52] mt-2">
              Be the first passionate cook to share your cuisine with the neighborhood.
            </p>
            <button
              onClick={() => navigate("/register-kitchen")}
              className="mt-6 cc-btn-olive text-xs uppercase tracking-wider font-bold py-3 px-6"
            >
              Register as Home Chef
            </button>
          </div>
        ) : filteredKitchens.length === 0 ? (
          <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-10 text-center">
            <h3 className="font-serif text-xl font-bold text-[#75070C]">No kitchens match your search criteria</h3>
            <p className="text-xs text-[#6E5C52] mt-1">Try resetting the search terms or rating filters.</p>
            <button
              onClick={() => { setSearchQuery(""); setFilterRating("all"); }}
              className="mt-4 cc-btn-secondary text-xs font-bold py-2 px-4"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredKitchens.map((k) => (
              <div
                key={k._id}
                className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-serif text-2xl font-bold text-[#75070C]">{k.name}</h2>
                        <span className="cc-badge-olive text-[10px]">
                          ✓ Verified
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#6E5C52] mt-2 leading-relaxed">
                        {k.description || "Artisanal home kitchen preparing fresh, authentic seasonal meals daily."}
                      </p>
                      
                      {k.addressText && (
                        <p className="text-xs text-[#4F6815] font-semibold mt-2 flex items-center gap-1">
                          📍 {k.addressText} {k.pincode ? `(${k.pincode})` : ""}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => toggleFavorite(k._id)}
                      className="text-xl hover:scale-110 transition p-1"
                      title="Save as favorite"
                    >
                      {favoriteIds.has(String(k._id)) ? "❤️" : "🤍"}
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#E4D5C3] flex items-center gap-4 text-xs">
                    <span className="font-bold text-[#75070C] flex items-center gap-1">
                      ★ {(k.avgRating || 0).toFixed(1)}
                      <span className="font-normal text-[#6E5C52]">({k.ratingCount || 0} reviews)</span>
                    </span>
                    <span className="text-[#6E5C52]">•</span>
                    <span className="text-[#4F6815] font-semibold">Freshly Cooked to Order</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E4D5C3]/60 flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/kitchens/${k._id}`)}
                    className="flex-1 cc-btn-primary text-xs uppercase tracking-wider font-bold py-2.5"
                  >
                    View Menu & Order →
                  </button>
                  <button
                    onClick={() => navigate(`/kitchens/${k._id}`)}
                    className="cc-btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-4"
                  >
                    Pre-Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
