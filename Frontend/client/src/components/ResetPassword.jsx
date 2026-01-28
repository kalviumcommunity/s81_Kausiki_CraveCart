import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { API_BASE } from "../api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Reset link is missing or invalid.");
      return;
    }
    if (!password || !confirm) {
      setError("Enter and confirm your new password.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to reset password");
      setMessage(data?.message || "Password reset successful. You can log in now.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cc-page-lg flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white/90 p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold text-[#1F2933] text-center">Reset Password</h1>
        <p className="cc-muted text-sm text-center mt-2">Choose a new password for your account.</p>

        {error && <div className="mt-4 cc-alert-error">{error}</div>}
        {message && <div className="mt-4 cc-alert-success">{message}</div>}

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="block text-sm font-medium text-[#1F2933]">New password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input mt-2 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 pr-24 text-[#1F2933] placeholder:text-[#6B7280]/80 outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                placeholder="At least 8 chars, letters & numbers"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 m-2 rounded-lg px-3 text-sm font-semibold text-[#6B7280] hover:bg-black/5"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2933]">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="auth-input mt-2 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 pr-24 text-[#1F2933] placeholder:text-[#6B7280]/80 outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute inset-y-0 right-0 m-2 rounded-lg px-3 text-sm font-semibold text-[#6B7280] hover:bg-black/5"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl cc-btn-primary px-6 py-3 disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full rounded-xl cc-btn-secondary px-6 py-3"
          >
            Back to login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
