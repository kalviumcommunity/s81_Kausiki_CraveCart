  import React, { useEffect, useState } from "react";
  import { motion } from "framer-motion";
  import { useNavigate } from "react-router-dom";
  import { FiEye, FiEyeOff } from "react-icons/fi";
  import GoogleButton from "./GoogleButton";
  import { apiFetch } from "../api";
  import { getRedirectForRole, persistAuthSession } from "../roleUtils";
  import { Link } from "react-router-dom";

  const theme = {
    primary: "#F97316", // orange
    primaryHover: "#DC2626", // chili red
    background: "#FFF7ED", // cream
    card: "#FFFFFF",
    textPrimary: "#1F2933",
    textSecondary: "#6B7280",
    accent: "#DC2626",
    error: "#B91C1C",
  };

  const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // If a token exists, verify it; redirect only when valid, otherwise clear stale session
    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const checkSession = async () => {
        try {
          await apiFetch("/user/me");
          const role = localStorage.getItem("userRole") || "customer";
          navigate(getRedirectForRole(role), { replace: true });
        } catch (err) {
          localStorage.removeItem("token");
          localStorage.removeItem("userRole");
          console.warn("Stale session cleared:", err?.message || err);
        }
      };

      checkSession();
    }, [navigate]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!email || !password) {
        setError("Please enter both email and password!");
        return;
      }
      
      setLoading(true);
      setError("");
      
      try {
        const response = await fetch("http://localhost:1111/user/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });
        
        const data = await response.json();
        
        if (response.ok) {
          const role = data?.user?.role || "customer";
          persistAuthSession(data.token || "", role);
          navigate(getRedirectForRole(role), { replace: true });
        } else {
          setError(data.message || "Login failed");
        }
      } catch (err) {
        setError("Network error. Please try again.");
        console.error("Login error:", err);
      } finally {
        setLoading(false);
      }
    };

    return (
      <motion.div
        className="relative min-h-screen flex items-center justify-center px-6 py-10"
        style={{ background: theme.background }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute left-6 top-5 text-2xl font-bold tracking-wide" style={{ color: theme.textPrimary }}>
          CraveCart
        </div>
        <motion.div
          className="w-full max-w-md rounded-3xl border p-8 shadow-2xl backdrop-blur"
          style={{ backgroundColor: theme.card, borderColor: "#F3E8DF" }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
        >
          <div className="text-center">
            <h1 className="text-3xl font-semibold" style={{ color: theme.textPrimary }}>
              Welcome back
            </h1>
            <p className="mt-2 text-sm" style={{ color: theme.textSecondary }}>
              Login to continue to CraveCart.
            </p>
          </div>

          <motion.form className="mt-8" onSubmit={handleSubmit}>
            {error && (
              <div
                className="mb-4 rounded-xl border px-4 py-3 text-sm"
                style={{
                  borderColor: `${theme.error}66`,
                  backgroundColor: `${theme.error}1A`,
                  color: "#7F1D1D",
                }}
              >
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="auth-input mt-2 w-full rounded-xl border px-4 py-3 text-[#1F2933] placeholder:text-[#6B7280] outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] focus:bg-[#FFE3CC] caret-[#1F2933]"
                  style={{ backgroundColor: "#FFFAF3", borderColor: "#E5E7EB" }}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="auth-input mt-2 w-full rounded-xl border px-4 py-3 pr-24 text-[#1F2933] placeholder:text-[#6B7280] outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] focus:bg-[#FFE3CC] caret-[#1F2933]"
                    style={{ backgroundColor: "#FFFAF3", borderColor: "#E5E7EB" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 m-2 rounded-lg px-3 text-sm font-semibold text-[#6B7280] hover:bg-[#F3F4F6]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl px-6 py-3 font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
              style={{ backgroundColor: theme.primary, boxShadow: "0 10px 30px rgba(249,115,22,0.28)" }}
              whileTap={{ scale: 0.98 }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = theme.primaryHover)}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = theme.primary)}
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>

            <div className="mt-4">
              <GoogleButton />
            </div>

            <div className="mt-6 text-center text-sm" style={{ color: theme.textSecondary }}>
              <div className="mb-3">
                <Link className="font-semibold" style={{ color: theme.accent }} to="/forgot-password">
                  Forgot password?
                </Link>
              </div>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="font-semibold"
                style={{ color: theme.accent }}
                onClick={() => navigate("/signup")}
              >
                Sign up
              </button>
            </div>
          </motion.form>
        </motion.div>
      </motion.div>
    );
  };

  export default Login;