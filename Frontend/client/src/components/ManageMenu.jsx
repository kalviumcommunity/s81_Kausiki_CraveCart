import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

const mealTypes = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "snacks", label: "Snacks" },
  { key: "dinner", label: "Dinner" },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  price: "",
  totalQty: "",
  isAvailable: true,
};

const ManageMenu = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(todayStr());
  const [activeType, setActiveType] = useState("breakfast");
  const [forms, setForms] = useState({
    breakfast: { ...emptyForm },
    lunch: { ...emptyForm },
    snacks: { ...emptyForm },
    dinner: { ...emptyForm },
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentForm = useMemo(() => forms[activeType], [forms, activeType]);

  const loadMeals = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/api/kitchens/my/meals?date=${encodeURIComponent(date)}`);
      const nextForms = { breakfast: { ...emptyForm }, lunch: { ...emptyForm }, snacks: { ...emptyForm }, dinner: { ...emptyForm } };
      (res.meals || []).forEach((meal) => {
        const key = meal.mealType;
        if (!nextForms[key]) return;
        nextForms[key] = {
          title: meal.title || "",
          description: meal.description || "",
          imageUrl: meal.imageUrl || "",
          price: meal.price ?? "",
          totalQty: meal.totalQty ?? "",
          isAvailable: meal.isAvailable !== false,
        };
      });
      setForms(nextForms);
    } catch (err) {
      setError(err.message || "Unable to load meals for this date");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const updateField = (field, value) => {
    setForms((prev) => ({
      ...prev,
      [activeType]: {
        ...prev[activeType],
        [field]: value,
      },
    }));
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setError("");
      setMessage("");
      await uploadImage(selected);
    }
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadImage = async (fileToUpload) => {
    const targetFile = fileToUpload || file;
    if (!targetFile) {
      setError("Please choose an image to upload.");
      return;
    }
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("image", targetFile);
      const res = await apiFetch("/api/kitchens/my/meals/image", {
        method: "POST",
        body: fd,
      });
      updateField("imageUrl", res?.file?.urlPath || "");
      setMessage("Image uploaded. Saved to current meal.");
      setFile(targetFile);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveMeal = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = {
        date,
        mealType: activeType,
        title: currentForm.title,
        description: currentForm.description,
        imageUrl: currentForm.imageUrl,
        price: Number(currentForm.price),
        totalQty: Number(currentForm.totalQty),
        isAvailable: Boolean(currentForm.isAvailable),
      };

      await apiFetch("/api/kitchens/my/meals", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setMessage(`${mealTypes.find((m) => m.key === activeType)?.label || ""} saved for ${date}`);
      await loadMeals();
    } catch (err) {
      setError(err.message || "Failed to save meal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cc-page">
      <div className="cc-container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[#F97316] text-sm uppercase tracking-wide">Menu Management</p>
            <h1 className="text-3xl font-bold text-[#1F2933]">Breakfast / Lunch / Snacks / Dinner</h1>
            <p className="cc-muted mt-1">Update item name, photo, quantity, and price for each slot.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/kitchen-dashboard")}
              className="cc-btn-secondary px-4 py-2"
            >
              Back to dashboard
            </button>
            <button
              onClick={() => navigate("/")}
              className="cc-btn-primary px-4 py-2"
            >
              Home
            </button>
          </div>
        </div>

        <div className="cc-card rounded-2xl p-5 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 cc-muted">
              <span>Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
              />
            </div>
            {loading ? <span className="cc-muted text-sm">Loading meals...</span> : null}
            {message ? <span className="text-[#15803D] text-sm">{message}</span> : null}
            {error ? <span className="text-[#B91C1C] text-sm">{error}</span> : null}
          </div>
        </div>

        <div className="cc-card rounded-2xl">
          <div className="flex flex-wrap border-b border-black/5">
            {mealTypes.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveType(m.key)}
                className={`px-4 py-3 text-sm font-semibold transition border-r border-black/5 last:border-r-0 ${
                  activeType === m.key
                    ? "text-[#F97316] bg-white/70"
                    : "cc-muted hover:text-[#1F2933] hover:bg-white/60"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-sm cc-muted">Item name</label>
              <input
                type="text"
                value={currentForm.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder={`Enter ${activeType} item name`}
                className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] placeholder:text-[#6B7280]/80 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
              />

              <label className="block text-sm cc-muted">Description (optional)</label>
              <textarea
                value={currentForm.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Short description"
                className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] placeholder:text-[#6B7280]/80 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                rows={3}
              />

              <label className="block text-sm cc-muted">Upload photo (browse from your folder)</label>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="cc-btn-secondary rounded-lg px-4 py-2"
                  >
                    Browse file
                  </button>
                  {file ? <span className="text-[#1F2933] text-sm">Selected: {file.name}</span> : <span className="cc-muted text-sm">No file chosen</span>}
                  {uploading ? <span className="cc-muted text-sm">Uploading...</span> : null}
                </div>
                {currentForm.imageUrl ? (
                  <div className="mt-2 cc-muted text-sm">
                    Attached image: <a className="cc-link underline" href={currentForm.imageUrl} target="_blank" rel="noreferrer">View</a>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm cc-muted">Price</label>
                <input
                  type="number"
                  min={0}
                  value={currentForm.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-sm cc-muted">Quantity</label>
                <input
                  type="number"
                  min={0}
                  value={currentForm.totalQty}
                  onChange={(e) => updateField("totalQty", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={currentForm.isAvailable}
                  onChange={(e) => updateField("isAvailable", e.target.checked)}
                  id="isAvailable"
                />
                <label htmlFor="isAvailable" className="cc-muted text-sm">
                  Mark as available for this date
                </label>
              </div>

              <button
                onClick={saveMeal}
                disabled={saving}
                className="w-full mt-4 cc-btn-primary rounded-lg px-4 py-3 disabled:opacity-60"
              >
                {saving ? "Saving..." : `Save ${mealTypes.find((m) => m.key === activeType)?.label || ""}`}
              </button>
              {message ? <p className="text-[#15803D] text-sm mt-2">{message}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageMenu;
