import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { persistAuthSession } from "../roleUtils";

const RegisterKitchen = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [addressText, setAddressText] = useState("");

  const [pincode, setPincode] = useState("");

  const [fssaiLicenseNumber, setFssaiLicenseNumber] = useState("");
  const [fssaiBusinessName, setFssaiBusinessName] = useState("");
  const [fssaiExpiryDate, setFssaiExpiryDate] = useState("");

  const [governmentIdType, setGovernmentIdType] = useState("Aadhaar");
  const [nameOnId, setNameOnId] = useState("");

  const [fssaiCertificateFile, setFssaiCertificateFile] = useState(null);
  const [governmentIdFile, setGovernmentIdFile] = useState(null);
  const [kitchenPhotos, setKitchenPhotos] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifySession = async () => {
      try {
        await apiFetch("/user/me");

        // If a kitchen already exists, send them to dashboard instead of re-registering
        try {
          const res = await apiFetch("/api/kitchens/my/profile");
          if (res?.kitchen) {
            navigate("/kitchen-dashboard", { replace: true });
            return;
          }
        } catch {
          // ignore 404/403; continue to registration
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        setError("Session expired. Please log in again.");
        navigate("/login", { replace: true });
      }
    };

    verifySession();
  }, [navigate]);

  const validatePincode = () => {
    const normalized = (pincode || "").trim();
    if (!normalized) {
      return "Please enter your kitchen's pincode";
    }
    if (!/^\d{4,10}$/.test(normalized)) {
      return "Pincode must be 4-10 digits";
    }
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login first to register a kitchen");
      }

      // 1) Register kitchen profile
      await apiFetch("/api/kitchens/register", {
        method: "POST",
        body: JSON.stringify({ name, description, addressText }),
      });

      // 2) Store service pincode
      const pincodeError = validatePincode();
      if (pincodeError) {
        throw new Error(pincodeError);
      }
      await apiFetch("/api/kitchens/my/location", {
        method: "PATCH",
        body: JSON.stringify({ pincode, addressText }),
      });

      // 3) Upload mandatory verification documents + live photos/video proof
      if (!fssaiCertificateFile || !governmentIdFile) {
        throw new Error("Please upload all mandatory documents (FSSAI, Government ID)");
      }
      if (!fssaiExpiryDate) {
        throw new Error("Please provide FSSAI expiry date");
      }
      if (!nameOnId) {
        throw new Error("Please provide name matching your account for ID");
      }

      const fd = new FormData();
      fd.append("fssaiLicenseNumber", fssaiLicenseNumber);
      fd.append("fssaiBusinessName", fssaiBusinessName);
      fd.append("fssaiExpiryDate", fssaiExpiryDate);
      fd.append("governmentIdType", governmentIdType);
      fd.append("nameOnId", nameOnId);

      fd.append("fssaiCertificate", fssaiCertificateFile);
      fd.append("governmentId", governmentIdFile);

      for (const p of kitchenPhotos) {
        fd.append("kitchenPhotos", p);
      }
      // video upload removed

      await apiFetch("/api/kitchens/my/verification", {
        method: "POST",
        body: fd,
      });

      setMessage("Kitchen registered. Status: Pending Verification.");
      persistAuthSession(localStorage.getItem("token") || "", "kitchen");
      navigate("/kitchen-dashboard");
    } catch (e2) {
      const msg = e2?.message || "Failed to register kitchen";
      setError(msg);
      if (msg.toLowerCase().includes("unauthorized")) {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7ED] text-[#1F2933] px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-semibold text-[#DC2626] uppercase tracking-wide">Kitchen Onboarding</p>
            <h1 className="text-3xl font-bold text-[#1F2933] mt-1">Register Your Kitchen</h1>
          </div>
          <button
            onClick={() => navigate("/")}
            className="hidden sm:inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-4 py-2 rounded-full shadow-lg shadow-black/10 transition focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
          >
            Home
          </button>
        </div>

        <div className="bg-white border border-black/5 shadow-xl shadow-black/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#1F2933] text-sm font-semibold bg-[#FFF7ED] border border-black/10 px-3 py-2 rounded-full">
              <span className="h-2 w-2 rounded-full bg-[#15803D]" />
              Quick 3-step verification
            </div>
            <button
              onClick={() => navigate("/")}
              className="sm:hidden inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-4 py-2 rounded-full shadow-lg shadow-black/10 transition focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
            >
              Home
            </button>
          </div>

        {error && <p className="text-[#B91C1C] mb-4 font-medium">{error}</p>}
        {message && <p className="text-[#15803D] mb-4 font-medium">{message}</p>}

        {/* File input helper styles are applied via Tailwind `file:` modifiers */}

        <form onSubmit={submit}>
          <div className="mb-4">
            <label className="block text-[#1F2933] mb-2 font-medium">Kitchen name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-[#FFFAF3] text-[#1F2933] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-[#1F2933] mb-2 font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-[#FFFAF3] text-[#1F2933] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <label className="block text-[#1F2933] mb-2 font-medium">Address</label>
            <input
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-[#FFFAF3] text-[#1F2933] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition"
            />
          </div>

          <div className="mb-6 p-4 rounded-xl border border-black/5 bg-white shadow-sm">
            <h2 className="text-lg font-semibold text-[#1F2933] mb-1">Service Pincode</h2>
            <p className="text-[#6B7280] text-sm mb-3">Enter the pincode where your kitchen operates.</p>
            <input
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Pincode"
              inputMode="numeric"
              pattern="\d*"
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-[#FFFAF3] text-[#1F2933] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition"
              required
            />
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#1F2933] mb-2">FSSAI Validation</h2>
            <div className="grid gap-3">
              <input
                value={fssaiLicenseNumber}
                onChange={(e) => setFssaiLicenseNumber(e.target.value)}
                placeholder="FSSAI License Number (14 digits)"
                className="px-4 py-2 border border-[#E5E7EB] rounded-lg bg-[#FFFAF3] text-[#1F2933] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition"
                required
              />
              <input
                value={fssaiBusinessName}
                onChange={(e) => setFssaiBusinessName(e.target.value)}
                placeholder="Business name (as per FSSAI)"
                className="px-4 py-2 border border-[#E5E7EB] rounded-lg bg-[#FFFAF3] text-[#1F2933] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition"
              />
              <div>
                <label className="block text-[#1F2933] mb-2 font-medium">FSSAI Expiry Date</label>
                <input
                  type="date"
                  value={fssaiExpiryDate}
                  onChange={(e) => setFssaiExpiryDate(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-[#FFFAF3] text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#1F2933] mb-2">Mandatory Document Upload</h2>
            <p className="text-[#6B7280] text-sm mb-3">Upload clear PDF/JPG/PNG files.</p>

            <div className="grid gap-4">
              <div>
                <label className="block text-[#1F2933] mb-2 font-medium">FSSAI License / Food Safety Certificate</label>
                <div className="border-2 border-dashed border-[#F97316]/50 bg-[#FFFAF3] rounded-xl p-4">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setFssaiCertificateFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-[#1F2933] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#F97316] file:text-white file:font-semibold hover:file:bg-[#EA580C]"
                    required
                  />
                  <p className="text-[#6B7280] text-sm mt-2">
                    {fssaiCertificateFile ? `Selected: ${fssaiCertificateFile.name}` : "Click the orange button to choose a file."}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[#1F2933] mb-2 font-medium">Government ID</label>
                <select
                  value={governmentIdType}
                  onChange={(e) => setGovernmentIdType(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-[#FFFAF3] text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition mb-2"
                >
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="PAN">PAN</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
                <input
                  value={nameOnId}
                  onChange={(e) => setNameOnId(e.target.value)}
                  placeholder="Name on ID (must match your account name)"
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-[#FFFAF3] text-[#1F2933] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition mb-2"
                  required
                />
                <div className="border-2 border-dashed border-[#F97316]/50 bg-[#FFFAF3] rounded-xl p-4">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setGovernmentIdFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-[#1F2933] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#F97316] file:text-white file:font-semibold hover:file:bg-[#EA580C]"
                    required
                  />
                  <p className="text-[#6B7280] text-sm mt-2">
                    {governmentIdFile ? `Selected: ${governmentIdFile.name}` : "Click the orange button to choose a file."}
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#1F2933] mb-2">Live Kitchen Photos (optional)</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-[#1F2933] mb-2 font-medium">Kitchen photos (optional, up to 5)</label>
                <div className="border-2 border-dashed border-[#F97316]/50 bg-[#FFFAF3] rounded-xl p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setKitchenPhotos(Array.from(e.target.files || []).slice(0, 5))}
                    className="block w-full text-sm text-[#1F2933] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#F97316] file:text-white file:font-semibold hover:file:bg-[#EA580C]"
                  />
                  <p className="text-[#6B7280] text-sm mt-2">
                    {kitchenPhotos.length > 0 ? `Selected: ${kitchenPhotos.length} photo(s)` : "Click the orange button to choose files."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-6 py-3 rounded-full shadow-lg shadow-black/10 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterKitchen;
