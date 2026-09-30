import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { apiFetch } from "../api";
import { persistAuthSession, getStoredToken } from "../roleUtils";

export default function KitchenOwnerPortal() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already logged in as kitchen owner
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setCheckingAuth(false);
      return;
    }

    apiFetch("/user/me")
      .then((res) => {
        const role = res?.user?.role;
        if (role === "kitchen" || role === "admin") {
          navigate("/kitchen-dashboard", { replace: true });
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        setCheckingAuth(false);
      });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password to sign in.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:1111/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "kitchen" }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        persistAuthSession(data.token || "", "kitchen");
        navigate("/kitchen-dashboard", { replace: true });
      } else {
        setError(data.message || "Email or password was incorrect. Please check and try again.");
      }
    } catch {
      setError("Unable to connect to the server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in your name, email, and password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter carefully.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:1111/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "kitchen" }),
      });

      const data = await response.json();

      if (response.ok) {
        // Automatically sign in the newly registered home chef
        const loginRes = await fetch("http://localhost:1111/user/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role: "kitchen" }),
          credentials: "include",
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          persistAuthSession(loginData.token || "", "kitchen");
          navigate("/kitchen-dashboard", { replace: true });
        } else {
          setMode("login");
          setError("Your home chef account was created! Please enter your password to sign in.");
        }
      } else {
        setError(data.message || "This email is already registered. Please sign in instead.");
      }
    } catch {
      setError("Unable to connect. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F0E6DA] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#4F6815] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-base font-bold text-[#4F6815]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFE4D6] text-[#23120B] flex flex-col justify-between relative overflow-hidden px-4 py-6">
      {/* Soft ambient background glow */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#4F6815]/8 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#75070C]/6 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4" />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-2xl bg-[#4F6815] text-[#FFFBEA] flex items-center justify-center font-serif text-xl font-bold shadow-xs group-hover:scale-105 transition duration-200">
            👩‍🍳
          </div>
          <div>
            <span className="font-serif text-2xl font-black text-[#4F6815] tracking-tight">CraveCart</span>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-[#4F6815]/10 text-[#4F6815] px-2 py-0.5 rounded-full border border-[#4F6815]/20">
              Chef Portal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xs font-bold uppercase tracking-wider text-[#6E5C52] hover:text-[#4F6815] transition"
          >
            ← Marketplace
          </Link>
        </div>
      </header>

      {/* Centered Login / Sign Up Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-8">
        <motion.div
          className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Card Header */}
          <div className="text-center pb-2">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#4F6815] text-[#FFFBEA] text-xl mb-2 shadow-xs">
              👩‍🍳
            </div>
            <h2 className="font-serif text-2xl font-extrabold text-[#4F6815]">
              {mode === "login" ? "Home Chef Sign In" : "Register Home Kitchen"}
            </h2>
            <p className="text-xs text-[#6E5C52] mt-1">
              {mode === "login"
                ? "Sign in to manage your menu and orders"
                : "Create your kitchen account to start cooking"}
            </p>
          </div>

          {/* Toggle Buttons: Sign In vs Register */}
          <div className="mt-5 grid grid-cols-2 gap-1.5 bg-[#E4D5C3]/60 p-1.5 rounded-2xl border border-[#E4D5C3]">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                mode === "login"
                  ? "bg-white text-[#4F6815] shadow-xs"
                  : "text-[#6E5C52] hover:text-[#23120B]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                mode === "signup"
                  ? "bg-white text-[#4F6815] shadow-xs"
                  : "text-[#6E5C52] hover:text-[#23120B]"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message Box */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold flex items-center justify-between shadow-2xs"
              >
                <span>⚠️ {error}</span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-red-700 hover:text-red-950 font-bold ml-2"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Content */}
          {mode === "login" ? (
            /* LOGIN FORM */
            <form className="mt-5 space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-bold text-[#4F6815] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. chef@gmail.com"
                  required
                  className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#4F6815] focus:ring-2 focus:ring-[#4F6815]/20 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#4F6815]">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#4F6815] hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 pr-10 rounded-xl text-sm text-[#23120B] focus:border-[#4F6815] focus:ring-2 focus:ring-[#4F6815]/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E5C52] hover:text-[#4F6815] p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-xs uppercase tracking-wider font-bold py-3.5 rounded-xl transition-all shadow-md text-white bg-[#4F6815] hover:bg-[#3E5210] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Open Kitchen Dashboard</span>
                    <FiArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form className="mt-5 space-y-3.5" onSubmit={handleSignup}>
              <div>
                <label className="block text-xs font-bold text-[#4F6815] mb-1">
                  Full Name / Kitchen Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  required
                  className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#4F6815] focus:ring-2 focus:ring-[#4F6815]/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4F6815] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. priya@gmail.com"
                  required
                  className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#4F6815] focus:ring-2 focus:ring-[#4F6815]/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4F6815] mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 pr-10 rounded-xl text-sm text-[#23120B] focus:border-[#4F6815] focus:ring-2 focus:ring-[#4F6815]/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E5C52] hover:text-[#4F6815] p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4F6815] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 pr-10 rounded-xl text-sm text-[#23120B] focus:border-[#4F6815] focus:ring-2 focus:ring-[#4F6815]/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E5C52] hover:text-[#4F6815] p-1"
                    tabIndex={-1}
                  >
                    {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-xs uppercase tracking-wider font-bold py-3.5 rounded-xl transition-all shadow-md text-white bg-[#4F6815] hover:bg-[#3E5210] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Chef Account</span>
                    <FiArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom Switcher */}
          <div className="mt-6 pt-4 border-t border-[#E4D5C3] text-center text-xs text-[#6E5C52]">
            {mode === "login" ? (
              <p>
                New home chef?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                  className="font-bold text-[#4F6815] hover:underline"
                >
                  Register your kitchen here
                </button>
              </p>
            ) : (
              <p>
                Already have a kitchen account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="font-bold text-[#4F6815] hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto py-3 text-center text-xs text-[#6E5C52]">
        <span>© {new Date().getFullYear()} CraveCart Home Chef Portal</span>
      </footer>
    </div>
  );
}

