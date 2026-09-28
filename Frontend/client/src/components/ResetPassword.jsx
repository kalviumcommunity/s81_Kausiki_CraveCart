import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { API_BASE } from "../api";

export default function ResetPassword() {
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
          <span className="micro-label text-[#4F6815]">CREDENTIALS UPDATE</span>
          <h1 className="font-serif text-3xl font-extrabold text-[#75070C] mt-1">
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5C52] mt-1">
            Set a new secure password for your account.
          </p>
        </div>

        {error && <div className="cc-alert-error mt-6">{error}</div>}
        {message && <div className="cc-alert-success mt-6">{message}</div>}

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="micro-label text-[#6E5C52] block mb-1">NEW PASSWORD</label>
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

          <div>
            <label className="micro-label text-[#6E5C52] block mb-1">CONFIRM NEW PASSWORD</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 pr-10 rounded-xl text-xs sm:text-sm text-[#23120B] focus:border-[#75070C]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E5C52] hover:text-[#75070C]"
              >
                {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full cc-btn-primary text-xs uppercase tracking-wider font-bold py-3"
          >
            {loading ? "Resetting..." : "Update Password →"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full cc-btn-secondary text-xs uppercase tracking-wider font-bold py-3"
          >
            Back to Login
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-[#6E5C52]">
        © {new Date().getFullYear()} CraveCart Artisanal Food Commerce.
      </div>
    </div>
  );
}
