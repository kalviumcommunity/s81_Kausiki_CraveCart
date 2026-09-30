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
  FiFileText,
  FiCamera,
  FiMapPin,
  FiAlertTriangle,
  FiHelpCircle,
  FiInfo,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiGlobe,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiMenu,
  FiX,
  FiShoppingBag,
} from "react-icons/fi";
import { translations, getStoredLang, setStoredLang } from "../kitchenTranslations";

const todayStr = () => new Date().toISOString().slice(0, 10);

const emptyMealForm = {
  title: "",
  description: "",
  imageUrl: "",
  price: "",
  totalQty: "",
  isAvailable: true,
};

// =========================================================================
// KITCHEN PROFILE ICON BUTTON & DROPDOWN COMPONENT
// =========================================================================
function KitchenProfileButton({ profile, lang, t, onLogout, onLangToggle }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const kitchenName = profile?.name || (lang === "te" ? "హోమ్ కిచెన్" : "Home Kitchen");
  const chefName =
    profile?.documents?.governmentId?.nameOnId ||
    profile?.ownerName ||
    (lang === "te" ? "హోమ్ చెఫ్" : "Home Chef");
  const email = profile?.contactEmail || profile?.ownerUserId?.email || "";
  const initialLetter = (kitchenName || "K").slice(0, 1).toUpperCase();

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* The Icon Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-white hover:bg-[#FAF6F0] border border-[#E4D5C3] text-[#23120B] transition shadow-xs group focus:outline-none focus:ring-2 focus:ring-[#4F6815]/30 cursor-pointer"
        title="Kitchen Profile & Logout"
      >
        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#4F6815] text-[#FFFBEA] flex items-center justify-center font-serif text-base font-bold shadow-2xs group-hover:scale-105 transition">
          {initialLetter}
        </div>
        <div className="hidden sm:block text-left pr-1">
          <span className="text-xs font-bold text-[#23120B] block max-w-[130px] truncate leading-tight">
            {kitchenName}
          </span>
          <span className="text-[10px] text-[#4F6815] font-semibold block leading-tight">
            {profile?.verified ? (lang === "te" ? "✓ ధృవీకరించబడింది" : "✓ Verified") : (lang === "te" ? "⏳ సమీక్షలో ఉంది" : "⏳ Review")}
          </span>
        </div>
        <FiChevronDown
          className={`text-[#6E5C52] text-xs transition duration-200 ${
            open ? "rotate-180 text-[#4F6815]" : ""
          }`}
        />
      </button>

      {/* The Dropdown Popover Card */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop click dismisser */}
            <div
              className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[0.5px]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#FAF6F0] border-2 border-[#E4D5C3] rounded-3xl p-4 shadow-2xl z-50 overflow-hidden backdrop-blur-md"
            >
            {/* Top Kitchen Info */}
            <div className="flex items-start gap-3 pb-3.5 border-b border-[#E4D5C3]">
              <div className="h-12 w-12 rounded-2xl bg-[#4F6815] text-[#FFFBEA] flex items-center justify-center font-serif text-xl font-bold shadow-xs shrink-0">
                {initialLetter}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-black text-base text-[#23120B] truncate">
                  {kitchenName}
                </h3>
                <p className="text-xs text-[#6E5C52] font-semibold truncate">
                  {chefName}
                </p>
                {email && (
                  <p className="text-[11px] text-[#6E5C52]/80 truncate mt-0.5">
                    {email}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      profile?.verified
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {profile?.verified
                      ? (lang === "te" ? "✓ ధృవీకరించబడిన కిచెన్" : "✓ Verified Kitchen")
                      : (lang === "te" ? "⏳ పరిశీలనలో ఉంది" : "⏳ Under Verification")}
                  </span>
                  {profile?.pincode && (
                    <span className="text-[9px] font-semibold bg-white border border-[#E4D5C3] text-[#6E5C52] px-2 py-0.5 rounded-full">
                      PIN: {profile.pincode}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Language Selector */}
            <div className="py-3 border-b border-[#E4D5C3] flex items-center justify-between text-xs">
              <span className="text-[#6E5C52] font-semibold flex items-center gap-1.5">
                <FiGlobe className="text-[#4F6815]" />
                <span>{lang === "te" ? "భాష (Language):" : "Language:"}</span>
              </span>
              <div className="flex items-center bg-white p-0.5 rounded-xl border border-[#E4D5C3]">
                <button
                  type="button"
                  onClick={() => onLangToggle("en")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                    lang === "en"
                      ? "bg-[#4F6815] text-white shadow-2xs"
                      : "text-[#6E5C52] hover:text-[#23120B]"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => onLangToggle("te")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                    lang === "te"
                      ? "bg-[#4F6815] text-white shadow-2xs"
                      : "text-[#6E5C52] hover:text-[#23120B]"
                  }`}
                >
                  తెలుగు
                </button>
              </div>
            </div>

            {/* Quick Link to Customer Store */}
            <div className="py-2">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#6E5C52] hover:text-[#4F6815] hover:bg-white transition border border-transparent hover:border-[#E4D5C3]"
              >
                <span>{t.marketplace}</span>
                <span className="text-[10px] text-[#4F6815] font-semibold">{lang === "te" ? "చూడండి" : "View"}</span>
              </Link>
            </div>

            {/* Bottom: The Down Logout Button */}
            <div className="pt-2 border-t border-[#E4D5C3]">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <FiLogOut className="text-sm" />
                <span>{t.signOut}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </div>
);
}

export default function KitchenDashboard() {
  const navigate = useNavigate();

  // Language State (en | te)
  const [lang, setLang] = useState(getStoredLang());
  const t = translations[lang] || translations.en;

  const handleLangToggle = (selectedLang) => {
    setLang(selectedLang);
    setStoredLang(selectedLang);
  };

  const mealTypes = useMemo(() => [
    { key: "breakfast", label: t.breakfast, icon: "🍳", timeSlot: t.breakfastTime, tip: t.breakfastTip },
    { key: "lunch", label: t.lunch, icon: "🍲", timeSlot: t.lunchTime, tip: t.lunchTip },
    { key: "snacks", label: t.snacks, icon: "🥐", timeSlot: t.snacksTime, tip: t.snacksTip },
    { key: "dinner", label: t.dinner, icon: "🍽️", timeSlot: t.dinnerTime, tip: t.dinnerTip },
  ], [t]);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Envelope Interactive State
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [refreshingStatus, setRefreshingStatus] = useState(false);

  // Proposal / Onboarding Form State
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

  // Dashboard Navigation Tabs & Responsive Sidebar
  const [activeTab, setActiveTab] = useState("orders");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  // Track if form has been initialized so background status polling does not reset user inputs
  const initialFormPopulatedRef = useRef(false);

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

      // Only populate the form fields on initial load, never during background status polling
      if (!silent || !initialFormPopulatedRef.current) {
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
        initialFormPopulatedRef.current = true;
      }
    } catch (err) {
      setProfile(null);
      setError(err.message || (lang === "te" ? "కిచెన్ వివరాలు లోడ్ చేయడం సాధ్యపడలేదు." : "Unable to load kitchen details"));
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
      setMessage(
        lang === "te"
          ? `ఆర్డర్ ${decision === "accept" ? "విజయవంతంగా అంగీకరించబడింది! మీరు వంట చేయడం ప్రారంభించవచ్చు." : "తిరస్కరించబడింది."}`
          : `Order was successfully ${decision === "accept" ? "accepted! You can start preparing the meal." : "declined."}`
      );
      await loadOrders();
    } catch (err) {
      setError(err.message || (lang === "te" ? "ఆర్డర్ స్థితిని అప్‌డేట్ చేయడం సాధ్యపడలేదు." : `Unable to ${decision} order.`));
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
      setMessage(lang === "te" ? "మీ రోజువారీ వంట పరిమితి సేవ్ చేయబడింది!" : "Your daily meal limit has been updated successfully!");
    } catch (e) {
      setError(e.message || (lang === "te" ? "పరిమితిని అప్‌డేట్ చేయడం విఫలమైంది." : "Unable to update daily limit"));
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
      setMessage(lang === "te" ? "మీ కిచెన్ చిరునామా మరియు డెలివరీ పిన్‌కోడ్ సేవ్ చేయబడ్డాయి." : "Your kitchen address and delivery area pincode have been saved.");
    } catch (e) {
      setError(e.message || (lang === "te" ? "చిరునామా సేవ్ చేయడం విఫలమైంది." : "Unable to save kitchen address"));
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
    const confirmMsg = lang === "te" ? `ఖచ్చితంగా "${dishTitle}" ను ఈరోజు మెనూ నుండి తొలగించాలా?` : `Are you sure you want to remove "${dishTitle}" from today's menu?`;
    if (!window.confirm(confirmMsg)) return;
    setError("");
    setMessage("");
    try {
      await apiFetch(`/api/kitchens/my/meals/${dishId}`, { method: "DELETE" });
      setMessage(lang === "te" ? `"${dishTitle}" మెనూ నుండి తొలగించబడింది.` : `"${dishTitle}" was removed from your menu.`);
      if (editingMealId === dishId) {
        setEditingMealType(null);
        setEditingMealId(null);
      }
      await loadMeals();
    } catch (err) {
      setError(err.message || (lang === "te" ? "వంటకాన్ని తొలగించడం విఫలమైంది." : "Unable to remove dish."));
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
      setMessage(lang === "te" ? "వంటకం ఫోటో విజయవంతంగా అప్‌లోడ్ అయ్యింది!" : "Dish photo uploaded successfully!");
    } catch (err) {
      setError(err.message || (lang === "te" ? "ఫోటో అప్‌లోడ్ చేయడం విఫలమైంది." : "Unable to upload photo"));
    } finally {
      setUploadingImage(false);
    }
  };

  const saveMeal = async (e) => {
    e.preventDefault();
    if (!mealForm.title.trim() || mealForm.price === "" || mealForm.totalQty === "") {
      setError(lang === "te" ? "దయచేసి వంటకం పేరు, ప్లేట్ ధర మరియు ఎన్ని ప్లేట్లు వండగలరో నమోదు చేయండి." : "Please fill in the dish name, price, and how many plates you can cook.");
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
          ? (lang === "te" ? `"${mealForm.title.trim()}" విజయవంతంగా అప్‌డేట్ చేయబడింది!` : `"${mealForm.title.trim()}" was updated for ${editingMealType} on ${menuDate}.`)
          : (lang === "te" ? `కొత్త వంటకం "${mealForm.title.trim()}" మెనూలో చేర్చబడింది!` : `New dish "${mealForm.title.trim()}" added to ${editingMealType} for ${menuDate}!`)
      );
      setEditingMealType(null);
      setEditingMealId(null);
      await loadMeals();
    } catch (err) {
      setError(err.message || (lang === "te" ? "వంటకాన్ని సేవ్ చేయడం విఫలమైంది." : "Unable to save dish."));
    } finally {
      setMealSaving(false);
    }
  };

  // Submit Verification Form
  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!onboardForm.name.trim()) {
      setError(lang === "te" ? "దయచేసి మీ కిచెన్ పేరును నమోదు చేయండి." : "Please enter your Kitchen Name.");
      return;
    }
    if (!onboardForm.pincode.trim() || !/^\d{4,10}$/.test(onboardForm.pincode.trim())) {
      setError(lang === "te" ? "దయచేసి సరైన 6 అంకెల పిన్‌కోడ్‌ను నమోదు చేయండి." : "Please enter a valid 6-digit delivery area pincode.");
      return;
    }
    if (!onboardForm.nameOnId.trim()) {
      setError(lang === "te" ? "దయచేసి మీ గుర్తింపు కార్డులో ఉన్న పేరును నమోదు చేయండి." : "Please enter your full name as printed on your ID card.");
      return;
    }
    if (!onboardForm.ownerEmail.trim() || !/^\S+@\S+\.\S+$/.test(onboardForm.ownerEmail.trim())) {
      setError(lang === "te" ? "దయచేసి సరైన ఈమెయిల్ అడ్రస్ నమోదు చేయండి." : "Please enter a valid email address.");
      return;
    }
    const cleanPhone = (onboardForm.phone || "").replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setError(lang === "te" ? "దయచేసి మీ 10 అంకెల మొబైల్ ఫోన్ నంబర్‌ను నమోదు చేయండి." : "Please enter your 10-digit mobile phone number.");
      return;
    }
    if (!onboardForm.fssaiLicenseNumber.trim() || !/^\d{14}$/.test(onboardForm.fssaiLicenseNumber.trim())) {
      setError(lang === "te" ? "దయచేసి మీ 14 అంకెల FSSAI నంబర్‌ను నమోదు చేయండి." : "Please enter your 14-digit FSSAI Food Safety Number.");
      return;
    }
    if (!onboardForm.fssaiExpiryDate) {
      setError(lang === "te" ? "దయచేసి FSSAI సర్టిఫికెట్ ఎక్స్‌పైరీ తేదీని ఎంచుకోండి." : "Please select your FSSAI certificate expiry date.");
      return;
    }
    if (!profile?.documents?.governmentId?.urlPath && !govIdFile) {
      setError(lang === "te" ? "దయచేసి మీ ఆధార్ లేదా పాన్ కార్డు ఫోటోను జత చేయండి." : "Please attach a photo or document of your Aadhaar or PAN card.");
      return;
    }
    if (!profile?.documents?.fssaiCertificate?.urlPath && !fssaiFile) {
      setError(lang === "te" ? "దయచేసి మీ FSSAI సర్టిఫికెట్ ఫైల్‌ను జత చేయండి." : "Please attach your FSSAI Food Safety certificate file.");
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
      fd.append("phone", cleanPhone.slice(0, 10));
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
      setMessage(lang === "te" ? "మీ కిచెన్ రిజిస్ట్రేషన్ వివరాలు సమర్పించబడ్డాయి! మా బృందం పరిశీలిస్తోంది." : "Your kitchen registration details have been submitted! Our team is reviewing them.");
    } catch (err) {
      setError(err.message || (lang === "te" ? "దరఖాస్తు సమర్పించడం విఫలమైంది." : "Unable to submit application."));
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
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#4F6815] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-base font-bold text-[#4F6815]">{t.loading}</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: SIMPLE, WELCOMING ONBOARDING SCREEN FOR HOMEMAKERS
  // =========================================================================
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-[#EFE4D6] text-[#23120B] flex flex-col justify-between relative overflow-hidden py-6 px-4">
        
        {/* Soft Background Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[#4F6815]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-[#75070C]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header with Kitchen Profile & Logout Icon Button */}
        <header className="max-w-5xl mx-auto w-full flex items-center justify-between relative z-40 pb-4 border-b border-[#E4D5C3]/80">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-[#4F6815] text-[#FFFBEA] flex items-center justify-center font-serif text-xl font-bold shadow-xs">
              👩‍🍳
            </div>
            <div>
              <span className="font-serif text-2xl font-black text-[#4F6815] tracking-tight">CraveCart</span>
              <span className="text-[10px] font-bold text-[#6E5C52] block -mt-1">{t.homeChefPortal}</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher clearly outside in the Header */}
            <div className="flex items-center bg-white p-1 rounded-2xl border border-[#E4D5C3] shadow-2xs">
              <span className="text-xs px-1.5 text-[#4F6815] flex items-center gap-1 font-bold">
                <FiGlobe />
              </span>
              <button
                type="button"
                onClick={() => handleLangToggle("en")}
                className={`px-2.5 py-1 text-xs font-bold rounded-xl transition cursor-pointer ${
                  lang === "en"
                    ? "bg-[#4F6815] text-[#FFFBEA] shadow-xs"
                    : "text-[#6E5C52] hover:text-[#23120B]"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => handleLangToggle("te")}
                className={`px-2.5 py-1 text-xs font-bold rounded-xl transition cursor-pointer ${
                  lang === "te"
                    ? "bg-[#4F6815] text-[#FFFBEA] shadow-xs"
                    : "text-[#6E5C52] hover:text-[#23120B]"
                }`}
              >
                తెలుగు
              </button>
            </div>

            <button
              onClick={handleCheckApproval}
              disabled={refreshingStatus}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-[#E4D5C3] bg-white text-xs font-bold text-[#4F6815] hover:bg-[#4F6815] hover:text-white transition shadow-xs cursor-pointer"
            >
              <FiRefreshCw className={`h-3.5 w-3.5 ${refreshingStatus ? "animate-spin" : ""}`} />
              <span>{refreshingStatus ? t.checkingStatus : t.refreshStatus}</span>
            </button>

            {/* Profile Icon Button with Kitchen Name & Down Logout Button */}
            <KitchenProfileButton
              profile={profile}
              lang={lang}
              t={t}
              onLogout={handleLogout}
              onLangToggle={handleLangToggle}
            />
          </div>
        </header>

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto w-full my-6 relative z-0">
          
          {/* Notification Alerts */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-2xs"
            >
              <span>⚠️ {error}</span>
              <button onClick={() => setError("")} className="font-bold ml-2">✕</button>
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-900 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-2xs"
            >
              <span>✓ {message}</span>
              <button onClick={() => setMessage("")} className="font-bold ml-2">✕</button>
            </motion.div>
          )}

          {/* IF APPLICATION SUBMITTED & ENVELOPE CLOSED: SHOW SIMPLE STATUS CARD */}
          {hasSubmittedProposal && !isEnvelopeOpen ? (
            <motion.div
              className={`bg-[#FAF6F0] border-2 ${
                profile?.verificationStatus === "rejected" ? "border-red-300 ring-4 ring-red-100" : "border-[#E4D5C3]"
              } rounded-3xl p-6 sm:p-10 shadow-xl text-center relative overflow-hidden`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {profile?.verificationStatus === "rejected" ? (
                /* REJECTED STATE WITH CLEAR FRIENDLY HELP */
                <>
                  <div className="w-16 h-16 rounded-2xl bg-[#991B1B] text-[#FFFBEA] flex items-center justify-center mx-auto shadow-md text-3xl mb-3">
                    ✏️
                  </div>

                  <span className="inline-block micro-label bg-red-100 text-[#991B1B] border border-red-300 px-3.5 py-1 rounded-full text-xs font-bold">
                    {t.rejectedTag}
                  </span>

                  <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#75070C] mt-2">
                    {profile?.name || "Your Home Kitchen"}
                  </h1>

                  <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-left max-w-xl mx-auto">
                    <div className="flex items-center gap-1.5 text-red-800 font-bold text-xs">
                      <span>{t.rejectedNoteTitle}</span>
                    </div>
                    <p className="text-sm text-red-950 mt-1 font-semibold italic bg-white p-3 rounded-xl border border-red-100">
                      "{profile?.verificationRejectedReason || (lang === "te" ? "దయచేసి మీ FSSAI సర్టిఫికెట్ లేదా వివరాలను సరిచూడండి." : "Please verify your FSSAI certificate or kitchen photos.")}"
                    </p>
                    <p className="text-xs text-red-700 mt-2">
                      {t.rejectedHelp}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => setIsEnvelopeOpen(true)}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#75070C] hover:bg-[#5E0509] text-[#FFFBEA] font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
                    >
                      <span>{t.btnFixDetails}</span>
                    </button>

                    <button
                      onClick={handleCheckApproval}
                      disabled={refreshingStatus}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#E4D5C3] bg-white hover:bg-[#FAF6F0] text-[#6E5C52] font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
                    >
                      <FiRefreshCw className={`h-4 w-4 ${refreshingStatus ? "animate-spin" : ""}`} />
                      <span>{refreshingStatus ? t.checkingStatus : t.refreshStatus}</span>
                    </button>
                  </div>
                </>
              ) : (
                /* PENDING APPLICATION STATE */
                <>
                  <div className="w-16 h-16 rounded-2xl bg-[#4F6815] text-[#FFFBEA] flex items-center justify-center mx-auto shadow-md text-3xl mb-3">
                    ⏳
                  </div>

                  <span className="inline-block micro-label bg-[#4F6815]/15 text-[#4F6815] border border-[#4F6815]/30 px-3.5 py-1 rounded-full text-xs font-bold">
                    {t.underReviewTag}
                  </span>

                  <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#23120B] mt-2">
                    {profile?.name || "Your Home Kitchen"}
                  </h1>

                  <p className="text-sm text-[#6E5C52] mt-2 max-w-lg mx-auto leading-relaxed">
                    {t.underReviewDesc}
                  </p>

                  {/* 3 Step Visual Progress */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto">
                    <div className="bg-white p-3.5 rounded-2xl border border-[#E4D5C3] shadow-2xs">
                      <div className="flex items-center gap-1.5 text-[#4F6815] font-bold text-xs">
                        <FiCheckCircle className="h-4 w-4" />
                        <span>{t.stepSent}</span>
                      </div>
                      <p className="text-[11px] text-[#6E5C52] mt-1">{t.stepSentDesc}</p>
                    </div>

                    <div className="bg-[#FFFBEA] p-3.5 rounded-2xl border-2 border-[#4F6815]/40 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-[#4F6815] font-bold text-xs">
                        <FiClock className="h-4 w-4 animate-spin" />
                        <span>{t.stepReview}</span>
                      </div>
                      <p className="text-[11px] text-[#6E5C52] mt-1">{t.stepReviewDesc}</p>
                    </div>

                    <div className="bg-white/60 p-3.5 rounded-2xl border border-[#E4D5C3] opacity-60">
                      <div className="flex items-center gap-1.5 text-[#6E5C52] font-bold text-xs">
                        <FiLock className="h-4 w-4" />
                        <span>{t.stepUnlock}</span>
                      </div>
                      <p className="text-[11px] text-[#6E5C52] mt-1">{t.stepUnlockDesc}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={handleCheckApproval}
                      disabled={refreshingStatus}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#4F6815] hover:bg-[#3E5210] text-[#FFFBEA] font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
                    >
                      <FiRefreshCw className={`h-4 w-4 ${refreshingStatus ? "animate-spin" : ""}`} />
                      <span>{refreshingStatus ? t.checkingStatus : t.refreshStatus}</span>
                    </button>

                    <button
                      onClick={() => setIsEnvelopeOpen(true)}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#4F6815] text-[#4F6815] hover:bg-[#4F6815]/5 font-bold text-xs transition"
                    >
                      {t.btnEditDetails}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ) : !isEnvelopeOpen ? (
            /* ========================================================================= */
            /* FLOATING INVITATION CARD WITH CLEAR "OPEN FORM" BUTTON */
            /* ========================================================================= */
            <div className="flex flex-col items-center justify-center py-4">
              
              <div className="text-center mb-6 max-w-lg">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4F6815] bg-[#4F6815]/10 px-3 py-1 rounded-full border border-[#4F6815]/20">
                  {t.onboardingTag}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#23120B] mt-2">
                  {t.onboardingTitle}
                </h1>
                <p className="text-xs sm:text-sm text-[#6E5C52] mt-1.5">
                  {t.onboardingSubtitle}
                </p>
              </div>

              {/* Friendly Welcome Card */}
              <motion.div
                className="w-full max-w-lg bg-[#FAF6F0] border-2 border-[#E4D5C3] rounded-3xl p-6 sm:p-8 shadow-xl text-center cursor-pointer group select-none hover:border-[#4F6815] transition"
                animate={{
                  y: [0, -6, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                }}
                onClick={() => setIsEnvelopeOpen(true)}
              >
                <div className="w-16 h-16 rounded-2xl bg-[#4F6815] text-[#FFFBEA] flex items-center justify-center mx-auto shadow-md text-3xl mb-4 group-hover:scale-105 transition">
                  👩‍🍳
                </div>

                <h2 className="font-serif text-xl font-bold text-[#4F6815]">
                  {t.envelopeCardTitle}
                </h2>
                <p className="text-xs text-[#6E5C52] mt-1">
                  {t.envelopeCardSubtitle}
                </p>

                <div className="my-5 p-3.5 bg-white rounded-2xl border border-[#E4D5C3] text-left text-xs text-[#6E5C52] space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-[#23120B]">
                    <span className="text-[#4F6815]">✓</span> {t.envelopeCheck1}
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-[#23120B]">
                    <span className="text-[#4F6815]">✓</span> {t.envelopeCheck2}
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-[#23120B]">
                    <span className="text-[#4F6815]">✓</span> {t.envelopeCheck3}
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-[#23120B]">
                    <span className="text-[#4F6815]">✓</span> {t.envelopeCheck4}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEnvelopeOpen(true);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#4F6815] hover:bg-[#3E5210] text-[#FFFBEA] font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>{t.btnOpenForm}</span>
                  <span>→</span>
                </button>
              </motion.div>

            </div>
          ) : (
            /* ========================================================================= */
            /* THE CLEAN, UNCLUTTERED ONBOARDING FORM */
            /* ========================================================================= */
            <motion.div
              className="bg-[#FAF6F0] border-2 border-[#E4D5C3] rounded-3xl p-5 sm:p-8 shadow-2xl relative"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              
              {/* Form Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E4D5C3]">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-[#4F6815] text-[#FFFBEA] flex items-center justify-center font-bold text-xl">
                    👩‍🍳
                  </div>
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-black text-[#4F6815]">
                      {t.formTitle}
                    </h2>
                    <p className="text-xs text-[#6E5C52]">
                      {t.formSubtitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEnvelopeOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#EFE4D6] text-[#6E5C52] text-xs font-bold transition border border-[#E4D5C3]"
                >
                  ✕ {t.close}
                </button>
              </div>

              {profile?.verificationStatus === "rejected" && (
                <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-left">
                  <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                    <span>{t.rejectedNoteTitle}</span>
                  </div>
                  <p className="text-sm text-red-950 mt-1 font-semibold italic bg-white p-2.5 rounded-xl border border-red-100">
                    "{profile?.verificationRejectedReason || (lang === "te" ? "దయచేసి మీ FSSAI సర్టిఫికెట్ సరిచూడండి." : "Please verify your FSSAI certificate or documents.")}"
                  </p>
                </div>
              )}

              {/* FORM FIELDS */}
              <form onSubmit={handleProposalSubmit} className="mt-6 space-y-7">
                
                {/* 1. BASIC DETAILS & ADDRESS */}
                <div className="bg-white p-5 rounded-2xl border border-[#E4D5C3] space-y-4">
                  <div className="flex items-center gap-2 text-[#4F6815] font-serif font-bold text-base pb-2 border-b border-[#E4D5C3]/60">
                    <span className="text-lg">👤</span>
                    <span>{t.sec1Title}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#4F6815] mb-1">
                        {t.kitchenNameLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={t.kitchenNamePlaceholder}
                        value={onboardForm.name}
                        onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                        required
                        className="w-full bg-[#FAF6F0] border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#4F6815] focus:bg-white"
                      />
                      <span className="text-[11px] text-[#6E5C52] mt-0.5 block">{t.kitchenNameHint}</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4F6815] mb-1">
                        {t.chefNameLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={t.fullNamePlaceholder}
                        value={onboardForm.nameOnId}
                        onChange={(e) => setOnboardForm({ ...onboardForm, nameOnId: e.target.value })}
                        required
                        className="w-full bg-[#FAF6F0] border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#4F6815] focus:bg-white"
                      />
                      <span className="text-[11px] text-[#6E5C52] mt-0.5 block">{t.chefNameHint}</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4F6815] mb-1">
                        {t.emailLabel}
                      </label>
                      <input
                        type="email"
                        placeholder={t.emailPlaceholder}
                        value={onboardForm.ownerEmail}
                        onChange={(e) => setOnboardForm({ ...onboardForm, ownerEmail: e.target.value })}
                        required
                        className="w-full bg-[#FAF6F0] border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#4F6815] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#75070C] mb-1">
                        {t.phoneLabel}
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="e.g. 9876543210"
                        value={onboardForm.phone}
                        onChange={(e) => {
                          const numericOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setOnboardForm({ ...onboardForm, phone: numericOnly });
                        }}
                        required
                        className="w-full bg-[#FAF6F0] border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#23120B] focus:border-[#75070C] focus:bg-white tracking-wide"
                      />
                      <span className="text-[11px] text-[#6E5C52] mt-0.5 block">{t.phoneHint}</span>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-[#4F6815] mb-1">
                        {t.addressLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={t.addressPlaceholder}
                        value={onboardForm.addressText}
                        onChange={(e) => setOnboardForm({ ...onboardForm, addressText: e.target.value })}
                        className="w-full bg-[#FAF6F0] border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#4F6815] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4F6815] mb-1">
                        {t.pincodeLabel}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="e.g. 626126"
                        value={onboardForm.pincode}
                        onChange={(e) => setOnboardForm({ ...onboardForm, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                        required
                        className="w-full bg-[#FAF6F0] border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#23120B] focus:border-[#4F6815] focus:bg-white"
                      />
                      <span className="text-[11px] text-[#6E5C52] mt-0.5 block">{t.pincodeHint}</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4F6815] mb-1">
                        {t.bioLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={t.bioPlaceholder}
                        value={onboardForm.description}
                        onChange={(e) => setOnboardForm({ ...onboardForm, description: e.target.value })}
                        className="w-full bg-[#FAF6F0] border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#4F6815] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. FSSAI FOOD SAFETY */}
                <div className="bg-white p-5 rounded-2xl border border-[#E4D5C3] space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E4D5C3]/60">
                    <div className="flex items-center gap-2 text-[#4F6815] font-serif font-bold text-base">
                      <span className="text-lg">📜</span>
                      <span>{t.sec2Title}</span>
                    </div>
                  </div>

                  {/* Help banner explaining FSSAI to Homemakers */}
                  <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E4D5C3] text-xs text-[#6E5C52] flex items-start gap-2">
                    <span className="text-base text-[#4F6815]">💡</span>
                    <span>
                      {t.fssaiTip}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#4F6815] mb-1">
                        {t.fssaiNumLabel}
                      </label>
                      <input
                        type="text"
                        maxLength={14}
                        placeholder="e.g. 10020011000123"
                        value={onboardForm.fssaiLicenseNumber}
                        onChange={(e) => setOnboardForm({ ...onboardForm, fssaiLicenseNumber: e.target.value.replace(/\D/g, "").slice(0, 14) })}
                        required
                        className="w-full bg-[#FAF6F0] border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold text-[#23120B] focus:border-[#4F6815] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4F6815] mb-1">
                        {t.fssaiNameLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={t.kitchenNamePlaceholder}
                        value={onboardForm.fssaiBusinessName}
                        onChange={(e) => setOnboardForm({ ...onboardForm, fssaiBusinessName: e.target.value })}
                        className="w-full bg-[#FAF6F0] border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#4F6815] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4F6815] mb-1">
                        {t.fssaiExpiryLabel}
                      </label>
                      <input
                        type="date"
                        value={onboardForm.fssaiExpiryDate}
                        onChange={(e) => setOnboardForm({ ...onboardForm, fssaiExpiryDate: e.target.value })}
                        required
                        className="w-full bg-[#FAF6F0] border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#4F6815] focus:bg-white"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-[#75070C] mb-1">
                        {t.fssaiUploadLabel}
                      </label>
                      <div className="border-2 border-dashed border-[#E4D5C3] bg-[#FAF6F0] rounded-2xl p-4 text-center hover:border-[#4F6815] transition">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => setFssaiFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-[#6E5C52] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#4F6815] file:text-[#FFFBEA] hover:file:bg-[#3E5210]"
                        />
                        <p className="text-[11px] text-[#6E5C52] mt-1.5">
                          {fssaiFile
                            ? `Selected file: ${fssaiFile.name}`
                            : profile?.documents?.fssaiCertificate?.originalName
                            ? `Current file: ${profile.documents.fssaiCertificate.originalName}`
                            : t.fssaiUploadHint}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. GOVERNMENT IDENTITY PROOF */}
                <div className="bg-white p-5 rounded-2xl border border-[#E4D5C3] space-y-4">
                  <div className="flex items-center gap-2 text-[#4F6815] font-serif font-bold text-base pb-2 border-b border-[#E4D5C3]/60">
                    <span className="text-lg">🪪</span>
                    <span>{t.sec3Title}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#4F6815] mb-1">
                        {t.idTypeLabel}
                      </label>
                      <select
                        value={onboardForm.governmentIdType}
                        onChange={(e) => setOnboardForm({ ...onboardForm, governmentIdType: e.target.value })}
                        className="w-full bg-[#FAF6F0] border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#4F6815] focus:bg-white"
                      >
                        <option value="Aadhaar">Aadhaar Card</option>
                        <option value="PAN">PAN Card</option>
                        <option value="Voter ID">Voter ID</option>
                        <option value="Passport">Passport</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4F6815] mb-1">
                        {t.nameOnIdLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={t.fullNamePlaceholder}
                        value={onboardForm.nameOnId}
                        onChange={(e) => setOnboardForm({ ...onboardForm, nameOnId: e.target.value })}
                        required
                        className="w-full bg-[#FAF6F0] border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B] focus:border-[#4F6815] focus:bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#75070C] mb-1">
                        {t.idUploadLabel}
                      </label>
                      <div className="border-2 border-dashed border-[#E4D5C3] bg-[#FAF6F0] rounded-2xl p-4 text-center hover:border-[#4F6815] transition">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => setGovIdFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-[#6E5C52] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#4F6815] file:text-[#FFFBEA] hover:file:bg-[#3E5210]"
                        />
                        <p className="text-[11px] text-[#6E5C52] mt-1.5">
                          {govIdFile
                            ? `Selected file: ${govIdFile.name}`
                            : profile?.documents?.governmentId?.originalName
                            ? `Current file: ${profile.documents.governmentId.originalName}`
                            : t.idUploadHint}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. KITCHEN PHOTOS */}
                <div className="bg-white p-5 rounded-2xl border border-[#E4D5C3] space-y-4">
                  <div className="flex items-center gap-2 text-[#4F6815] font-serif font-bold text-base pb-2 border-b border-[#E4D5C3]/60">
                    <span className="text-lg">📸</span>
                    <span>{t.sec4Title}</span>
                  </div>

                  <p className="text-xs text-[#6E5C52]">
                    {t.photosHint}
                  </p>

                  <div className="border-2 border-dashed border-[#E4D5C3] bg-[#FAF6F0] rounded-2xl p-4 text-center hover:border-[#4F6815] transition">
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
                        : (lang === "te" ? "మీ మొబైల్ కెమెరాతో తీసిన స్పష్టమైన ఫోటోలను అప్‌లోడ్ చేయండి" : "Upload photos taken from your phone camera")}
                    </p>
                  </div>
                </div>

                {/* Submit Action Buttons */}
                <div className="pt-4 border-t border-[#E4D5C3] flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEnvelopeOpen(false)}
                    className="px-5 py-3 rounded-xl border border-[#E4D5C3] bg-white text-xs font-bold text-[#6E5C52] hover:bg-[#EFE4D6] transition"
                  >
                    ✕ {t.close}
                  </button>

                  <button
                    type="submit"
                    disabled={onboardSaving}
                    className="flex-1 bg-[#4F6815] hover:bg-[#3E5210] text-[#FFFBEA] text-sm font-bold py-4 px-8 rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
                  >
                    {onboardSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t.btnSubmitting}</span>
                      </>
                    ) : (
                      <>
                        <span>{t.btnSubmitApplication}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

            </motion.div>
          )}

        </div>

        {/* Clean Footer */}
        <footer className="max-w-5xl mx-auto w-full text-center text-xs text-[#6E5C52] pt-4 border-t border-[#E4D5C3]/80">
          © {new Date().getFullYear()} CraveCart • {t.homeChefSubtitle}
        </footer>

      </div>
    );
  }

  // =========================================================================
  // VIEW 2: UNLOCKED HOME CHEF DASHBOARD (WITH BEAUTIFUL SIDE NAVBAR)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F0E6DA] text-[#23120B] antialiased flex flex-col md:flex-row">
      
      {/* ===================================================================== */}
      {/* 1. DESKTOP SIDE NAVBAR (Left fixed full-height) */}
      {/* ===================================================================== */}
      <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-[#FAF6F0] border-r border-[#E4D5C3] z-30 shadow-sm">
        
        {/* Brand & Chef Profile Card */}
        <div className="p-5 border-b border-[#E4D5C3] bg-gradient-to-b from-white/60 to-transparent">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-2xl bg-[#4F6815] text-[#FFFBEA] flex items-center justify-center font-serif text-xl font-bold shadow-xs group-hover:scale-105 transition">
              👩‍🍳
            </div>
            <div>
              <span className="font-serif text-xl font-black text-[#4F6815] tracking-tight block leading-tight">
                CraveCart
              </span>
              <span className="text-[10px] font-bold text-[#6E5C52] tracking-wider uppercase block">
                {t.homeChefPortal}
              </span>
            </div>
          </Link>

          {/* Kitchen Identity Card */}
          <div className="mt-4 p-3.5 rounded-2xl bg-[#EFE4D6]/70 border border-[#E4D5C3] flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#4F6815] text-[#FFFBEA] flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-xs">
              {(profile?.name || "K").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-base font-black text-[#23120B] truncate leading-tight">
                {profile?.name}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-[9px] font-bold bg-[#4F6815] text-[#FFFBEA] px-2 py-0.5 rounded-md leading-none">
                  {t.verifiedKitchen || "✓ Verified"}
                </span>
                {profile?.pincode && (
                  <span className="text-[10px] font-semibold text-[#6E5C52]">
                    PIN: {profile.pincode}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Tab Navigation List */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto" aria-label="Kitchen Navigation">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#6E5C52] px-3 py-1">
            {lang === "te" ? "ముఖ్య విభాగాలు" : "Dashboard Sections"}
          </div>

          <button
            type="button"
            onClick={() => { setActiveTab("orders"); setEditingMealType(null); }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === "orders"
                ? "bg-[#4F6815] text-[#FFFBEA] shadow-xs"
                : "text-[#23120B] hover:bg-[#EFE4D6] hover:text-[#4F6815]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">📦</span>
              <span>{t.tabOrders}</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === "orders"
                  ? "bg-white/20 text-white"
                  : "bg-[#4F6815]/10 text-[#4F6815]"
              }`}
            >
              {todayOrderCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("menu"); setEditingMealType(null); }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === "menu"
                ? "bg-[#4F6815] text-[#FFFBEA] shadow-xs"
                : "text-[#23120B] hover:bg-[#EFE4D6] hover:text-[#4F6815]"
            }`}
          >
            <span className="text-lg">🍲</span>
            <span>{t.tabMenu}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("compliance"); setEditingMealType(null); }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === "compliance"
                ? "bg-[#4F6815] text-[#FFFBEA] shadow-xs"
                : "text-[#23120B] hover:bg-[#EFE4D6] hover:text-[#4F6815]"
            }`}
          >
            <span className="text-lg">📋</span>
            <span>{t.tabCompliance}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("settings"); setEditingMealType(null); }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#4F6815] text-[#FFFBEA] shadow-xs"
                : "text-[#23120B] hover:bg-[#EFE4D6] hover:text-[#4F6815]"
            }`}
          >
            <span className="text-lg">⚙️</span>
            <span>{t.tabSettings}</span>
          </button>
        </nav>

        {/* Sidebar Footer: Language, Customer Store Link, Sign Out */}
        <div className="p-4 border-t border-[#E4D5C3] space-y-2.5 bg-[#FAF6F0]">
          
          {/* Language Selector in Sidebar */}
          <div className="bg-[#EFE4D6] p-1.5 rounded-2xl border border-[#E4D5C3] flex items-center justify-between">
            <span className="text-xs px-2 text-[#4F6815] flex items-center gap-1 font-bold">
              <FiGlobe />
              <span className="text-[11px] text-[#6E5C52]">{lang === "te" ? "భాష:" : "Lang:"}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleLangToggle("en")}
                className={`px-2.5 py-1 text-xs font-bold rounded-xl transition cursor-pointer ${
                  lang === "en"
                    ? "bg-[#4F6815] text-[#FFFBEA] shadow-xs"
                    : "text-[#6E5C52] hover:text-[#23120B]"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => handleLangToggle("te")}
                className={`px-2.5 py-1 text-xs font-bold rounded-xl transition cursor-pointer ${
                  lang === "te"
                    ? "bg-[#4F6815] text-[#FFFBEA] shadow-xs"
                    : "text-[#6E5C52] hover:text-[#23120B]"
                }`}
              >
                తెలుగు
              </button>
            </div>
          </div>

          {/* Quick link to Customer Store */}
          <Link
            to="/"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white border border-[#E4D5C3] hover:border-[#4F6815] text-xs font-bold text-[#6E5C52] hover:text-[#4F6815] transition shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <FiShoppingBag className="text-[#4F6815]" />
              <span>{t.marketplace}</span>
            </div>
            <span className="text-[10px] text-[#4F6815] font-semibold">{lang === "te" ? "చూడండి →" : "View →"}</span>
          </Link>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <FiLogOut className="text-sm" />
            <span>{t.signOut}</span>
          </button>

        </div>
      </aside>

      {/* ===================================================================== */}
      {/* 2. MOBILE HEADER & DRAWER */}
      {/* ===================================================================== */}
      <div className="md:hidden bg-[#FAF6F0] border-b border-[#E4D5C3] sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-[#4F6815] text-[#FFFBEA] flex items-center justify-center font-serif text-lg font-bold">
            👩‍🍳
          </div>
          <div>
            <h1 className="font-serif text-sm font-black text-[#4F6815] leading-none">
              {profile?.name || "Kitchen"}
            </h1>
            <span className="text-[9px] text-[#6E5C52] font-semibold">
              PIN: {profile?.pincode}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <button
            type="button"
            onClick={() => handleLangToggle(lang === "en" ? "te" : "en")}
            className="px-2.5 py-1 bg-white border border-[#E4D5C3] rounded-xl text-xs font-bold text-[#4F6815]"
          >
            {lang === "en" ? "తెలుగు" : "English"}
          </button>

          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="p-2 bg-[#EFE4D6] border border-[#E4D5C3] rounded-xl text-[#4F6815]"
            aria-label="Open Navigation Menu"
          >
            <FiMenu className="text-lg" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#FAF6F0] border-r border-[#E4D5C3] z-50 flex flex-col shadow-2xl md:hidden"
            >
              <div className="p-4 border-b border-[#E4D5C3] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">👩‍🍳</span>
                  <span className="font-serif font-black text-[#4F6815]">CraveCart</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1.5 rounded-xl text-[#6E5C52] hover:bg-white"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              <div className="p-4 border-b border-[#E4D5C3] bg-[#EFE4D6]/50">
                <p className="font-serif text-sm font-bold text-[#23120B]">{profile?.name}</p>
                <p className="text-[10px] text-[#4F6815] font-bold mt-0.5">{t.verifiedKitchen}</p>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => { setActiveTab("orders"); setEditingMealType(null); setMobileNavOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold ${
                    activeTab === "orders" ? "bg-[#4F6815] text-[#FFFBEA]" : "text-[#23120B] hover:bg-[#EFE4D6]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span>📦</span>
                    <span>{t.tabOrders}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20">{todayOrderCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("menu"); setEditingMealType(null); setMobileNavOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-bold ${
                    activeTab === "menu" ? "bg-[#4F6815] text-[#FFFBEA]" : "text-[#23120B] hover:bg-[#EFE4D6]"
                  }`}
                >
                  <span>🍲</span>
                  <span>{t.tabMenu}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("compliance"); setEditingMealType(null); setMobileNavOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-bold ${
                    activeTab === "compliance" ? "bg-[#4F6815] text-[#FFFBEA]" : "text-[#23120B] hover:bg-[#EFE4D6]"
                  }`}
                >
                  <span>📋</span>
                  <span>{t.tabCompliance}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("settings"); setEditingMealType(null); setMobileNavOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-bold ${
                    activeTab === "settings" ? "bg-[#4F6815] text-[#FFFBEA]" : "text-[#23120B] hover:bg-[#EFE4D6]"
                  }`}
                >
                  <span>⚙️</span>
                  <span>{t.tabSettings}</span>
                </button>
              </nav>

              <div className="p-4 border-t border-[#E4D5C3] space-y-2 bg-[#FAF6F0]">
                <Link
                  to="/"
                  onClick={() => setMobileNavOpen(false)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white border border-[#E4D5C3] text-xs font-bold text-[#6E5C52]"
                >
                  <span>{t.marketplace}</span>
                  <span className="text-[#4F6815]">→</span>
                </Link>

                <button
                  type="button"
                  onClick={() => { setMobileNavOpen(false); handleLogout(); }}
                  className="w-full py-2.5 px-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <FiLogOut />
                  <span>{t.signOut}</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 3. MAIN DASHBOARD CONTENT AREA (Positioned to the right of sidebar) */}
      {/* ===================================================================== */}
      <div className="flex-1 md:pl-72 flex flex-col min-w-0">
        
        {/* Top Notification Status Bar */}
        <div className="bg-[#4F6815] text-[#FFFBEA] px-4 sm:px-6 py-2.5 border-b border-[#3E5210] flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2 truncate">
            <span>👩‍🍳</span>
            <span className="font-semibold truncate">
              {t.welcomeChef} {profile?.name || ""} • {t.kitchenLiveBadge}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCheckApproval}
            disabled={refreshingStatus}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition shrink-0 ml-3 cursor-pointer"
            title="Refresh status"
          >
            <FiRefreshCw className={`h-3 w-3 ${refreshingStatus ? "animate-spin" : ""}`} />
            <span>{refreshingStatus ? t.checkingStatus : t.refreshStatus}</span>
          </button>
        </div>

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-0">
        
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-2xs">
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} className="font-bold ml-2">✕</button>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-900 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-2xs">
            <span>✓ {message}</span>
            <button onClick={() => setMessage("")} className="font-bold ml-2">✕</button>
          </div>
        )}

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5C52]">{t.statTodayOrders}</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-serif text-3xl font-extrabold text-[#4F6815]">{todayOrderCount}</span>
              <span className="text-xs font-bold text-[#4F6815] bg-[#4F6815]/10 px-2 py-0.5 rounded-md">{acceptedOrderCount} {t.statAcceptedBadge}</span>
            </div>
            <p className="text-[11px] text-[#6E5C52] mt-1">{ordersDate} {t.statPreordersFor}</p>
          </div>

          <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F6815]">{t.statCapacity}</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-serif text-3xl font-extrabold text-[#23120B]">{dailyOrderLimit} <span className="text-xs font-normal text-[#6E5C52]">{t.statPlates}</span></span>
              <span className="text-xs text-[#6E5C52]">{Math.max(0, dailyOrderLimit - todayOrderCount)} {t.statRemaining}</span>
            </div>
            <p className="text-[11px] text-[#6E5C52] mt-1">{t.statCapacityDesc}</p>
          </div>

          <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#75070C]">{t.statEarnings}</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-serif text-3xl font-extrabold text-[#75070C]">₹{totalRevenue}</span>
              <span className="text-xs text-[#4F6815] font-bold">{t.statDirect}</span>
            </div>
            <p className="text-[11px] text-[#6E5C52] mt-1">{t.statEarningsDesc}</p>
          </div>

          <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5C52]">{t.statStatus}</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-serif text-lg font-bold text-[#4F6815]">
                {t.statApproved}
              </span>
              <span className="text-xs font-semibold text-[#4F6815]">
                PIN {profile?.pincode}
              </span>
            </div>
            <p className="text-[11px] text-[#6E5C52] mt-1">
              {t.statDiscoverable}
            </p>
          </div>

        </div>

        {/* TAB 1: CUSTOMER ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-5">
            
            <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#4F6815] uppercase tracking-wide">{t.ordersSectionTag}</span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#23120B] mt-0.5">
                  {t.ordersSectionTitle}
                </h2>
                <p className="text-xs text-[#6E5C52] mt-0.5">
                  {t.ordersSectionSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <label className="text-xs font-bold text-[#4F6815] uppercase">
                  {t.orderDateLabel}
                </label>
                <input
                  type="date"
                  value={ordersDate}
                  onChange={(e) => setOrdersDate(e.target.value)}
                  className="bg-white border border-[#E4D5C3] text-xs font-bold px-3 py-2 rounded-xl text-[#23120B] focus:border-[#4F6815]"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "all", label: t.filterAll },
                { id: "prebooked", label: t.filterPending },
                { id: "accepted", label: t.filterAccepted },
                { id: "rejected", label: t.filterDeclined },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderFilter(tab.id)}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl transition ${
                    orderFilter === tab.id
                      ? "bg-[#4F6815] text-[#FFFBEA] shadow-xs"
                      : "bg-white text-[#23120B] border border-[#E4D5C3] hover:border-[#4F6815]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-10 text-center">
                <span className="text-4xl">🍲</span>
                <h3 className="font-serif text-xl font-bold text-[#23120B] mt-2">
                  {t.noOrdersTitle} {ordersDate}
                </h3>
                <p className="text-xs text-[#6E5C52] mt-1 max-w-sm mx-auto">
                  {t.noOrdersDesc}
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
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#4F6815]/10 text-[#4F6815] px-2 py-0.5 rounded-md">
                              {order.mealType?.toUpperCase() || "MEAL"}
                            </span>
                            <h3 className="font-serif text-lg font-bold text-[#23120B] mt-1">
                              {order.mealId?.title || `${order.mealType} Special`}
                            </h3>
                          </div>

                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                              isAccepted
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : isRejected
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {isPrebooked ? t.needsAcceptanceBadge : order.status}
                          </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#E4D5C3]/60 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[#6E5C52] text-[11px] block">{t.customerNameLabel}</span>
                            <p className="font-bold text-[#23120B] truncate">
                              {order.userId?.name || "Customer"}
                            </p>
                            <p className="text-[#6E5C52] text-[11px] truncate">
                              {order.userId?.email || ""}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[#6E5C52] text-[11px] block">{t.qtyTotalLabel}</span>
                            <p className="font-bold text-[#75070C] text-sm">
                              {order.qty} {t.platesCount} • ₹{(order.mealId?.price || 0) * (order.qty || 1)}
                            </p>
                            <span className="text-[10px] text-[#4F6815] font-semibold">
                              {t.paidVia} {order.paymentMethod || "UPI"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-[#E4D5C3]/60 flex items-center justify-between gap-3">
                        <span className="text-[11px] text-[#6E5C52]">
                          {t.orderIdLabel} #{order._id.slice(-5).toUpperCase()}
                        </span>

                        {isPrebooked ? (
                          <div className="flex items-center gap-2">
                            <button
                              disabled={actionLoadingId === order._id}
                              onClick={() => handleOrderDecision(order._id, "reject")}
                              className="px-3 py-1.5 rounded-xl border border-red-300 text-red-700 text-xs font-bold hover:bg-red-50 transition"
                            >
                              {t.btnDecline}
                            </button>
                            <button
                              disabled={actionLoadingId === order._id}
                              onClick={() => handleOrderDecision(order._id, "accept")}
                              className="px-4 py-1.5 rounded-xl bg-[#4F6815] hover:bg-[#3E5210] text-[#FFFBEA] text-xs font-bold transition shadow-xs"
                            >
                              {actionLoadingId === order._id ? t.loading : t.btnAcceptOrder}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-[#4F6815]">
                            {isAccepted ? t.acceptedNotice : t.filterDeclined}
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

        {/* TAB 2: TODAY'S MENU & DISHES */}
        {activeTab === "menu" && (
          <div className="space-y-5">
            
            {/* Header & Date Picker */}
            <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#4F6815] uppercase tracking-wide">{t.menuSectionTag}</span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#23120B] mt-0.5">
                  {t.menuSectionTitle}
                </h2>
                <p className="text-xs text-[#6E5C52] mt-0.5">
                  {t.menuSectionSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <label className="text-xs font-bold text-[#4F6815] uppercase">
                  {t.menuDateLabel}
                </label>
                <input
                  type="date"
                  value={menuDate}
                  onChange={(e) => {
                    setMenuDate(e.target.value);
                    setEditingMealType(null);
                  }}
                  className="bg-white border border-[#E4D5C3] text-xs font-bold px-3 py-2 rounded-xl text-[#23120B] focus:border-[#4F6815]"
                />
              </div>
            </div>

            {/* Simple Step-by-Step Guide for Homemakers */}
            <div className="bg-white p-4 rounded-2xl border border-[#E4D5C3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#6E5C52]">
              <div className="flex items-center gap-2">
                <span className="text-lg text-[#4F6815]">💡</span>
                <span>{t.menuTip}</span>
              </div>
            </div>

            {/* Dish Add/Edit Modal/Form */}
            {editingMealType && (
              <form
                onSubmit={saveMeal}
                className="bg-[#FAF6F0] border-2 border-[#4F6815] rounded-3xl p-5 sm:p-7 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E4D5C3]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">
                      {mealTypes.find((m) => m.key === editingMealType)?.icon}
                    </span>
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#4F6815]">
                        {editingMealId ? `${t.editDishModalTitle} ${editingMealType.toUpperCase()}` : `${t.addDishModalTitle} ${editingMealType.toUpperCase()}`}
                      </h3>
                      <p className="text-xs text-[#6E5C52]">{t.servingOn} {menuDate}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMealType(null);
                      setEditingMealId(null);
                    }}
                    className="text-xs font-bold text-[#6E5C52] hover:text-[#75070C] px-2 py-1"
                  >
                    ✕ {t.cancel}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4F6815] mb-1">
                      {t.dishNameLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={t.dishNamePlaceholder}
                      value={mealForm.title}
                      onChange={(e) => setMealForm({ ...mealForm, title: e.target.value })}
                      required
                      className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#23120B] focus:border-[#4F6815]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4F6815] mb-1">
                      {t.dishPhotoLabel}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Image URL or upload file..."
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
                        className="bg-white border border-[#E4D5C3] text-xs font-bold px-3 py-2 rounded-xl hover:bg-[#FAF6F0] text-[#4F6815] transition"
                      >
                        {uploadingImage ? "..." : t.btnUploadPhoto}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6E5C52] mb-1">
                    {t.dishDescLabel}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={t.dishDescPlaceholder}
                    value={mealForm.description}
                    onChange={(e) => setMealForm({ ...mealForm, description: e.target.value })}
                    className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2 rounded-xl text-xs text-[#23120B] focus:border-[#4F6815]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#75070C] mb-1">
                      {t.pricePerPlateLabel}
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 60"
                      value={mealForm.price}
                      onChange={(e) => setMealForm({ ...mealForm, price: e.target.value })}
                      required
                      className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#75070C] focus:border-[#75070C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4F6815] mb-1">
                      {t.howManyPlatesLabel}
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 20"
                      value={mealForm.totalQty}
                      onChange={(e) => setMealForm({ ...mealForm, totalQty: e.target.value })}
                      required
                      className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#4F6815] focus:border-[#4F6815]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-[#23120B]">
                      <input
                        type="checkbox"
                        checked={mealForm.isAvailable}
                        onChange={(e) => setMealForm({ ...mealForm, isAvailable: e.target.checked })}
                        className="h-4 w-4 accent-[#4F6815]"
                      />
                      <span>{t.activeCheckbox}</span>
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
                    className="px-4 py-2 rounded-xl border border-[#E4D5C3] bg-white text-xs font-bold text-[#6E5C52]"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={mealSaving}
                    className="bg-[#4F6815] hover:bg-[#3E5210] text-[#FFFBEA] text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-xs"
                  >
                    {mealSaving ? t.btnSavingDish : editingMealId ? t.btnUpdateDish : t.btnSaveDish}
                  </button>
                </div>
              </form>
            )}

            {mealsLoading ? (
              <div className="py-6 text-center flex items-center justify-center gap-2 text-sm text-[#4F6815]">
                <div className="w-5 h-5 border-2 border-[#4F6815] border-t-transparent rounded-full animate-spin" />
                <span>{t.loading}</span>
              </div>
            ) : null}

            {/* 4 MEAL TYPE CARDS (Breakfast, Lunch, Snacks, Dinner) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {mealTypes.map((type) => {
                const categoryDishes = meals.filter((m) => m.mealType === type.key);
                const hasDishes = categoryDishes.length > 0;

                return (
                  <div
                    key={type.key}
                    className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Meal Header */}
                      <div className="p-4 bg-white border-b border-[#E4D5C3] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{type.icon}</span>
                          <div>
                            <span className="font-serif font-bold text-sm text-[#23120B] block">
                              {type.label}
                            </span>
                            <span className="text-[11px] text-[#6E5C52]">{type.timeSlot}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                            hasDishes
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {hasDishes
                            ? `${categoryDishes.length} ${categoryDishes.length === 1 ? t.dishAddedCount : t.dishAddedCountPlural}`
                            : t.noDishesListed}
                        </span>
                      </div>

                      {/* Dishes in this slot */}
                      <div className="p-4 space-y-3">
                        {hasDishes ? (
                          categoryDishes.map((dish, idx) => {
                            const sold = dish.soldQty || 0;
                            const total = dish.totalQty || 0;
                            const remaining = Math.max(0, total - sold);

                            return (
                              <div
                                key={dish._id || idx}
                                className={`flex flex-col sm:flex-row gap-3 items-start justify-between ${
                                  idx > 0 ? "pt-3 border-t border-[#E4D5C3]/70" : ""
                                }`}
                              >
                                <div className="flex gap-3 items-start flex-1 min-w-0">
                                  {dish.imageUrl ? (
                                    <img
                                      src={resolveUploadUrl(dish.imageUrl)}
                                      alt={dish.title}
                                      className="h-14 w-14 rounded-xl object-cover border border-[#E4D5C3] shrink-0"
                                    />
                                  ) : (
                                    <div className="h-14 w-14 rounded-xl bg-white border border-[#E4D5C3] flex items-center justify-center text-xl shrink-0">
                                      🍲
                                    </div>
                                  )}

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-serif text-sm font-bold text-[#23120B] truncate">
                                        {dish.title}
                                      </h4>
                                      <span
                                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                                          dish.isAvailable !== false
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-700"
                                        }`}
                                      >
                                        {dish.isAvailable !== false ? t.activeBadge : t.pausedBadge}
                                      </span>
                                    </div>

                                    {dish.description && (
                                      <p className="text-xs text-[#6E5C52] mt-0.5 line-clamp-1">
                                        {dish.description}
                                      </p>
                                    )}

                                    <div className="mt-1 flex items-center gap-3 text-xs">
                                      <span className="font-serif font-extrabold text-[#75070C]">
                                        ₹{dish.price} / {t.platesCount.replace("(s)", "")}
                                      </span>
                                      <span className="text-[11px] text-[#4F6815] font-semibold">
                                        {remaining} {t.platesLeft} ({sold} {t.platesOrdered})
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => openMealEditor(type.key, dish)}
                                    className="px-3 py-1.5 rounded-xl border border-[#4F6815] bg-white text-[#4F6815] text-xs font-bold hover:bg-[#4F6815] hover:text-white transition flex items-center gap-1"
                                  >
                                    <span>✏️ {t.edit}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDish(dish._id, dish.title)}
                                    className="p-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-700 text-xs transition"
                                    title={t.delete}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-4 text-xs text-[#6E5C52]">
                            <p>{t.noDishesListed}</p>
                            <p className="text-[11px] text-[#4F6815] mt-0.5">e.g. {type.tip}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Add Button */}
                    <div className="p-3 bg-white border-t border-[#E4D5C3] flex justify-end">
                      <button
                        type="button"
                        onClick={() => openMealEditor(type.key, null)}
                        className="bg-[#4F6815] hover:bg-[#3E5210] text-[#FFFBEA] text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
                      >
                        <span>+ {t.btnAddDish}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 3: FOOD SAFETY & LICENSE */}
        {activeTab === "compliance" && (
          <div className="space-y-5">
            <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-8 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F6815]">{t.complianceSectionTag}</span>
              <h2 className="font-serif text-2xl font-bold text-[#23120B] mt-1">
                {t.complianceSectionTitle}
              </h2>
              <p className="text-xs text-[#6E5C52] mt-0.5">
                {t.complianceSectionSubtitle}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mt-6 text-xs">
                <div className="bg-white p-5 rounded-2xl border border-[#E4D5C3]">
                  <span className="text-[#6E5C52] block font-semibold">{t.fssaiCardTitle}</span>
                  <p className="font-mono font-bold text-base text-[#23120B] mt-1">{profile?.fssai?.licenseNumber || "Recorded"}</p>
                  <p className="text-[11px] text-[#4F6815] mt-1 font-semibold">{t.fssaiVerifiedBadge}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E4D5C3]">
                  <span className="text-[#6E5C52] block font-semibold">{t.idCardTitle}</span>
                  <p className="font-bold text-base text-[#23120B] mt-1">{profile?.documents?.governmentId?.idType || "Aadhaar"} ({profile?.documents?.governmentId?.nameOnId || profile?.ownerName})</p>
                  <p className="text-[11px] text-[#4F6815] mt-1 font-semibold">{t.idVerifiedBadge}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: KITCHEN SETTINGS */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Daily Order Capacity */}
            <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-8 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F6815]">{t.capacitySectionTag}</span>
              <h2 className="font-serif text-2xl font-bold text-[#23120B] mt-1">
                {t.capacitySectionTitle}
              </h2>
              <p className="text-xs text-[#6E5C52] mt-1 leading-relaxed">
                {t.capacitySectionSubtitle}
              </p>

              <div className="mt-6">
                <label className="block text-xs font-bold text-[#4F6815] mb-1.5">
                  {t.maxPlatesPerDayLabel}
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min={1}
                    value={dailyOrderLimit}
                    onChange={(e) => setDailyOrderLimit(e.target.value)}
                    className="flex-1 bg-white border border-[#E4D5C3] px-4 py-2.5 rounded-xl font-bold text-lg text-[#4F6815]"
                  />
                  <button
                    onClick={saveLimit}
                    disabled={limitSaving}
                    className="bg-[#4F6815] hover:bg-[#3E5210] text-[#FFFBEA] text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-xs"
                  >
                    {limitSaving ? t.btnSavingDish : t.btnSaveLimit}
                  </button>
                </div>
              </div>
            </div>

            {/* Address & Delivery Pincode */}
            <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-8 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F6815]">{t.locationSectionTag}</span>
              <h2 className="font-serif text-2xl font-bold text-[#23120B] mt-1">
                {t.locationSectionTitle}
              </h2>
              <p className="text-xs text-[#6E5C52] mt-1 leading-relaxed">
                {t.locationSectionSubtitle}
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4F6815] mb-1">
                    {t.deliveryPincodeLabel}
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    placeholder="e.g. 626126"
                    maxLength={6}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#23120B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4F6815] mb-1">
                    {t.kitchenAddressLabel}
                  </label>
                  <input
                    type="text"
                    value={addressText}
                    placeholder="e.g. Flat 302, Green Valley Apartments"
                    onChange={(e) => setAddressText(e.target.value)}
                    className="w-full bg-white border border-[#E4D5C3] px-3.5 py-2.5 rounded-xl text-sm text-[#23120B]"
                  />
                </div>

                <button
                  onClick={saveLocation}
                  disabled={locationSaving}
                  className="w-full bg-[#4F6815] hover:bg-[#3E5210] text-[#FFFBEA] text-xs font-bold py-3 rounded-xl transition shadow-xs"
                >
                  {locationSaving ? t.btnSavingDish : t.btnSaveLocation}
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      </div>
    </div>
  );
}
