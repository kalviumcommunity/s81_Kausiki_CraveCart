import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { apiFetch } from "../api";
import { getRedirectForRole, persistAuthSession } from "../roleUtils";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Selected Role at the very start: "customer" | "kitchen"
  const [selectedRole, setSelectedRole] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("role") === "kitchen" ? "kitchen" : "customer";
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const checkSession = async () => {
      try {
        await apiFetch("/user/me");
        const role = localStorage.getItem("userRole") || "customer";
        navigate(getRedirectForRole(role), { replace: true });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
      }
    };

    checkSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:1111/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: selectedRole }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        const role = selectedRole || data?.user?.role || "customer";
        persistAuthSession(data.token || "", role);
        navigate(getRedirectForRole(role), { replace: true });
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0E6DA] text-[#23120B] flex flex-col justify-between px-4 py-8 relative">
      
      {/* Top Bar Logo */}
      <div className="mx-auto w-full max-w-6xl flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-[#75070C] text-[#FFFBEA] flex items-center justify-center font-serif text-xl font-bold">
            C
          </div>
          <span className="font-serif text-2xl font-bold text-[#75070C]">CraveCart</span>
        </Link>
        <Link to="/" className="text-xs font-bold uppercase tracking-wider text-[#6E5C52] hover:text-[#75070C]">
          ← Back to Marketplace
        </Link>
      </div>

      {/* Center Auth Card */}
      <motion.div
        className="w-full max-w-lg mx-auto my-8 bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-10 shadow-sm"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center">
          <span className="micro-label text-[#4F6815]">AUTHENTICATION</span>
          <h1 className="font-serif text-3xl font-extrabold text-[#75070C] mt-1">
            Sign In to CraveCart
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5C52] mt-1">
            Choose your account type to access your dedicated portal.
          </p>
        </div>

        {/* STEP 1: Two Prominent Role Selection Options */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedRole("customer")}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
              selectedRole === "customer"
                ? "border-2 border-[#75070C] bg-[#FFFBEA] shadow-xs"
                : "border-[#E4D5C3] bg-white hover:border-[#75070C]/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🍽️</span>
              {selectedRole === "customer" && (
                <span className="h-5 w-5 rounded-full bg-[#75070C] text-[#FFFBEA] flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <div className="mt-3">
              <h3 className="font-serif text-base font-bold text-[#75070C]">Customer</h3>
              <p className="text-[11px] text-[#6E5C52] mt-0.5 leading-tight">
                Browse products & order freshly cooked meals
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("kitchen")}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
              selectedRole === "kitchen"
                ? "border-2 border-[#4F6815] bg-[#FFFBEA] shadow-xs"
                : "border-[#E4D5C3] bg-white hover:border-[#4F6815]/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">👨‍🍳</span>
              {selectedRole === "kitchen" && (
                <span className="h-5 w-5 rounded-full bg-[#4F6815] text-[#FFFBEA] flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <div className="mt-3">
              <h3 className="font-serif text-base font-bold text-[#4F6815]">Kitchen Owner</h3>
              <p className="text-[11px] text-[#6E5C52] mt-0.5 leading-tight">
                Manage your dishes, prep stock & incoming orders
              </p>
            </div>
          </button>
        </div>

        {error && <div className="cc-alert-error mt-6">{error}</div>}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="micro-label text-[#6E5C52] block mb-1">
              {selectedRole === "kitchen" ? "KITCHEN OWNER EMAIL" : "CUSTOMER EMAIL ADDRESS"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-[#23120B] focus:border-[#75070C]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="micro-label text-[#6E5C52]">PASSWORD</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-[#75070C] hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 pr-10 rounded-xl text-xs sm:text-sm text-[#23120B] focus:border-[#75070C]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E5C52] hover:text-[#75070C]"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-xs uppercase tracking-wider font-bold py-3.5 rounded-xl transition shadow-xs text-white ${
              selectedRole === "kitchen"
                ? "bg-[#4F6815] hover:bg-[#3E5210]"
                : "bg-[#75070C] hover:bg-[#5E0509]"
            }`}
          >
            {loading
              ? "Signing In..."
              : selectedRole === "kitchen"
              ? "Sign In to Kitchen Dashboard →"
              : "Sign In as Customer →"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#E4D5C3] text-center">
          <p className="text-xs text-[#6E5C52]">
            Don't have an account?{" "}
            <Link
              to={`/signup?role=${selectedRole}`}
              className="font-bold text-[#75070C] hover:underline"
            >
              Create {selectedRole === "kitchen" ? "Kitchen Owner" : "Customer"} Account
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="mx-auto text-center text-xs text-[#6E5C52]">
        © {new Date().getFullYear()} CraveCart Artisanal Food Commerce
      </div>
    </div>
  );
}