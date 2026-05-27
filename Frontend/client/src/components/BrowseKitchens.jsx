import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

const BrowseKitchens = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [kitchens, setKitchens] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
      // Prefer explicit fields if they exist now or later.
      if (k.hasOffer === true) return true;
      if (k.offer === true) return true;
      if (typeof k.offerText === "string" && k.offerText.trim()) return true;
      if (typeof k.offerTitle === "string" && k.offerTitle.trim()) return true;
      if (typeof k.discount === "number" && k.discount > 0) return true;
      if (typeof k.discountPercent === "number" && k.discountPercent > 0) return true;

      // Fallback heuristic: look for offer-y keywords in description/name.
      const text = [k?.name, k?.description, k?.addressText]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return /(offer|discount|deal|%\s*off|\boff\b|save\b)/.test(text);
    };

    return (kitchens || []).filter((k) => {
      if (offersOnly && !matchesOffer(k)) return false;
      const haystack = [k?.name, k?.description, k?.addressText, k?.pincode]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!parts.length) return true;
      return parts.every((p) => haystack.includes(p));
    });
  }, [kitchens, searchQuery, offersOnly]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const k = await apiFetch("/api/kitchens");
      setKitchens(k.kitchens || []);

      // favorites require auth; ignore if not logged-in
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
    <div className="min-h-screen bg-[#FFF7ED] text-[#1F2933] px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#1F2933]">Verified Kitchens</h1>
          <button
            onClick={() => navigate("/")}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-5 py-2 rounded-full transition shadow-lg shadow-black/10 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
          >
            Home
          </button>
        </div>

        <div className="mb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-lg">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search kitchens by name, description, address, or pincode..."
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-10 text-sm text-[#1F2933] shadow-sm shadow-black/5 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-2 py-1 text-[#6B7280] hover:text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
                  aria-label="Clear search"
                  title="Clear"
                >
                  ✕
                </button>
              ) : null}
            </div>

            <p className="text-sm text-[#6B7280]">
              {searchQuery ? (
                <>
                  Showing <span className="font-semibold text-[#1F2933]">{filteredKitchens.length}</span> of{" "}
                  <span className="font-semibold text-[#1F2933]">{kitchens.length}</span>
                </>
              ) : (
                <>
                  Total <span className="font-semibold text-[#1F2933]">{kitchens.length}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {error && <p className="text-[#B91C1C] mb-4 font-medium">{error}</p>}
        {loading ? (
          <p className="text-[#6B7280]">Loading...</p>
        ) : kitchens.length === 0 ? (
          <p className="text-[#6B7280]">No verified kitchens yet.</p>
        ) : filteredKitchens.length === 0 ? (
          <div className="bg-white border border-black/5 shadow-xl shadow-black/10 rounded-2xl p-6">
            <p className="text-[#1F2933] font-semibold">No kitchens match your search.</p>
            <p className="text-[#6B7280] mt-1">Try searching by kitchen name, pincode, or a keyword.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredKitchens.map((k) => (
              <div
                key={k._id}
                className="bg-white border border-black/5 shadow-xl shadow-black/10 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-[#1F2933]">{k.name}</h2>
                      <span className="inline-flex items-center rounded-full bg-[#15803D] px-2.5 py-1 text-xs font-semibold text-white">
                        Verified
                      </span>
                    </div>
                    <p className="text-[#6B7280] mt-1">{k.description || ""}</p>
                    <p className="text-[#6B7280] text-sm mt-2">
                      Rating: {(k.avgRating || 0).toFixed(1)} ({k.ratingCount || 0})
                    </p>
                  </div>

                  <button
                    onClick={() => toggleFavorite(k._id)}
                    className={`font-semibold text-2xl leading-none transition ${
                      favoriteIds.has(String(k._id))
                        ? "text-[#DC2626]"
                        : "text-[#6B7280] hover:text-[#DC2626]"
                    }`}
                    title="Save as favorite"
                  >
                    {favoriteIds.has(String(k._id)) ? "★" : "☆"}
                  </button>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => navigate(`/kitchens/${k._id}`)}
                    className="bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-5 py-2 rounded-full transition shadow-lg shadow-black/10 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
                  >
                    View Kitchen
                  </button>
                  <button
                    onClick={() => navigate(`/kitchens/${k._id}`)}
                    className="bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-5 py-2 rounded-full transition shadow-lg shadow-black/10 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseKitchens;
