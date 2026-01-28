import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api";

const theme = {
  primary: "#F97316", // orange
  primaryHover: "#DC2626", // chili red
  accent: "#DC2626",
  background: "#FFF7ED", // cream
  card: "#FFFFFF",
  textPrimary: "#1F2933",
  textSecondary: "#6B7280",
  error: "#B91C1C",
  success: "#15803D",
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/user/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to send reset email");
      setMessage(data?.message || "If that account exists, a reset link was sent.");
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-10"
      style={{ background: theme.background }}
    >
      <div
        className="w-full max-w-md rounded-3xl border p-8 shadow-2xl"
        style={{ backgroundColor: theme.card, borderColor: "#F3E8DF" }}
      >
        <h1 className="text-2xl font-semibold text-center" style={{ color: theme.textPrimary }}>
          Forgot Password
        </h1>
        <p className="text-sm text-center mt-2" style={{ color: theme.textSecondary }}>
          Enter your email and we will send a reset link.
        </p>

        {error && (
          <div
            className="mt-4 rounded-xl border px-4 py-3 text-sm"
            style={{
              borderColor: `${theme.error}66`,
              backgroundColor: `${theme.error}0F`,
              color: "#7F1D1D",
            }}
          >
            {error}
          </div>
        )}
        {message && (
          <div
            className="mt-4 rounded-xl border px-4 py-3 text-sm"
            style={{
              borderColor: `${theme.success}66`,
              backgroundColor: `${theme.success}14`,
              color: "#0F5132",
            }}
          >
            {message}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="block text-sm font-medium" style={{ color: theme.textSecondary }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input mt-2 w-full rounded-xl border px-4 py-3 text-[#1F2933] placeholder:text-[#6B7280] outline-none focus:ring-2 focus:ring-[#F97316]"
              style={{ backgroundColor: "#FFFBF5", borderColor: "#E5E7EB" }}
              placeholder="you@example.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-6 py-3 font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
            style={{ backgroundColor: theme.primary, boxShadow: "0 10px 30px rgba(249,115,22,0.28)" }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = theme.primaryHover)}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = theme.primary)}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full rounded-xl border px-6 py-3 font-semibold transition"
            style={{
              borderColor: "#E5E7EB",
              color: theme.textPrimary,
              backgroundColor: "#FFFBF5",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#FFFBF5")}
          >
            Back to login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
