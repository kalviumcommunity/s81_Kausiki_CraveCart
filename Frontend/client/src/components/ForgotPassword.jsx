import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../api";

export default function ForgotPassword() {
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
      setError("Please enter your email.");
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
    <div className="min-h-screen bg-[#F0E6DA] text-[#23120B] flex flex-col justify-between px-4 py-8">
      <div className="mx-auto w-full max-w-6xl flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-[#75070C] text-[#FFFBEA] flex items-center justify-center font-serif text-xl font-bold">
            C
          </div>
          <span className="font-serif text-2xl font-bold text-[#75070C]">CraveCart</span>
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto my-8 bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-8 sm:p-10 shadow-sm">
        <div className="text-center">
          <span className="micro-label text-[#75070C]">ACCOUNT RECOVERY</span>
          <h1 className="font-serif text-3xl font-extrabold text-[#75070C] mt-1">
            Forgot Password
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5C52] mt-1">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {error && <div className="cc-alert-error mt-6">{error}</div>}
        {message && <div className="cc-alert-success mt-6">{message}</div>}

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="micro-label text-[#6E5C52] block mb-1">EMAIL ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-[#23120B] focus:border-[#75070C]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full cc-btn-primary text-xs uppercase tracking-wider font-bold py-3"
          >
            {loading ? "Sending Link..." : "Send Reset Link →"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full cc-btn-secondary text-xs uppercase tracking-wider font-bold py-3"
          >
            ← Back to Login
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-[#6E5C52]">
        © {new Date().getFullYear()} CraveCart Artisanal Food Commerce.
      </div>
    </div>
  );
}
