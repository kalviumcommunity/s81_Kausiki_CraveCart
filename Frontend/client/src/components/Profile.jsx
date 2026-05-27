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

  const logout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="cc-page">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1F2933]">Profile</h1>
            <p className="cc-muted mt-1">Your account details and quick links.</p>
          </div>
          <div className="flex gap-3">
            <button className="cc-btn-primary px-4 py-2" onClick={() => navigate("/")}>Home</button>
            <button className="cc-btn-danger px-4 py-2" onClick={logout}>Logout</button>
          </div>
        </div>

        {loading ? (
          <div className="cc-card-pad">
            <p className="cc-muted">Loading...</p>
          </div>
        ) : error ? (
          <div className="cc-alert-error">{error}</div>
        ) : (
          <div className="cc-card-pad">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-[#F97316]">Signed in as</p>
                <p className="mt-2 text-xl font-semibold text-[#1F2933]">{me?.name || "User"}</p>
                <p className="cc-muted mt-1">{me?.email || ""}</p>
              </div>

              <div className="text-sm">
                <p className="cc-muted">Role</p>
                <p className="mt-1 font-semibold text-[#1F2933]">{me?.role || role || "customer"}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button className="cc-btn-primary px-5 py-2" onClick={() => navigate("/my-orders")}>My Orders</button>
              <button className="cc-btn-secondary px-5 py-2" onClick={() => navigate("/browse-kitchens")}>Browse Kitchens</button>
              {(me?.role || role) === "kitchen" ? (
                <button className="cc-btn-secondary px-5 py-2" onClick={() => navigate("/kitchen-dashboard")}>Kitchen Dashboard</button>
              ) : null}
              {(me?.role || role) === "admin" ? (
                <button className="cc-btn-secondary px-5 py-2" onClick={() => navigate("/admin-dashboard")}>Admin Dashboard</button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
