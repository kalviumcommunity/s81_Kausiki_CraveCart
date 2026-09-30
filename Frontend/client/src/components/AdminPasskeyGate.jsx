import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FiKey, FiEye, FiEyeOff, FiArrowRight, FiShield, FiAlertCircle } from "react-icons/fi";
import { apiFetch, API_BASE } from "../api";
import { persistAuthSession, clearAuthSession, getStoredToken } from "../roleUtils";
import AdminDashboard from "./AdminDashboard";

export default function AdminPasskeyGate() {
  const [checking, setChecking] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if existing session is already an admin
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setChecking(false);
      return;
    }

    apiFetch("/user/me")
      .then((res) => {
        if (res?.user?.role === "admin") {
          persistAuthSession(token, "admin");
          setIsUnlocked(true);
        } else {
          setIsUnlocked(false);
        }
      })
      .catch(() => {
        setIsUnlocked(false);
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  const handleUnlock = async (e) => {
    e.preventDefault();
    const trimmed = passkey.trim();
    if (!trimmed) {
      setError("Please enter the admin passkey");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/user/admin-passkey-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: trimmed }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data?.token) {
        persistAuthSession(data.token, "admin");
        setIsUnlocked(true);
      } else {
        setError(data?.message || "Invalid admin passkey. Access denied.");
      }
    } catch {
      setError("Network error. Please make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleLockAdmin = () => {
    clearAuthSession();
    setIsUnlocked(false);
    setPasskey("");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F0E6DA] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#75070C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If already unlocked, render the full admin dashboard
  if (isUnlocked) {
    return <AdminDashboard onLock={handleLockAdmin} />;
  }

  // Otherwise, render the dedicated Passkey screen
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
        <Link
          to="/"
          className="text-xs font-bold uppercase tracking-wider text-[#6E5C52] hover:text-[#75070C] transition"
        >
          ← Back to Marketplace
        </Link>
      </div>

      {/* Center Passkey Card */}
      <motion.div
        className="w-full max-w-md mx-auto my-8 bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Subtle decorative background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#75070C]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#4F6815]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-[#75070C]/10 text-[#75070C] mx-auto flex items-center justify-center mb-4 border border-[#75070C]/20 shadow-sm">
            <FiShield className="h-7 w-7" />
          </div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#4F6815] bg-[#4F6815]/10 px-3 py-1 rounded-full border border-[#4F6815]/20">
            ADMIN SECURITY GATE
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-[#75070C] mt-3">
            Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5C52] mt-1.5 leading-relaxed">
            Enter your admin passkey to access platform management, verifications, and settings.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="mt-8 space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6E5C52] mb-1.5">
              Admin Passkey
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6E5C52]">
                <FiKey className="h-4 w-4" />
              </div>
              <input
                type={showPasskey ? "text" : "password"}
                value={passkey}
                onChange={(e) => {
                  setPasskey(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter secret passkey..."
                autoFocus
                className="w-full pl-10 pr-11 py-3 bg-[#FFFDF9] border border-[#E4D5C3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#75070C] focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6E5C52] hover:text-[#23120B] transition"
              >
                {showPasskey ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium"
              >
                <FiAlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#75070C] text-[#FFFBEA] font-bold text-sm hover:bg-[#5C0509] active:scale-[0.99] disabled:opacity-60 transition shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Unlock Dashboard</span>
                <FiArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#E4D5C3]/60 text-center relative z-10">
          <p className="text-[11px] text-[#6E5C52]">
            Passkey protected • Direct access without account sign-in
          </p>
        </div>
      </motion.div>

      {/* Bottom Footer */}
      <div className="mx-auto w-full max-w-6xl text-center text-xs text-[#6E5C52]">
        &copy; {new Date().getFullYear()} CraveCart Platform Administration
      </div>
    </div>
  );
}
