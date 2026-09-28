import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { clearAuthSession, getStoredRole } from "../roleUtils";

export default function Profile() {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch("/user/me");
        setMe(res?.user || res || null);
      } catch (e) {
        setError(e.message || "Failed to load profile");
        setMe(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const role = getStoredRole();
  const isKitchen = (me?.role || role) === "kitchen";
  const isAdmin = (me?.role || role) === "admin";

  const logout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F0E6DA] text-[#23120B] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#E4D5C3]">
          <div>
            <span className="micro-label text-[#4F6815]">
              {isKitchen ? "KITCHEN OWNER ACCOUNT" : "CUSTOMER ACCOUNT"}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#75070C] mt-1">
              {isKitchen ? "Chef & Kitchen Profile" : "Customer Profile"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="cc-btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-4"
              onClick={() => navigate(isKitchen ? "/kitchen-dashboard" : "/")}
            >
              {isKitchen ? "← Kitchen Portal" : "← Home"}
            </button>
            <button
              className="cc-btn-danger text-xs uppercase tracking-wider font-bold py-2.5 px-4"
              onClick={logout}
            >
              Sign Out
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-10 text-center">
            <p className="font-serif text-lg text-[#75070C]">Loading profile details...</p>
          </div>
        ) : error ? (
          <div className="cc-alert-error">{error}</div>
        ) : (
          <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center font-serif text-2xl font-bold text-[#FFFBEA] ${
                  isKitchen ? "bg-[#4F6815]" : "bg-[#75070C]"
                }`}>
                  {(me?.name || me?.email || "U").slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#75070C]">{me?.name || "User"}</h2>
                  <p className="text-xs text-[#6E5C52]">{me?.email || ""}</p>
                  <span className={`micro-label px-2.5 py-0.5 rounded-full inline-block mt-2 ${
                    isKitchen
                      ? "bg-[#4F6815]/15 text-[#4F6815] border border-[#4F6815]/30"
                      : "bg-[#FFFBEA] text-[#75070C] border border-[#F5EBCE]"
                  }`}>
                    {isKitchen ? "VERIFIED HOME CHEF / KITCHEN" : "CUSTOMER ACCOUNT"}
                  </span>
                </div>
              </div>
            </div>

            {/* Role-Specific Action Portals */}
            <div className="pt-6 border-t border-[#E4D5C3] space-y-4">
              <h3 className="micro-label text-[#75070C]">
                {isKitchen ? "CHEF MANAGEMENT ACTIONS" : "CUSTOMER ORDERING ACTIONS"}
              </h3>

              {isKitchen ? (
                /* Pure Kitchen Owner Options */
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    className="bg-[#4F6815] hover:bg-[#3E5210] text-[#FFFBEA] text-xs uppercase tracking-wider font-bold py-3.5 rounded-xl shadow-xs transition"
                    onClick={() => navigate("/kitchen-dashboard")}
                  >
                    Open Kitchen Dashboard →
                  </button>
                  <button
                    className="cc-btn-secondary text-xs uppercase tracking-wider font-bold py-3.5"
                    onClick={() => navigate("/kitchen-dashboard")}
                  >
                    Manage Menu & Products
                  </button>
                  <button
                    className="cc-btn-secondary text-xs uppercase tracking-wider font-bold py-3.5"
                    onClick={() => navigate("/kitchen-dashboard")}
                  >
                    Incoming Pre-Orders
                  </button>
                  <button
                    className="cc-btn-secondary text-xs uppercase tracking-wider font-bold py-3.5"
                    onClick={() => navigate("/kitchen-dashboard")}
                  >
                    FSSAI & Kitchen Settings
                  </button>
                </div>
              ) : (
                /* Pure Customer Options */
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    className="cc-btn-primary text-xs uppercase tracking-wider font-bold py-3.5"
                    onClick={() => navigate("/my-orders")}
                  >
                    My Orders & Pre-books →
                  </button>
                  <button
                    className="cc-btn-secondary text-xs uppercase tracking-wider font-bold py-3.5"
                    onClick={() => navigate("/browse-kitchens")}
                  >
                    Browse Home Kitchens
                  </button>
                  <button
                    className="cc-btn-butter text-xs uppercase tracking-wider font-bold py-3.5"
                    onClick={() => navigate("/subscriptions")}
                  >
                    Meal Subscriptions
                  </button>
                  <button
                    className="cc-btn-secondary text-xs uppercase tracking-wider font-bold py-3.5"
                    onClick={() => navigate("/offers")}
                  >
                    Today's Deals & Perks
                  </button>
                </div>
              )}

              {isAdmin && (
                <div className="pt-2">
                  <button
                    className="cc-btn-danger text-xs uppercase tracking-wider font-bold py-3 w-full"
                    onClick={() => navigate("/admin-dashboard")}
                  >
                    Admin Console →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
