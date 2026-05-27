import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

function matchesOffer(k) {
  if (!k) return false;

  // Prefer explicit fields if they exist now or later.
  if (k.hasOffer === true) return true;
  if (k.offer === true) return true;
  if (typeof k.offerText === "string" && k.offerText.trim()) return true;
  if (typeof k.offerTitle === "string" && k.offerTitle.trim()) return true;
  if (typeof k.discount === "number" && k.discount > 0) return true;
  if (typeof k.discountPercent === "number" && k.discountPercent > 0) return true;

  // Heuristic fallback based on text.
  const text = [k?.name, k?.description, k?.addressText]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return /(offer|discount|deal|%\s*off|\boff\b|save\b)/.test(text);
}

export default function Offers() {
  const navigate = useNavigate();

  const [kitchens, setKitchens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/kitchens");
      setKitchens(res?.kitchens || []);
    } catch (e) {
      setError(e.message || "Failed to load offers");
      setKitchens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const offerKitchens = useMemo(() => {
    return (kitchens || []).filter(matchesOffer);
  }, [kitchens]);

  return (
    <div className="min-h-screen bg-[#FFF7ED] text-[#1F2933] px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/offer.png"
              alt="Offers"
              className="h-10 w-10 object-contain mix-blend-multiply"
            />
            <div>
              <h1 className="text-3xl font-bold text-[#1F2933]">Offers</h1>
              <p className="text-sm text-[#6B7280]">Kitchens currently running deals.</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-5 py-2 rounded-full transition shadow-lg shadow-black/10 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
          >
            Home
          </button>
        </div>

        {error ? <p className="text-[#B91C1C] mb-4 font-medium">{error}</p> : null}

        {loading ? (
          <p className="text-[#6B7280]">Loading...</p>
        ) : offerKitchens.length === 0 ? (
          <div className="bg-white border border-black/5 shadow-xl shadow-black/10 rounded-2xl p-6">
            <p className="text-[#1F2933] font-semibold">No offers available right now.</p>
            <p className="text-[#6B7280] mt-1">Check back later for new deals.</p>
            <div className="mt-4">
              <button
                onClick={() => navigate("/browse-kitchens")}
                className="bg-white text-[#F97316] font-semibold px-5 py-2 rounded-full ring-1 ring-black/10 hover:bg-[#FFF7ED] transition"
              >
                Browse all kitchens
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {offerKitchens.map((k) => (
              <div key={k._id} className="bg-white border border-black/5 shadow-xl shadow-black/10 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-[#1F2933]">{k.name}</h2>
                      <span className="inline-flex items-center rounded-full bg-[#F59E0B] px-2.5 py-1 text-xs font-semibold text-[#1F2933]">
                        Offer
                      </span>
                    </div>
                    <p className="text-[#6B7280] mt-1">{k.description || ""}</p>
                    <p className="text-[#6B7280] text-sm mt-2">
                      Rating: {(k.avgRating || 0).toFixed(1)} ({k.ratingCount || 0})
                    </p>
                  </div>
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
                    className="bg-white text-[#F97316] font-semibold px-5 py-2 rounded-full ring-1 ring-black/10 hover:bg-[#FFF7ED] transition"
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
}
