import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch, resolveUploadUrl } from "../api";
import { clearAuthSession } from "../roleUtils";
import {
  FiCheckCircle,
  FiClock,
  FiLock,
  FiRefreshCw,
  FiPhone,
  FiVideo,
  FiFileText,
  FiCamera,
  FiMapPin,
} from "react-icons/fi";

const todayStr = () => new Date().toISOString().slice(0, 10);

const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast", icon: "🍳", timeSlot: "7:00 AM - 11:00 AM" },
  { key: "lunch", label: "Lunch", icon: "🍲", timeSlot: "12:00 PM - 3:30 PM" },
  { key: "snacks", label: "Snacks & Bakes", icon: "🥐", timeSlot: "4:00 PM - 6:30 PM" },
  { key: "dinner", label: "Dinner", icon: "🍽️", timeSlot: "7:00 PM - 10:30 PM" },
];

const emptyMealForm = {
  title: "",
  description: "",
  imageUrl: "",
  price: "",
  totalQty: "",
  isAvailable: true,
};

export default function KitchenDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Envelope Interactive State
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [refreshingStatus, setRefreshingStatus] = useState(false);

  // Proposal / Onboarding Form State (Matching Admin Review Panel)
  const [onboardForm, setOnboardForm] = useState({
    name: "",
    ownerEmail: "",
    description: "",
    addressText: "",
    pincode: "",
    phone: "",
    governmentIdType: "Aadhaar",
    nameOnId: "",
    fssaiLicenseNumber: "",
    fssaiBusinessName: "",
    fssaiExpiryDate: "",
    videoCallSlot: "",
    trialOrderNotes: "",
  });
  const [govIdFile, setGovIdFile] = useState(null);
  const [fssaiFile, setFssaiFile] = useState(null);
  const [kitchenPhotosFiles, setKitchenPhotosFiles] = useState([]);
  const [onboardSaving, setOnboardSaving] = useState(false);

  // Unlocked Dashboard Navigation Tabs
  const [activeTab, setActiveTab] = useState("orders");

  // Orders Management State
  const [ordersDate, setOrdersDate] = useState(todayStr());
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Daily Order Limit State
  const [dailyOrderLimit, setDailyOrderLimit] = useState(50);
  const [limitSaving, setLimitSaving] = useState(false);

  // Menu / Dishes Management State
  const [menuDate, setMenuDate] = useState(todayStr());
  const [meals, setMeals] = useState([]);
  const [mealsLoading, setMealsLoading] = useState(false);
  const [editingMealType, setEditingMealType] = useState(null);
  const [editingMealId, setEditingMealId] = useState(null);
  const [mealForm, setMealForm] = useState({ ...emptyMealForm });
  const [mealSaving, setMealSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Service Location State
  const [pincode, setPincode] = useState("");
  const [addressText, setAddressText] = useState("");
  const [locationSaving, setLocationSaving] = useState(false);

  // Load Kitchen Profile
  const loadProfile = async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      let me = null;
      try {
        const meRes = await apiFetch("/user/me");
        me = meRes?.user || null;
      } catch {
        // guest or auth error fallback
      }

      const res = await apiFetch("/api/kitchens/my/profile");
      const k = res.kitchen;
      setProfile(k);
      if (k) {
        setDailyOrderLimit(k.dailyOrderLimit ?? 50);
        setPincode(k.pincode || "");
        setAddressText(k.addressText || "");
        setOnboardForm({
          name: k.name || "",
          ownerEmail: k.contactEmail || k.ownerUserId?.email || me?.email || "",
          description: k.description || "",
          addressText: k.addressText || "",
          pincode: k.pincode || "",
          phone: k.phone || k.contactPhone || k.ownerUserId?.phone || me?.phone || "",
          governmentIdType: k.documents?.governmentId?.idType || "Aadhaar",
          nameOnId: k.documents?.governmentId?.nameOnId || k.ownerName || (k.ownerUserId?.name && k.ownerUserId?.name !== "Admin" ? k.ownerUserId?.name : (me?.name && me.name !== "Admin" ? me.name : "")) || "",
          fssaiLicenseNumber: k.fssai?.licenseNumber || "",
          fssaiBusinessName: k.fssai?.businessName || "",
          fssaiExpiryDate: k.fssai?.expiryDate ? new Date(k.fssai.expiryDate).toISOString().slice(0, 10) : "",
          videoCallSlot: k.videoCall?.preferredSlotText || "",
          trialOrderNotes: k.premiumVerification?.notes || "",
        });
      } else if (me) {
        setOnboardForm((prev) => ({
          ...prev,
          ownerEmail: prev.ownerEmail || me.email || "",
          nameOnId: prev.nameOnId || (me.name !== "Admin" ? me.name : "") || "",
          phone: prev.phone || me.phone || "",
        }));
      }
    } catch (err) {
      setProfile(null);
      setError(err.message || "Failed to load kitchen profile");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleCheckApproval = async () => {
    setRefreshingStatus(true);
    await loadProfile(true);
    setRefreshingStatus(false);
  };

  const loadOrders = async () => {
    if (!profile || (!profile.verified && profile.verificationStatus !== "verified")) return;
    try {
      const res = await apiFetch(`/api/kitchens/my/orders?date=${encodeURIComponent(ordersDate)}`);
      setOrders(res.orders || []);
    } catch {
      setOrders([]);
    }
  };

  const loadMeals = async () => {
    if (!profile || (!profile.verified && profile.verificationStatus !== "verified")) return;
    setMealsLoading(true);
    try {
      const res = await apiFetch(`/api/kitchens/my/meals?date=${encodeURIComponent(menuDate)}`);
      setMeals(res.meals || []);
    } catch {
      setMeals([]);
    } finally {
      setMealsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const isCurrentlyVerified = Boolean(
      profile && (profile.verified === true || profile.verificationStatus === "verified" || profile.verifiedBadge === true)
    );
    if (!isCurrentlyVerified) {
      const interval = setInterval(() => {
        loadProfile(true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [profile]);

  useEffect(() => {
    if (profile && (profile.verified || profile.verificationStatus === "verified")) {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.verified, profile?.verificationStatus, ordersDate]);

  useEffect(() => {
    if (profile && (profile.verified || profile.verificationStatus === "verified")) {
      loadMeals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.verified, profile?.verificationStatus, menuDate]);

  const handleOrderDecision = async (orderId, decision) => {
    setActionLoadingId(orderId);
    setError("");
    setMessage("");
    try {
      await apiFetch(`/api/kitchens/my/orders/${orderId}/decision`, {
        method: "PATCH",
        body: JSON.stringify({ decision }),
      });
      setMessage(`Order ${decision === "accept" ? "accepted" : "rejected"} successfully.`);
      await loadOrders();
    } catch (err) {
      setError(err.message || `Failed to ${decision} order.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const saveLimit = async () => {
    setLimitSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await apiFetch("/api/kitchens/my/daily-order-limit", {
        method: "PATCH",
        body: JSON.stringify({ dailyOrderLimit: Number(dailyOrderLimit) }),
      });
      setProfile(res.kitchen);
      setMessage("Daily preparation limit updated successfully.");
    } catch (e) {
      setError(e.message || "Failed to update capacity limit");
    } finally {
      setLimitSaving(false);
    }
  };

  const saveLocation = async () => {
    setLocationSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await apiFetch("/api/kitchens/my/location", {
        method: "PATCH",
        body: JSON.stringify({ pincode, addressText }),
      });
      setProfile(res.kitchen);
      setMessage("Kitchen address and delivery pincode saved.");
    } catch (e) {
      setError(e.message || "Failed to update location details");
    } finally {
      setLocationSaving(false);
    }
  };

  const openMealEditor = (mealType, existingDish = null) => {
    if (existingDish) {
      setEditingMealId(existingDish._id);
      setMealForm({
        title: existingDish.title || "",
        description: existingDish.description || "",
        imageUrl: existingDish.imageUrl || "",
        price: existingDish.price ?? "",
        totalQty: existingDish.totalQty ?? "",
        isAvailable: existingDish.isAvailable !== false,
      });
    } else {
      setEditingMealId(null);
      setMealForm({ ...emptyMealForm });
    }
    setEditingMealType(mealType);
    setError("");
    setMessage("");
  };

  const handleDeleteDish = async (dishId, dishTitle) => {
    if (!window.confirm(`Are you sure you want to remove "${dishTitle}" from your menu?`)) return;
    setError("");
    setMessage("");
    try {
      await apiFetch(`/api/kitchens/my/meals/${dishId}`, { method: "DELETE" });
      setMessage(`"${dishTitle}" was removed successfully.`);
      if (editingMealId === dishId) {
        setEditingMealType(null);
        setEditingMealId(null);
      }
      await loadMeals();
    } catch (err) {
      setError(err.message || "Failed to remove dish.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await apiFetch("/api/kitchens/my/meals/image", {
        method: "POST",
        body: fd,
      });
      const url = res?.file?.urlPath || "";
      setMealForm((prev) => ({ ...prev, imageUrl: url }));
      setMessage("Dish photo uploaded.");
    } catch (err) {
      setError(err.message || "Failed to upload photo");
    } finally {
      setUploadingImage(false);
    }
  };

  const saveMeal = async (e) => {
    e.preventDefault();
    if (!mealForm.title.trim() || mealForm.price === "" || mealForm.totalQty === "") {
      setError("Please provide dish title, price, and daily preparation quantity.");
      return;
    }

    setMealSaving(true);
    setError("");
    setMessage("");
    try {
      await apiFetch("/api/kitchens/my/meals", {
        method: "POST",
        body: JSON.stringify({
          mealId: editingMealId || undefined,
          date: menuDate,
          mealType: editingMealType,
          title: mealForm.title.trim(),
          description: mealForm.description.trim(),
          imageUrl: mealForm.imageUrl.trim(),
          price: Number(mealForm.price),
          totalQty: Number(mealForm.totalQty),
          isAvailable: Boolean(mealForm.isAvailable),
        }),
      });
      setMessage(
        editingMealId
          ? `"${mealForm.title.trim()}" updated successfully for ${editingMealType.toUpperCase()} on ${menuDate}.`
          : `New dish "${mealForm.title.trim()}" added to ${editingMealType.toUpperCase()} for ${menuDate}.`
      );
      setEditingMealType(null);
      setEditingMealId(null);
      await loadMeals();
    } catch (err) {
      setError(err.message || "Failed to save dish.");
    } finally {
      setMealSaving(false);
    }
  };

  // Submit Envelope Proposal
  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!onboardForm.name.trim()) {
      setError("Please enter your Kitchen Name in the proposal.");
      return;
    }
    if (!onboardForm.pincode.trim() || !/^\d{4,10}$/.test(onboardForm.pincode.trim())) {
      setError("Please provide a valid 4-10 digit delivery service pincode.");
      return;
    }
    if (!onboardForm.nameOnId.trim()) {
      setError("Please enter the legal name as it appears on your Government ID.");
      return;
    }
    if (!onboardForm.ownerEmail.trim() || !/^\S+@\S+\.\S+$/.test(onboardForm.ownerEmail.trim())) {
      setError("Please enter a valid owner contact email address.");
      return;
    }
    if (!onboardForm.phone.trim()) {
      setError("Please enter your contact phone number.");
      return;
    }
    if (!onboardForm.fssaiLicenseNumber.trim() || !/^\d{14}$/.test(onboardForm.fssaiLicenseNumber.trim())) {
      setError("Please provide your 14-digit FSSAI License Number.");
      return;
    }
    if (!onboardForm.fssaiExpiryDate) {
      setError("Please select the FSSAI License expiry date.");
      return;
    }
    if (!profile?.documents?.governmentId?.urlPath && !govIdFile) {
      setError("Please attach your Government ID (Aadhaar/PAN) document file.");
      return;
    }
    if (!profile?.documents?.fssaiCertificate?.urlPath && !fssaiFile) {
      setError("Please attach your FSSAI Food Safety Certificate document file.");
      return;
    }

    setOnboardSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", onboardForm.name.trim());
      fd.append("ownerName", onboardForm.nameOnId.trim());
      fd.append("ownerEmail", (onboardForm.ownerEmail || "").trim());
      fd.append("description", onboardForm.description.trim());
      fd.append("addressText", onboardForm.addressText.trim());
      fd.append("pincode", onboardForm.pincode.trim());
      fd.append("phone", onboardForm.phone.trim());
      fd.append("governmentIdType", onboardForm.governmentIdType);
      fd.append("nameOnId", onboardForm.nameOnId.trim());
      fd.append("fssaiLicenseNumber", onboardForm.fssaiLicenseNumber.trim());
      fd.append("fssaiBusinessName", onboardForm.fssaiBusinessName.trim() || onboardForm.name.trim());
      fd.append("fssaiExpiryDate", onboardForm.fssaiExpiryDate);
      fd.append("videoCallSlot", onboardForm.videoCallSlot.trim());
      fd.append("trialOrderNotes", onboardForm.trialOrderNotes.trim());

      if (govIdFile) fd.append("governmentId", govIdFile);
      if (fssaiFile) fd.append("fssaiCertificate", fssaiFile);
      for (const p of kitchenPhotosFiles) {
        fd.append("kitchenPhotos", p);
      }

      const res = await apiFetch("/api/kitchens/my/onboard", {
        method: "POST",
        body: fd,
      });

      setProfile(res.kitchen);
      setIsEnvelopeOpen(false);
      setMessage("Your Chef Proposal & Verification documents have been dispatched to the Admin team!");
    } catch (err) {
      setError(err.message || "Failed to submit proposal.");
    } finally {
      setOnboardSaving(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return orders;
    return orders.filter((o) => o.status === orderFilter);
  }, [orders, orderFilter]);

  const todayOrderCount = orders.length;
  const acceptedOrderCount = orders.filter((o) => o.status === "accepted").length;
  const totalRevenue = orders
    .filter((o) => o.status === "accepted" || o.status === "prebooked")
    .reduce((sum, o) => sum + (o.mealId?.price || 0) * (o.qty || 1), 0);

  const hasSubmittedProposal = Boolean(
    profile && (profile.documents?.governmentId?.urlPath || profile.fssai?.licenseNumber)
  );
  const isVerified = Boolean(
    profile &&
      (profile.verified === true ||
        profile.verificationStatus === "verified" ||
        profile.verifiedBadge === true ||
        profile.fssai?.validationStatus === "verified")
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0E6DA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#75070C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif text-lg font-bold text-[#75070C]">Checking Kitchen Credentials...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: ENVELOPE ONBOARDING SCREEN WITH GENTLE FLOATING MOTION
  // =========================================================================
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-[#EFE4D6] text-[#23120B] flex flex-col justify-between relative overflow-hidden py-6 px-4">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[#75070C]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-[#4F6815]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <header className="max-w-5xl mx-auto w-full flex items-center justify-between z-10 pb-4 border-b border-[#E4D5C3]/80">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-[#75070C] text-[#FFFBEA] flex items-center justify-center font-serif text-xl font-bold shadow-xs">
              C
            </div>
            <span className="font-serif text-2xl font-bold text-[#75070C]">CraveCart</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCheckApproval}
              disabled={refreshingStatus}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E4D5C3] bg-white text-xs font-semibold text-[#6E5C52] hover:text-[#75070C] transition shadow-xs"
            >
              <FiRefreshCw className={`h-3.5 w-3.5 ${refreshingStatus ? "animate-spin text-[#75070C]" : ""}`} />
              <span>Check Admin Status</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-[#75070C] hover:underline"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Main Interactive Center Area */}
        <div className="max-w-4xl mx-auto w-full my-8 z-10">
          
          {/* Notification Alerts */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-[#75070C]/10 border border-[#75070C]/30 text-[#75070C] text-sm font-semibold flex items-center justify-between"
            >
              <span>⚠️ {error}</span>
              <button onClick={() => setError("")} className="font-bold">✕</button>
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-[#4F6815]/10 border border-[#4F6815]/30 text-[#4F6815] text-sm font-semibold flex items-center justify-between"
            >
              <span>✓ {message}</span>
              <button onClick={() => setMessage("")} className="font-bold">✕</button>
            </motion.div>
          )}

          {/* If Proposal is submitted & envelope is closed: Show Sealed Status Card */}
          {hasSubmittedProposal && !isEnvelopeOpen ? (
            <motion.div
              className="bg-[#FAF6F0] border-2 border-[#E4D5C3] rounded-3xl p-8 sm:p-12 shadow-xl text-center relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-20 h-20 rounded-full bg-[#75070C] text-[#FFFBEA] flex flex-col items-center justify-center mx-auto shadow-md border-4 border-[#FFFBEA] ring-2 ring-[#75070C]/30">
                <span className="text-2xl">⚜️</span>
                <span className="text-[8px] font-bold uppercase tracking-widest mt-0.5">SEALED</span>
              </div>

              <span className="inline-block mt-5 micro-label bg-[#FFEDAB] text-[#75070C] border border-[#F5EBCE] px-3 py-1 rounded-full text-xs font-extrabold">
                ⏳ PROPOSAL DISPATCHED • UNDER ADMIN REVIEW
              </span>

              <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#75070C] mt-3">
                {profile?.name || "Your Kitchen Proposal"}
              </h1>

              <p className="text-sm text-[#6E5C52] mt-3 max-w-xl mx-auto leading-relaxed">
                Your kitchen onboarding proposal, Contact Phone (<strong>{profile?.phone || profile?.contactPhone || "Recorded"}</strong>), Government ID ({profile?.documents?.governmentId?.idType || "Aadhaar"}), FSSAI food license (#{profile?.fssai?.licenseNumber || "Submitted"}), and kitchen photos have been received by CraveCart Administration.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
                <div className="bg-white p-4 rounded-2xl border border-[#E4D5C3] shadow-2xs">
                  <div className="flex items-center gap-2 text-[#4F6815] font-bold text-xs">
                    <FiCheckCircle className="h-4 w-4" />
                    <span>Step 1: Dispatched</span>
                  </div>
                  <p className="text-[11px] text-[#6E5C52] mt-1">Aadhaar, FSSAI, Phone & Photos submitted</p>
                </div>

                <div className="bg-[#FFFBEA] p-4 rounded-2xl border-2 border-[#75070C]/30 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#75070C] font-bold text-xs">
                    <FiClock className="h-4 w-4 animate-spin" />
                    <span>Step 2: Admin Review</span>
                  </div>
                  <p className="text-[11px] text-[#6E5C52] mt-1">Compliance & hygiene validation underway</p>
                </div>

                <div className="bg-white/60 p-4 rounded-2xl border border-[#E4D5C3] opacity-60">
                  <div className="flex items-center gap-2 text-[#6E5C52] font-bold text-xs">
                    <FiLock className="h-4 w-4" />
                    <span>Step 3: Portal Unlock</span>
                  </div>
                  <p className="text-[11px] text-[#6E5C52] mt-1">Menu, stock & orders will activate</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleCheckApproval}
                  disabled={refreshingStatus}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#4F6815] hover:bg-[#3E5210] text-[#FFFBEA] font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
                >
                  <FiRefreshCw className={`h-4 w-4 ${refreshingStatus ? "animate-spin" : ""}`} />
                  <span>{refreshingStatus ? "Checking Status..." : "Refresh Approval Status"}</span>
                </button>

                <button
                  onClick={() => setIsEnvelopeOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#75070C] text-[#75070C] hover:bg-[#75070C]/5 font-bold text-xs transition"
                >
                  ✉️ Open Envelope & Edit Details
                </button>
              </div>

            </motion.div>
          ) : !isEnvelopeOpen ? (
            /* ========================================================================= */
            /* FLOATING ENVELOPE WITH GENTLE MOTION + OPEN BUTTON */
            /* ========================================================================= */
            <div className="flex flex-col items-center justify-center py-6">
              
              <div className="text-center mb-6">
                <span className="micro-label text-[#4F6815] tracking-widest text-[11px]">
                  CHEF ONBOARDING DISPATCH
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#75070C] mt-1">
                  Kitchen Verification Proposal
                </h1>
                <p className="text-xs sm:text-sm text-[#6E5C52] mt-1 max-w-md mx-auto">
                  Click the button on the envelope below to open the official compliance form and submit your credentials for Admin review.
                </p>
              </div>

              {/* Floating Moving Envelope */}
              <motion.div
                className="relative w-full max-w-lg aspect-4/3 bg-[#D4C1AD] border-2 border-[#BFA791] rounded-3xl p-6 shadow-2xl flex flex-col justify-between cursor-pointer group select-none"
                animate={{
                  y: [0, -12, 0],
                  rotate: [-0.6, 0.6, -0.6],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                onClick={() => setIsEnvelopeOpen(true)}
              >
                
                {/* Triangular Top Flap Graphic */}
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[180px] sm:border-l-[220px] border-l-transparent border-r-[180px] sm:border-r-[220px] border-r-transparent border-t-[100px] sm:border-t-[120px] border-t-[#C5AF98] drop-shadow-md pointer-events-none" />

                {/* Postage Stamps on Top Right */}
                <div className="flex items-center justify-between z-10">
                  <div className="border border-[#75070C]/40 bg-[#FFFBEA]/80 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-[#75070C] uppercase tracking-wider shadow-2xs">
                    POSTAGE PAID • CRAVECART
                  </div>

                  <div className="h-14 w-12 border-2 border-dashed border-[#75070C]/60 bg-[#FAF6F0] rounded-lg flex flex-col items-center justify-center text-center p-1 shadow-xs">
                    <span className="text-base">👨‍🍳</span>
                    <span className="text-[7px] font-bold text-[#75070C] leading-none uppercase mt-0.5">CHEF AIRMAIL</span>
                  </div>
                </div>

                {/* Center Wax Seal & Open Button */}
                <div className="text-center z-10 my-auto">
                  
                  {/* Glowing Royal Wax Seal */}
                  <div className="w-20 h-20 rounded-full bg-[#75070C] text-[#FFFBEA] flex flex-col items-center justify-center mx-auto shadow-xl border-4 border-[#FFFBEA] ring-4 ring-[#75070C]/20 group-hover:scale-105 group-hover:ring-8 transition-all duration-300">
                    <span className="text-2xl animate-pulse">⚜️</span>
                    <span className="text-[7px] font-bold uppercase tracking-widest mt-0.5">SEAL</span>
                  </div>

                  {/* Primary Open Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEnvelopeOpen(true);
                    }}
                    className="mt-5 px-8 py-3.5 rounded-full bg-[#75070C] group-hover:bg-[#5E0509] text-[#FFFBEA] font-bold text-xs sm:text-sm shadow-xl transition transform active:scale-95 flex items-center gap-2 mx-auto"
                  >
                    <span>✉️ Open Envelope & Fill Form</span>
                    <span className="transition group-hover:translate-x-1">→</span>
                  </button>

                  <p className="text-[11px] text-[#6E5C52] font-semibold mt-2">
                    Click to extract official proposal parchment
                  </p>
                </div>

                {/* Bottom Address Tag */}
                <div className="z-10 text-center border-t border-[#BFA791]/60 pt-3">
                  <span className="text-[10px] font-mono font-bold text-[#75070C]/80 uppercase tracking-wider">
                    To: CraveCart Administrative Review Board • Food Safety & Verification Dept
                  </span>
                </div>

              </motion.div>

            </div>
          ) : (
            /* ========================================================================= */
            /* EXTRACTED LETTER / PARCHMENT PROPOSAL FORM (MATCHING ADMIN REVIEW PANEL) */
            /* ========================================================================= */
            <motion.div
              className="bg-[#D6C4B0] border border-[#C5B09A] rounded-3xl p-3 sm:p-5 shadow-2xl relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              
              {/* Envelope Header bar */}
              <div className="flex items-center justify-between px-3 py-2 text-[#75070C] text-xs font-bold uppercase tracking-wider border-b border-[#C5B09A]/60 mb-3">
                <span className="flex items-center gap-2">
                  <span className="text-base">✉️</span>
                  <span>Official CraveCart Home Chef Verification Proposal Letter</span>
                </span>
                <button
                  onClick={() => setIsEnvelopeOpen(false)}
                  className="px-3 py-1 rounded-xl bg-white/70 hover:bg-white text-[#75070C] text-[11px] font-bold transition flex items-center gap-1"
                >
                  <span>✕ Fold & Close</span>
                </button>
              </div>

              {/* Parchment Letter */}
              <motion.div
                className="bg-[#FAF6F0] border-2 border-[#E4D5C3] rounded-2xl p-6 sm:p-10 shadow-lg relative"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                
                {/* Decorative Letterhead */}
                <div className="text-center pb-6 border-b-2 border-dashed border-[#E4D5C3]">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#75070C]/10 text-[#75070C] text-2xl mb-2">
                    ⚜️
                  </div>
                  <span className="micro-label text-[#4F6815] block tracking-widest text-[10px]">
                    HOMESTEAD CULINARY PROPOSAL DOSSIER
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#75070C] mt-1">
                    Kitchen Verification & Compliance Credentials
                  </h1>
                  <p className="text-xs sm:text-sm text-[#6E5C52] mt-1 max-w-2xl mx-auto leading-relaxed">
                    Please provide the complete details requested by the Admin Review Board below. Once accepted, your full Kitchen Dashboard (Orders, Menu Slots, and Prep Quantities) will be unlocked!
                  </p>
                </div>

                {/* FORM FIELDS MATCHING ADMIN REVIEW CATEGORIES */}
                <form onSubmit={handleProposalSubmit} className="mt-8 space-y-8">
                  
                  {/* 1. OWNER & CONTACT DETAILS */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#75070C] font-serif font-bold text-base pb-2 border-b border-[#E4D5C3]">
                      <span className="text-lg">👤</span>
                      <span>1. Owner & Contact Information</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="micro-label text-[#6E5C52] block mb-1">
                          KITCHEN NAME *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. kausiki's Kitchen"
                          value={onboardForm.name}
                          onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                          required
                          className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#75070C]"
                        />
                      </div>

                      <div>
                        <label className="micro-label text-[#6E5C52] block mb-1">
                          OWNER / CHEF NAME *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. kausiki"
                          value={onboardForm.nameOnId}
                          onChange={(e) => setOnboardForm({ ...onboardForm, nameOnId: e.target.value })}
                          required
                          className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#75070C]"
                        />
                      </div>

                      <div>
                        <label className="micro-label text-[#6E5C52] block mb-1">
                          OWNER / CONTACT EMAIL *
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. chef@gmail.com"
                          value={onboardForm.ownerEmail}
                          onChange={(e) => setOnboardForm({ ...onboardForm, ownerEmail: e.target.value })}
                          required
                          className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#75070C]"
                        />
                      </div>

                      <div>
                        <label className="micro-label text-[#75070C] block mb-1">
                          CONTACT PHONE NUMBER *
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={onboardForm.phone}
                          onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                          required
                          className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#23120B] focus:border-[#75070C]"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="micro-label text-[#6E5C52] block mb-1">
                          KITCHEN STREET ADDRESS & LANDMARK
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. kalasalingam university"
                          value={onboardForm.addressText}
                          onChange={(e) => setOnboardForm({ ...onboardForm, addressText: e.target.value })}
                          className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#75070C]"
                        />
                      </div>

                      <div>
                        <label className="micro-label text-[#6E5C52] block mb-1">
                          SERVICE PINCODE *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 626126"
                          value={onboardForm.pincode}
                          onChange={(e) => setOnboardForm({ ...onboardForm, pincode: e.target.value })}
                          required
                          className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#75070C]"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="micro-label text-[#6E5C52] block mb-1">
                          KITCHEN BIO / CULINARY DESCRIPTION
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Authentic handmade home cooking with traditional flavors, hygienic preparation, and daily fresh spices."
                          value={onboardForm.description}
                          onChange={(e) => setOnboardForm({ ...onboardForm, description: e.target.value })}
                          className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#75070C]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. FSSAI FOOD SAFETY DETAILS */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#75070C] font-serif font-bold text-base pb-2 border-b border-[#E4D5C3]">
                      <span className="text-lg">📜</span>
                      <span>2. FSSAI Food Safety Credentials</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="micro-label text-[#6E5C52] block mb-1">
                          14-DIGIT FSSAI LICENSE NUMBER *
                        </label>
                        <input
                          type="text"
                          maxLength={14}
                          placeholder="e.g. 10020011000123"
                          value={onboardForm.fssaiLicenseNumber}
                          onChange={(e) => setOnboardForm({ ...onboardForm, fssaiLicenseNumber: e.target.value })}
                          required
                          className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm font-mono text-[#23120B] focus:border-[#75070C]"
                        />
                      </div>

                      <div>
                        <label className="micro-label text-[#6E5C52] block mb-1">
                          FSSAI BUSINESS NAME
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. kausiki's Kitchen"
                          value={onboardForm.fssaiBusinessName}
                          onChange={(e) => setOnboardForm({ ...onboardForm, fssaiBusinessName: e.target.value })}
                          className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#75070C]"
                        />
                      </div>

                      <div>
                        <label className="micro-label text-[#6E5C52] block mb-1">
                          FSSAI EXPIRY DATE *
                        </label>
                        <input
                          type="date"
                          value={onboardForm.fssaiExpiryDate}
                          onChange={(e) => setOnboardForm({ ...onboardForm, fssaiExpiryDate: e.target.value })}
                          required
                          className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#75070C]"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="micro-label text-[#75070C] block mb-1">
                          UPLOAD FSSAI CERTIFICATE DOCUMENT (PDF or Image) *
                        </label>
                        <div className="border-2 border-dashed border-[#E4D5C3] bg-white rounded-2xl p-4 text-center hover:border-[#75070C] transition">
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => setFssaiFile(e.target.files?.[0] || null)}
                            className="w-full text-xs text-[#6E5C52] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#75070C] file:text-[#FFFBEA] hover:file:bg-[#5E0509]"
                          />
                          <p className="text-[11px] text-[#6E5C52] mt-1.5">
                            {fssaiFile
                              ? `Selected: ${fssaiFile.name}`
                              : profile?.documents?.fssaiCertificate?.originalName
                              ? `Current on file: ${profile.documents.fssaiCertificate.originalName}`
                              : "Upload valid FSSAI Food Safety registration certificate (PDF or Image)"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. GOVERNMENT IDENTITY PROOF (AADHAAR / PAN) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#75070C] font-serif font-bold text-base pb-2 border-b border-[#E4D5C3]">
                      <span className="text-lg">🪪</span>
                      <span>3. Government Identity Verification (Aadhaar / PAN)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="micro-label text-[#6E5C52] block mb-1">
                          GOVERNMENT ID TYPE *
                        </label>
                        <select
                          value={onboardForm.governmentIdType}
                          onChange={(e) => setOnboardForm({ ...onboardForm, governmentIdType: e.target.value })}
                          className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#75070C]"
                        >
                          <option value="Aadhaar">Aadhaar Card</option>
                          <option value="PAN">PAN Card</option>
                          <option value="Voter ID">Voter ID</option>
                          <option value="Passport">Passport</option>
                        </select>
                      </div>

                      <div>
                        <label className="micro-label text-[#6E5C52] block mb-1">
                          NAME ON ID *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. kausiki"
                          value={onboardForm.nameOnId}
                          onChange={(e) => setOnboardForm({ ...onboardForm, nameOnId: e.target.value })}
                          required
                          className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#75070C]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="micro-label text-[#75070C] block mb-1">
                          UPLOAD GOVERNMENT ID DOCUMENT (Aadhaar Image / PDF) *
                        </label>
                        <div className="border-2 border-dashed border-[#E4D5C3] bg-white rounded-2xl p-4 text-center hover:border-[#75070C] transition">
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => setGovIdFile(e.target.files?.[0] || null)}
                            className="w-full text-xs text-[#6E5C52] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#75070C] file:text-[#FFFBEA] hover:file:bg-[#5E0509]"
                          />
                          <p className="text-[11px] text-[#6E5C52] mt-1.5">
                            {govIdFile
                              ? `Selected: ${govIdFile.name}`
                              : profile?.documents?.governmentId?.originalName
                              ? `Current on file: ${profile.documents.governmentId.originalName}`
                              : "Upload clear photo/scan of Aadhaar or PAN card (PDF, PNG, JPG)"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. LIVE KITCHEN PHOTOS */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#75070C] font-serif font-bold text-base pb-2 border-b border-[#E4D5C3]">
                      <span className="text-lg">📸</span>
                      <span>4. Live Kitchen & Hygiene Photos (Up to 5 Photos)</span>
                    </div>

                    <div className="border-2 border-dashed border-[#E4D5C3] bg-white rounded-2xl p-4 text-center hover:border-[#4F6815] transition">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setKitchenPhotosFiles(Array.from(e.target.files || []).slice(0, 5))}
                        className="w-full text-xs text-[#6E5C52] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#4F6815] file:text-[#FFFBEA] hover:file:bg-[#3E5210]"
                      />
                      <p className="text-[11px] text-[#6E5C52] mt-1.5">
                        {kitchenPhotosFiles.length > 0
                          ? `Selected ${kitchenPhotosFiles.length} photo(s)`
                          : "Upload clear photos showing your cooking stove, preparation counters, and hygiene setup"}
                      </p>
                    </div>
                  </div>

                  {/* 5. ADDITIONAL VERIFICATION FLAGS (VIDEO CALL & TRIAL ORDER) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#75070C] font-serif font-bold text-base pb-2 border-b border-[#E4D5C3]">
                      <span className="text-lg">🛡️</span>
                      <span>5. Optional Premium Verification Options</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="micro-label text-[#6E5C52] block mb-1">
                          REQUEST LIVE VIDEO CALL VERIFICATION (PREFERRED SLOT)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Weekdays 10:00 AM - 12:00 PM"
                          value={onboardForm.videoCallSlot}
                          onChange={(e) => setOnboardForm({ ...onboardForm, videoCallSlot: e.target.value })}
                          className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#75070C]"
                        />
                      </div>

                      <div>
                        <label className="micro-label text-[#6E5C52] block mb-1">
                          SAMPLE TASTING TRIAL ORDER NOTES
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Ready to prepare sample signature thali for tasting review"
                          value={onboardForm.trialOrderNotes}
                          onChange={(e) => setOnboardForm({ ...onboardForm, trialOrderNotes: e.target.value })}
                          className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#75070C]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Actions */}
                  <div className="pt-6 border-t-2 border-dashed border-[#E4D5C3] flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setIsEnvelopeOpen(false)}
                      className="px-5 py-3 rounded-xl border border-[#E4D5C3] text-xs font-semibold hover:bg-white transition"
                    >
                      ✕ Close Letter
                    </button>

                    <button
                      type="submit"
                      disabled={onboardSaving}
                      className="flex-1 bg-[#75070C] hover:bg-[#5E0509] text-[#FFFBEA] text-sm font-bold py-4 px-8 rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
                    >
                      {onboardSaving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sealing & Dispatching Proposal...</span>
                        </>
                      ) : (
                        <>
                          <span>Dispatch Proposal for Admin Review ✉️</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>

              </motion.div>
            </motion.div>
          )}

        </div>

        {/* Footer */}
        <footer className="max-w-5xl mx-auto w-full text-center text-xs text-[#6E5C52] pt-4 border-t border-[#E4D5C3]/80">
          © {new Date().getFullYear()} CraveCart Artisanal Food Commerce • Home Chef Application Gate
        </footer>

      </div>
    );
  }

  // =========================================================================
  // VIEW 2: UNLOCKED DASHBOARD (ONLY RENDERED AFTER ADMIN ACCEPTS PROPOSAL)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F0E6DA] text-[#23120B] antialiased pb-16">
      
      {/* Top Banner: Strict Owner Portal Notice */}
      <div className="bg-[#75070C] text-[#FFFBEA] px-4 py-2 border-b border-[#5E0509]">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <span className="font-medium flex items-center gap-2">
            <span>👨‍🍳</span>
            <span>Chef & Kitchen Owner Portal • Verified Producer Access Granted</span>
          </span>
          <button
            onClick={handleLogout}
            className="hover:underline opacity-85 font-semibold"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-[#FAF6F0] border-b border-[#E4D5C3] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Kitchen Info */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#75070C] text-[#FFFBEA] flex items-center justify-center font-serif text-2xl font-bold shadow-xs">
              {(profile?.name || "K").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-extrabold text-[#75070C] leading-none">
                  {profile?.name}
                </h1>
                <span className="micro-label bg-[#4F6815] text-[#FFFBEA] px-2 py-0.5 rounded-md text-[9px]">
                  ✓ VERIFIED KITCHEN
                </span>
              </div>
              <p className="text-xs text-[#6E5C52] mt-1">
                {profile?.addressText ? `${profile.addressText} • ` : ""}Pincode: <strong>{profile?.pincode || "Not Set"}</strong> • Phone: <strong>{profile?.phone || profile?.contactPhone || "Not Set"}</strong>
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 bg-[#F0E6DA] p-1.5 rounded-2xl border border-[#E4D5C3] overflow-x-auto">
            <button
              onClick={() => { setActiveTab("orders"); setEditingMealType(null); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "orders"
                  ? "bg-[#75070C] text-[#FFFBEA] shadow-xs"
                  : "text-[#23120B] hover:text-[#75070C]"
              }`}
            >
              <span>📦</span> Orders ({todayOrderCount})
            </button>
            <button
              onClick={() => { setActiveTab("menu"); setEditingMealType(null); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "menu"
                  ? "bg-[#75070C] text-[#FFFBEA] shadow-xs"
                  : "text-[#23120B] hover:text-[#75070C]"
              }`}
            >
              <span>🍲</span> My Menu & Stock
            </button>
            <button
              onClick={() => { setActiveTab("compliance"); setEditingMealType(null); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "compliance"
                  ? "bg-[#75070C] text-[#FFFBEA] shadow-xs"
                  : "text-[#23120B] hover:text-[#75070C]"
              }`}
            >
              <span>🛡️</span> Compliance & Docs
            </button>
            <button
              onClick={() => { setActiveTab("settings"); setEditingMealType(null); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "settings"
                  ? "bg-[#75070C] text-[#FFFBEA] shadow-xs"
                  : "text-[#23120B] hover:text-[#75070C]"
              }`}
            >
              <span>⚙️</span> Kitchen Settings
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Global Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-[#75070C]/10 border border-[#75070C]/30 text-[#75070C] text-sm font-semibold flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} className="font-bold">✕</button>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-[#4F6815]/10 border border-[#4F6815]/30 text-[#4F6815] text-sm font-semibold flex items-center justify-between">
            <span>✓ {message}</span>
            <button onClick={() => setMessage("")} className="font-bold">✕</button>
          </div>
        )}

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-5 shadow-xs">
            <span className="micro-label text-[#6E5C52] text-[9px]">TODAY'S ORDERS</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-serif text-3xl font-extrabold text-[#75070C]">{todayOrderCount}</span>
              <span className="text-xs text-[#4F6815] font-semibold">{acceptedOrderCount} Accepted</span>
            </div>
            <p className="text-[11px] text-[#6E5C52] mt-1">Pre-booked for {ordersDate}</p>
          </div>

          <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-5 shadow-xs">
            <span className="micro-label text-[#4F6815] text-[9px]">DAILY PREP CAPACITY</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-serif text-3xl font-extrabold text-[#4F6815]">{dailyOrderLimit}</span>
              <span className="text-xs text-[#6E5C52]">{Math.max(0, dailyOrderLimit - todayOrderCount)} slots left</span>
            </div>
            <p className="text-[11px] text-[#6E5C52] mt-1">Max capacity per single day</p>
          </div>

          <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-5 shadow-xs">
            <span className="micro-label text-[#75070C] text-[9px]">ESTIMATED SALES</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-serif text-3xl font-extrabold text-[#75070C]">₹{totalRevenue}</span>
              <span className="text-xs text-[#4F6815] font-bold">100% Direct</span>
            </div>
            <p className="text-[11px] text-[#6E5C52] mt-1">From current day pre-orders</p>
          </div>

          <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-5 shadow-xs">
            <span className="micro-label text-[#6E5C52] text-[9px]">KITCHEN STATUS</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-serif text-lg font-bold text-[#23120B]">
                Approved
              </span>
              <span className="text-xs font-semibold text-[#4F6815]">
                ✓ Live to Customers
              </span>
            </div>
            <p className="text-[11px] text-[#6E5C52] mt-1">
              Service PIN: {profile?.pincode}
            </p>
          </div>

        </div>

        {/* TAB 1: ORDERS MANAGEMENT */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            
            <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="micro-label text-[#4F6815]">FULFILLMENT QUEUE</span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#75070C] mt-0.5">
                  Pre-Booked Customer Orders
                </h2>
                <p className="text-xs text-[#6E5C52] mt-0.5">
                  Review meal pre-orders and accept portions in advance for seamless cooking.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-[#75070C] uppercase tracking-wider">
                  Select Date:
                </label>
                <input
                  type="date"
                  value={ordersDate}
                  onChange={(e) => setOrdersDate(e.target.value)}
                  className="bg-white border border-[#E4D5C3] text-xs font-semibold px-3 py-1.5 rounded-xl text-[#23120B] focus:outline-none focus:border-[#75070C]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {[
                  { id: "all", label: "All Orders" },
                  { id: "prebooked", label: "Pending (Prebooked)" },
                  { id: "accepted", label: "Accepted" },
                  { id: "rejected", label: "Rejected" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setOrderFilter(tab.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                      orderFilter === tab.id
                        ? "bg-[#75070C] text-[#FFFBEA] shadow-xs"
                        : "bg-white text-[#23120B] border border-[#E4D5C3] hover:border-[#75070C]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-12 text-center">
                <span className="text-4xl">📦</span>
                <h3 className="font-serif text-xl font-bold text-[#75070C] mt-3">
                  No orders for {ordersDate}
                </h3>
                <p className="text-xs text-[#6E5C52] mt-1 max-w-sm mx-auto">
                  When customers place pre-orders for your dishes, they will appear here in real time for fulfillment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.map((order) => {
                  const isPrebooked = order.status === "prebooked";
                  const isAccepted = order.status === "accepted";
                  const isRejected = order.status === "rejected";

                  return (
                    <div
                      key={order._id}
                      className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="micro-label text-[#4F6815] text-[9px]">
                              {order.mealType?.toUpperCase() || "MEAL ORDER"}
                            </span>
                            <h3 className="font-serif text-lg font-bold text-[#23120B] mt-0.5">
                              {order.mealId?.title || `${order.mealType} Special`}
                            </h3>
                          </div>

                          <span
                            className={`micro-label text-[9px] px-2.5 py-1 rounded-lg font-bold ${
                              isAccepted
                                ? "bg-[#4F6815]/15 text-[#4F6815] border border-[#4F6815]/30"
                                : isRejected
                                ? "bg-[#75070C]/15 text-[#75070C] border border-[#75070C]/30"
                                : "bg-[#FFEDAB] text-[#75070C] border border-[#F5EBCE]"
                            }`}
                          >
                            {order.status?.toUpperCase()}
                          </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#E4D5C3]/60 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[#6E5C52] text-[11px] block">Customer:</span>
                            <p className="font-semibold text-[#23120B] truncate">
                              {order.userId?.name || "Customer"}
                            </p>
                            <p className="text-[#6E5C52] text-[11px] truncate">
                              {order.userId?.email || ""}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[#6E5C52] text-[11px] block">Quantity & Total:</span>
                            <p className="font-bold text-[#75070C]">
                              {order.qty}x • ₹{(order.mealId?.price || 0) * (order.qty || 1)}
                            </p>
                            <span className="text-[10px] text-[#4F6815] uppercase font-semibold">
                              Payment: {order.paymentMethod || "UPI"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-[#E4D5C3]/60 flex items-center justify-between gap-3">
                        <span className="text-[10px] text-[#6E5C52]">
                          ID: {order._id.slice(-6).toUpperCase()}
                        </span>

                        {isPrebooked ? (
                          <div className="flex items-center gap-2">
                            <button
                              disabled={actionLoadingId === order._id}
                              onClick={() => handleOrderDecision(order._id, "reject")}
                              className="px-3 py-1.5 rounded-xl border border-[#75070C] text-[#75070C] text-xs font-bold hover:bg-[#75070C]/10 transition"
                            >
                              Reject
                            </button>
                            <button
                              disabled={actionLoadingId === order._id}
                              onClick={() => handleOrderDecision(order._id, "accept")}
                              className="px-4 py-1.5 rounded-xl bg-[#4F6815] hover:bg-[#3E5210] text-[#FFFBEA] text-xs font-bold transition shadow-xs"
                            >
                              {actionLoadingId === order._id ? "Processing..." : "Accept Order ✓"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-[#6E5C52]">
                            Decision Recorded
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: MY MENU & STOCK */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            
            <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="micro-label text-[#4F6815]">DAILY KITCHEN OFFERINGS</span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#75070C] mt-0.5">
                  Manage Products & Stock Quantities
                </h2>
                <p className="text-xs text-[#6E5C52] mt-0.5">
                  Configure the four daily meal slots with dish photography, price, and preparation limits.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-[#75070C] uppercase tracking-wider">
                  Menu Date:
                </label>
                <input
                  type="date"
                  value={menuDate}
                  onChange={(e) => {
                    setMenuDate(e.target.value);
                    setEditingMealType(null);
                  }}
                  className="bg-white border border-[#E4D5C3] text-xs font-semibold px-3 py-1.5 rounded-xl text-[#23120B] focus:outline-none focus:border-[#75070C]"
                />
              </div>
            </div>

            {editingMealType && (
              <form
                onSubmit={saveMeal}
                className="bg-[#FFFBEA] border-2 border-[#75070C]/30 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E4D5C3]">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {MEAL_TYPES.find((m) => m.key === editingMealType)?.icon}
                    </span>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#75070C]">
                        {editingMealId ? `Edit "${mealForm.title || editingMealType}" Dish` : `+ Add New ${editingMealType.toUpperCase()} Dish`}
                      </h3>
                      <p className="text-xs text-[#6E5C52]">Serving on {menuDate}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMealType(null);
                      setEditingMealId(null);
                    }}
                    className="text-xs font-bold text-[#6E5C52] hover:text-[#75070C]"
                  >
                    ✕ Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="micro-label text-[#75070C] block mb-1">
                      Dish Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Traditional Steamed Idly with Podi & Chutney"
                      value={mealForm.title}
                      onChange={(e) => setMealForm({ ...mealForm, title: e.target.value })}
                      required
                      className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2 rounded-xl text-sm font-semibold text-[#23120B]"
                    />
                  </div>

                  <div>
                    <label className="micro-label text-[#4F6815] block mb-1">
                      Dish Photo (URL or Upload)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://..."
                        value={mealForm.imageUrl}
                        onChange={(e) => setMealForm({ ...mealForm, imageUrl: e.target.value })}
                        className="flex-1 bg-white border border-[#E4D5C3] px-3 py-2 rounded-xl text-xs text-[#23120B]"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="bg-[#FAF6F0] border border-[#E4D5C3] text-xs font-bold px-3 py-2 rounded-xl hover:bg-white transition"
                      >
                        {uploadingImage ? "..." : "📁 Browse"}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="micro-label text-[#6E5C52] block mb-1">
                    Description & Ingredients
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Made with organic fermented batter, served with fresh coconut chutney & sambar."
                    value={mealForm.description}
                    onChange={(e) => setMealForm({ ...mealForm, description: e.target.value })}
                    className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2 rounded-xl text-xs text-[#23120B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="micro-label text-[#75070C] block mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 60"
                      value={mealForm.price}
                      onChange={(e) => setMealForm({ ...mealForm, price: e.target.value })}
                      required
                      className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2 rounded-xl text-sm font-bold text-[#75070C]"
                    />
                  </div>

                  <div>
                    <label className="micro-label text-[#4F6815] block mb-1">
                      Daily Stock / Prep Qty *
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 25"
                      value={mealForm.totalQty}
                      onChange={(e) => setMealForm({ ...mealForm, totalQty: e.target.value })}
                      required
                      className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2 rounded-xl text-sm font-bold text-[#4F6815]"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-[#23120B]">
                      <input
                        type="checkbox"
                        checked={mealForm.isAvailable}
                        onChange={(e) => setMealForm({ ...mealForm, isAvailable: e.target.checked })}
                        className="h-4 w-4 accent-[#4F6815]"
                      />
                      <span>Active for Ordering</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E4D5C3] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMealType(null);
                      setEditingMealId(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-[#E4D5C3] text-xs font-semibold hover:bg-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={mealSaving}
                    className="bg-[#75070C] hover:bg-[#5E0509] text-[#FFFBEA] text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-xs"
                  >
                    {mealSaving ? "Saving Dish..." : editingMealId ? "Update Dish Changes →" : "Add Dish to Menu →"}
                  </button>
                </div>
              </form>
            )}

            {mealsLoading ? (
              <div className="py-8 text-center flex items-center justify-center gap-2 text-sm text-[#75070C]">
                <div className="w-5 h-5 border-2 border-[#75070C] border-t-transparent rounded-full animate-spin" />
                <span>Loading dishes for {menuDate}...</span>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {MEAL_TYPES.map((type) => {
                const categoryDishes = meals.filter((m) => m.mealType === type.key);
                const hasDishes = categoryDishes.length > 0;

                return (
                  <div
                    key={type.key}
                    className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Category Header */}
                      <div className="p-4 bg-[#F0E6DA]/60 border-b border-[#E4D5C3] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{type.icon}</span>
                          <div>
                            <span className="micro-label text-[#75070C] text-[9px] block">
                              {type.label.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-[#6E5C52]">{type.timeSlot}</span>
                          </div>
                        </div>

                        <span
                          className={`micro-label text-[9px] px-2.5 py-0.5 rounded-md font-bold ${
                            hasDishes
                              ? "bg-[#4F6815]/15 text-[#4F6815] border border-[#4F6815]/30"
                              : "bg-white text-[#6E5C52] border border-[#E4D5C3]"
                          }`}
                        >
                          {hasDishes
                            ? `${categoryDishes.length} ${categoryDishes.length === 1 ? "DISH" : "DISHES"}`
                            : "UNCONFIGURED"}
                        </span>
                      </div>

                      {/* Dishes List */}
                      <div className="p-4 space-y-4">
                        {hasDishes ? (
                          categoryDishes.map((dish, idx) => {
                            const sold = dish.soldQty || 0;
                            const total = dish.totalQty || 0;
                            const remaining = Math.max(0, total - sold);

                            return (
                              <div
                                key={dish._id || idx}
                                className={`flex flex-col sm:flex-row gap-3 items-start justify-between ${
                                  idx > 0 ? "pt-4 border-t border-[#E4D5C3]/70" : ""
                                }`}
                              >
                                <div className="flex gap-3 items-start flex-1 min-w-0">
                                  {dish.imageUrl ? (
                                    <img
                                      src={resolveUploadUrl(dish.imageUrl)}
                                      alt={dish.title}
                                      className="h-16 w-16 rounded-xl object-cover border border-[#E4D5C3] shrink-0"
                                    />
                                  ) : (
                                    <div className="h-16 w-16 rounded-xl bg-[#E4D5C3]/50 border border-[#E4D5C3] flex items-center justify-center text-xl shrink-0">
                                      🍲
                                    </div>
                                  )}

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-serif text-base font-bold text-[#23120B] truncate">
                                        {dish.title}
                                      </h4>
                                      <span
                                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                                          dish.isAvailable !== false
                                            ? "bg-[#4F6815]/10 text-[#4F6815]"
                                            : "bg-[#75070C]/10 text-[#75070C]"
                                        }`}
                                      >
                                        {dish.isAvailable !== false ? "Available" : "Paused"}
                                      </span>
                                    </div>

                                    {dish.description && (
                                      <p className="text-xs text-[#6E5C52] mt-0.5 line-clamp-1">
                                        {dish.description}
                                      </p>
                                    )}

                                    <div className="mt-1 flex items-center gap-3 text-xs">
                                      <span className="font-serif font-extrabold text-[#75070C]">
                                        ₹{dish.price}
                                      </span>
                                      <span className="text-[11px] text-[#4F6815] font-semibold">
                                        {remaining} / {total} prep ({sold} sold)
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Individual Dish Action Buttons */}
                                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => openMealEditor(type.key, dish)}
                                    className="px-3 py-1.5 rounded-xl border border-[#75070C]/30 bg-[#75070C]/5 hover:bg-[#75070C] text-[#75070C] hover:text-[#FFFBEA] text-xs font-bold transition flex items-center gap-1"
                                  >
                                    <span>✏️</span>
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDish(dish._id, dish.title)}
                                    className="p-1.5 rounded-xl border border-[#B91C1C]/20 hover:bg-[#B91C1C]/10 text-[#B91C1C] text-xs transition"
                                    title="Remove dish"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-xs text-[#6E5C52]">
                              No dishes added for {type.label} on this date.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Bottom: Always Add New Dish Button */}
                    <div className="p-4 pt-2 border-t border-[#E4D5C3]/60 flex justify-end">
                      <button
                        type="button"
                        onClick={() => openMealEditor(type.key, null)}
                        className="bg-[#75070C] hover:bg-[#5E0509] text-[#FFFBEA] text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
                      >
                        <span>+</span>
                        <span>Add New {type.label} Dish</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 3: COMPLIANCE & DOCS */}
        {activeTab === "compliance" && (
          <div className="space-y-6">
            <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-8 shadow-xs">
              <span className="micro-label text-[#4F6815]">COMPLIANCE DOSSIER</span>
              <h2 className="font-serif text-2xl font-bold text-[#75070C] mt-1">
                Verified Credentials
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 mt-6 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-[#E4D5C3]">
                  <span className="text-[#6E5C52] block">FSSAI Registration:</span>
                  <p className="font-mono font-bold text-sm text-[#23120B] mt-0.5">{profile?.fssai?.licenseNumber}</p>
                  <p className="text-[11px] text-[#4F6815] mt-1 font-semibold">✓ Verified Food Safety License</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E4D5C3]">
                  <span className="text-[#6E5C52] block">Identity Document:</span>
                  <p className="font-bold text-sm text-[#23120B] mt-0.5">{profile?.documents?.governmentId?.idType} ({profile?.documents?.governmentId?.nameOnId})</p>
                  <p className="text-[11px] text-[#4F6815] mt-1 font-semibold">✓ Identity Verified</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: KITCHEN SETTINGS */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-8 shadow-xs">
              <span className="micro-label text-[#4F6815]">CAPACITY CONTROL</span>
              <h2 className="font-serif text-2xl font-bold text-[#75070C] mt-1">
                Daily Order Limit
              </h2>
              <p className="text-xs text-[#6E5C52] mt-1 leading-relaxed">
                Controls the maximum number of pre-orders your kitchen will accept in a single calendar day across all four meal slots.
              </p>

              <div className="mt-6">
                <label className="micro-label text-[#23120B] block mb-1.5">
                  Max Orders / Day
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min={1}
                    value={dailyOrderLimit}
                    onChange={(e) => setDailyOrderLimit(e.target.value)}
                    className="flex-1 bg-white border border-[#E4D5C3] px-4 py-2.5 rounded-xl font-bold text-lg text-[#75070C]"
                  />
                  <button
                    onClick={saveLimit}
                    disabled={limitSaving}
                    className="bg-[#75070C] hover:bg-[#5E0509] text-[#FFFBEA] text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-xs"
                  >
                    {limitSaving ? "Saving..." : "Save Limit"}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-8 shadow-xs">
              <span className="micro-label text-[#75070C]">GEOGRAPHY & REACH</span>
              <h2 className="font-serif text-2xl font-bold text-[#75070C] mt-1">
                Kitchen Address & Pincode
              </h2>
              <p className="text-xs text-[#6E5C52] mt-1 leading-relaxed">
                Determines the neighborhood delivery radius and matching customers for your culinary offerings.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="micro-label text-[#23120B] block mb-1">
                    Service Pincode *
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    placeholder="e.g. 626126"
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2 rounded-xl text-sm font-semibold text-[#23120B]"
                  />
                </div>

                <div>
                  <label className="micro-label text-[#23120B] block mb-1">
                    Kitchen Address / Landmark
                  </label>
                  <input
                    type="text"
                    value={addressText}
                    placeholder="e.g. 14 North Gate, Kalasalingam University"
                    onChange={(e) => setAddressText(e.target.value)}
                    className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2 rounded-xl text-sm text-[#23120B]"
                  />
                </div>

                <button
                  onClick={saveLocation}
                  disabled={locationSaving}
                  className="w-full bg-[#4F6815] hover:bg-[#3E5210] text-[#FFFBEA] text-xs font-bold py-2.5 rounded-xl transition shadow-xs"
                >
                  {locationSaving ? "Saving..." : "Update Location & Reach →"}
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
