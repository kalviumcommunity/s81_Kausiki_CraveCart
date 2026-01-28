import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

const BrowseKitchens = () => {
  const navigate = useNavigate();

  const [kitchens, setKitchens] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const favoriteIds = useMemo(() => new Set((favorites || []).map((k) => String(k._id))), [favorites]);

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

        {error && <p className="text-[#B91C1C] mb-4 font-medium">{error}</p>}
        {loading ? (
          <p className="text-[#6B7280]">Loading...</p>
        ) : kitchens.length === 0 ? (
          <p className="text-[#6B7280]">No verified kitchens yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {kitchens.map((k) => (
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
