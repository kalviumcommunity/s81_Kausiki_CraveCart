import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { apiFetch } from "../api";
import { persistAuthSession } from "../roleUtils";

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
    const token = localStorage.getItem("token");
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
      setError("Please enter your kitchen owner email and password.");
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
        setError(data.message || "Invalid kitchen credentials.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill out all registration fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
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
        // Automatically login the newly registered kitchen owner
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
          setError("Kitchen account created. Please sign in.");
        }
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F0E6DA] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#4F6815] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0E6DA] text-[#23120B] flex flex-col justify-between px-4 py-8 relative">
      {/* Top Bar Logo */}
      <div className="mx-auto w-full max-w-6xl flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-[#4F6815] text-[#FFFBEA] flex items-center justify-center font-serif text-xl font-bold">
            👨‍🍳
          </div>
          <span className="font-serif text-2xl font-bold text-[#4F6815]">CraveCart Kitchen Portal</span>
        </Link>
        <Link to="/" className="text-xs font-bold uppercase tracking-wider text-[#6E5C52] hover:text-[#4F6815]">
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
          <span className="micro-label bg-[#4F6815] text-[#FFFBEA] px-3 py-1 rounded-full">
            KITCHEN OWNER PORTAL
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-[#4F6815] mt-3">
            {mode === "login" ? "Kitchen Owner Access" : "Register Home Kitchen"}
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5C52] mt-1">
            {mode === "login"
              ? "Sign in with your kitchen credentials to manage dishes, orders, and details."
              : "Create your culinary kitchen profile to start listing home-cooked dishes."}
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Register */}
        <div className="mt-6 grid grid-cols-2 gap-2 bg-[#E4D5C3]/40 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
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
            className={`py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
              mode === "signup"
                ? "bg-white text-[#4F6815] shadow-xs"
                : "text-[#6E5C52] hover:text-[#23120B]"
            }`}
          >
            Register Kitchen
          </button>
        </div>

        {error && <div className="cc-alert-error mt-6">{error}</div>}

        {mode === "login" ? (
          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="micro-label text-[#6E5C52] block mb-1">
                KITCHEN OWNER EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef@example.com"
                required
                className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-[#23120B] focus:border-[#4F6815]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="micro-label text-[#6E5C52]">PASSWORD</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#4F6815] hover:underline">
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
                  className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 pr-10 rounded-xl text-xs sm:text-sm text-[#23120B] focus:border-[#4F6815]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E5C52] hover:text-[#4F6815]"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-xs uppercase tracking-wider font-bold py-3.5 rounded-xl transition shadow-xs text-white bg-[#4F6815] hover:bg-[#3E5210]"
            >
              {loading ? "Accessing Kitchen..." : "Open Kitchen Dashboard →"}
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSignup}>
            <div>
              <label className="micro-label text-[#6E5C52] block mb-1">
                CHEF / KITCHEN OWNER NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Chef Amara"
                required
                className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-[#23120B] focus:border-[#4F6815]"
              />
            </div>

            <div>
              <label className="micro-label text-[#6E5C52] block mb-1">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef@example.com"
                required
                className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-[#23120B] focus:border-[#4F6815]"
              />
            </div>

            <div>
              <label className="micro-label text-[#6E5C52] block mb-1">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 pr-10 rounded-xl text-xs sm:text-sm text-[#23120B] focus:border-[#4F6815]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E5C52] hover:text-[#4F6815]"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="micro-label text-[#6E5C52] block mb-1">CONFIRM PASSWORD</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 pr-10 rounded-xl text-xs sm:text-sm text-[#23120B] focus:border-[#4F6815]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E5C52] hover:text-[#4F6815]"
                >
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-xs uppercase tracking-wider font-bold py-3.5 rounded-xl transition shadow-xs text-white bg-[#4F6815] hover:bg-[#3E5210]"
            >
              {loading ? "Registering Kitchen..." : "Register Kitchen & Enter Dashboard →"}
            </button>
          </form>
        )}
      </motion.div>

      {/* Footer */}
      <div className="mx-auto text-center text-xs text-[#6E5C52]">
        © {new Date().getFullYear()} CraveCart Artisanal Kitchen Network
      </div>
    </div>
  );
}
