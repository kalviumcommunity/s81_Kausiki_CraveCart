import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

function matchesOffer(k) {
  if (!k) return false;
  if (k.hasOffer === true || k.offer === true) return true;
  if (typeof k.offerText === "string" && k.offerText.trim()) return true;
  if (typeof k.offerTitle === "string" && k.offerTitle.trim()) return true;
  if (typeof k.discount === "number" && k.discount > 0) return true;
  if (typeof k.discountPercent === "number" && k.discountPercent > 0) return true;
  const text = [k?.name, k?.description, k?.addressText].filter(Boolean).join(" ").toLowerCase();
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
    <div className="min-h-screen bg-[#F0E6DA] text-[#23120B] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E4D5C3]">
          <div>
            <span className="micro-label text-[#75070C]">PROMOTIONAL SELECTION</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#75070C] mt-1">
              Today's Chef Offers & Tasting Perks
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5C52] mt-1">
              Curated introductory deals and seasonal discounts from verified home kitchens.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="cc-btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-5 self-start sm:self-auto"
          >
            ← Back to Home
          </button>
        </div>

        {/* Featured Butter Promo Highlight */}
        <div className="bg-[#FFFBEA] border border-[#E4D5C3] rounded-3xl p-6 sm:p-10 mb-10 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="micro-label bg-[#75070C] text-[#FFFBEA] px-3 py-1 rounded-full">
                CODE: BUTTER15
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#75070C] mt-3">
                15% Off Your First Artisanal Pre-Order
              </h2>
              <p className="text-xs sm:text-sm text-[#23120B]/85 mt-2 max-w-lg">
                Use promo code <span className="font-bold text-[#75070C]">BUTTER15</span> at checkout to enjoy savings across all neighborhood home chef kitchens.
              </p>
            </div>
            <button
              onClick={() => navigate("/browse-kitchens")}
              className="cc-btn-primary text-xs uppercase tracking-wider font-bold py-3 px-6 whitespace-nowrap"
            >
              Browse Eligible Kitchens →
            </button>
          </div>
        </div>

        {error && <div className="cc-alert-error mb-6">{error}</div>}

        {loading ? (
          <div className="py-20 text-center">
            <p className="font-serif text-lg text-[#75070C]">Scanning for active kitchen offers...</p>
          </div>
        ) : offerKitchens.length === 0 ? (
          <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-12 text-center">
            <span className="text-4xl">🏷️</span>
            <h3 className="font-serif text-2xl font-bold text-[#75070C] mt-4">
              All neighborhood chefs are currently cooking standard menus
            </h3>
            <p className="text-xs sm:text-sm text-[#6E5C52] mt-2 max-w-md mx-auto">
              Check back daily for pop-up discounts or browse our full collection of verified home kitchens.
            </p>
            <button
              onClick={() => navigate("/browse-kitchens")}
              className="mt-6 cc-btn-primary text-xs uppercase tracking-wider font-bold py-3 px-6"
            >
              Browse All Kitchens
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {offerKitchens.map((k) => (
              <div
                key={k._id}
                className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-serif text-2xl font-bold text-[#75070C]">{k.name}</h2>
                        <span className="micro-label bg-[#FFFBEA] text-[#75070C] px-2.5 py-1 rounded-full border border-[#F5EBCE]">
                          SPECIAL OFFER
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#6E5C52] mt-2 leading-relaxed">
                        {k.description || "Freshly cooked to order with special limited-time discounts."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#E4D5C3] flex items-center gap-4 text-xs">
                    <span className="font-bold text-[#75070C]">
                      ★ {(k.avgRating || 0).toFixed(1)} ({k.ratingCount || 0} reviews)
                    </span>
                    <span className="text-[#4F6815] font-semibold">Special Discount Active</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E4D5C3]/60 flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/kitchens/${k._id}`)}
                    className="flex-1 cc-btn-primary text-xs uppercase tracking-wider font-bold py-2.5"
                  >
                    View Menu & Claim Deal →
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
