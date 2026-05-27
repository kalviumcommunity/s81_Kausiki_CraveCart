import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, resolveUploadUrl } from "../api";
import VerificationDashboard from "./admin/VerificationDashboard";
import UsersDashboard from "./admin/UsersDashboard";
import KitchensDashboard from "./admin/KitchensDashboard";
import OrdersDashboard from "./admin/OrdersDashboard";
import ComplaintsDashboard from "./admin/ComplaintsDashboard";
import ReviewsDashboard from "./admin/ReviewsDashboard";
import AnnouncementsDashboard from "./admin/AnnouncementsDashboard";
import SubscriptionsDashboard from "./admin/SubscriptionsDashboard";
import SettingsDashboard from "./admin/SettingsDashboard";

const sections = [
  { key: "overview", label: "Overview" },
  { key: "verification", label: "Verification" },
  { key: "users", label: "Users" },
  { key: "kitchens", label: "Kitchens" },
  { key: "orders", label: "Orders" },
  { key: "complaints", label: "Complaints" },
  { key: "reviews", label: "Reviews" },
  { key: "announcements", label: "Announcements" },
  { key: "subscriptions", label: "Subscriptions" },
  { key: "settings", label: "Settings" },
];

const emptyAnnouncement = {
  title: "",
  body: "",
  audience: "all",
  status: "draft",
  publishAt: "",
  priority: "normal",
};

const emptyPlan = {
  planType: "weekly",
  mealsPerDay: 1,
  price: "",
  isActive: true,
};

const toText = (value) => {
  if (value === null || typeof value === "undefined") return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const parseSettingValue = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "";
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("overview");
  const [refreshToken, setRefreshToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [kitchens, setKitchens] = useState([]);
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [settings, setSettings] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  const [selectedKitchen, setSelectedKitchen] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const [userQuery, setUserQuery] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [kitchenQuery, setKitchenQuery] = useState("");
  const [kitchenStatusFilter, setKitchenStatusFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [complaintStatusFilter, setComplaintStatusFilter] = useState("all");
  const [reviewQuery, setReviewQuery] = useState("");

  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncement);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState("");
  const [announcementSaving, setAnnouncementSaving] = useState(false);

  const [planForm, setPlanForm] = useState(emptyPlan);
  const [editingPlanId, setEditingPlanId] = useState("");
  const [planSaving, setPlanSaving] = useState(false);

  const [settingDrafts, setSettingDrafts] = useState({});

  const [actionKey, setActionKey] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const requests = await Promise.allSettled([
        apiFetch("/api/admin/summary"),
        apiFetch("/api/admin/users?limit=300"),
        apiFetch("/api/admin/kitchens?limit=300"),
        apiFetch("/api/admin/orders?limit=200"),
        apiFetch("/api/admin/complaints?limit=200"),
        apiFetch("/api/admin/reviews?limit=200"),
        apiFetch("/api/admin/announcements?limit=100"),
        apiFetch("/api/admin/settings"),
        apiFetch("/api/admin/subscription-plans"),
        apiFetch("/api/admin/subscriptions?limit=200"),
      ]);

      const unwrap = (index, fallback) => (requests[index].status === "fulfilled" ? requests[index].value : fallback);

      const summaryRes = unwrap(0, null);
      const usersRes = unwrap(1, { users: [] });
      const kitchensRes = unwrap(2, { kitchens: [] });
      const ordersRes = unwrap(3, { orders: [] });
      const complaintsRes = unwrap(4, { complaints: [] });
      const reviewsRes = unwrap(5, { reviews: [] });
      const announcementsRes = unwrap(6, { announcements: [] });
      const settingsRes = unwrap(7, { settings: [] });
      const plansRes = unwrap(8, { plans: [] });
      const subscriptionsRes = unwrap(9, { subscriptions: [] });

      setSummary(summaryRes?.summary || null);
      setUsers(usersRes.users || []);
      setKitchens(kitchensRes.kitchens || []);
      setOrders(ordersRes.orders || []);
      setComplaints(complaintsRes.complaints || []);
      setReviews(reviewsRes.reviews || []);
      setAnnouncements(announcementsRes.announcements || []);
      setSettings(settingsRes.settings || []);
      setPlans(plansRes.plans || []);
      setSubscriptions(subscriptionsRes.subscriptions || []);

      const settingMap = {};
      (settingsRes.settings || []).forEach((setting) => {
        settingMap[setting.key] = toText(setting.value);
      });
      setSettingDrafts(settingMap);

      if (selectedKitchen?._id) {
        const updatedKitchen = (kitchensRes.kitchens || []).find((item) => String(item._id) === String(selectedKitchen._id));
        if (updatedKitchen) setSelectedKitchen(updatedKitchen);
      }

      const kitchenFromSelection = (kitchensRes.kitchens || []).find((item) => String(item._id) === String(selectedKitchen?._id));
      if (kitchenFromSelection) {
        setRejectionReason(kitchenFromSelection.verificationRejectedReason || "");
      }
    } catch (err) {
      setError(err.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const reload = () => setRefreshToken((value) => value + 1);

  const loadKitchenDetail = async (id) => {
    setDetailLoading(true);
    setDetailError("");
    setDecisionError("");
    try {
      const res = await apiFetch(`/api/admin/kitchens/${id}`);
      const kitchen = res.kitchen || null;
      setSelectedKitchen(kitchen);
      setRejectionReason(kitchen?.verificationRejectedReason || "");
    } catch (err) {
      setDetailError(err.message || "Failed to load kitchen details");
      setSelectedKitchen(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const saveKitchenDecision = async (decision) => {
    if (!selectedKitchen) return;

    setDecisionLoading(true);
    setDecisionError("");
    try {
      if (decision === "rejected" && !rejectionReason.trim()) {
        setDecisionError("Please enter a rejection reason before rejecting.");
        return;
      }

      const res = await apiFetch(`/api/admin/kitchens/${selectedKitchen._id}/decision`, {
        method: "PATCH",
        body: JSON.stringify({
          decision,
          reason: decision === "rejected" ? rejectionReason.trim() : undefined,
        }),
      });

      setSelectedKitchen(res.kitchen || null);
      setRejectionReason(res.kitchen?.verificationRejectedReason || "");
      reload();
    } catch (err) {
      setDecisionError(err.message || "Failed to update status");
    } finally {
      setDecisionLoading(false);
    }
  };

  const changeUserActivation = async (userId, isActivated) => {
    setActionKey(`user-${userId}`);
    try {
      await apiFetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActivated }),
      });
      reload();
    } finally {
      setActionKey("");
    }
  };

  const changeKitchenSuspension = async (kitchenId, isActive) => {
    setActionKey(`kitchen-${kitchenId}`);
    setError("");
    try {
      await apiFetch(`/api/admin/kitchens/${kitchenId}/suspend`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
      reload();
    } catch (err) {
      setError(err.message || "Failed to change kitchen active state");
      console.error("changeKitchenSuspension error:", err);
    } finally {
      setActionKey("");
    }
  };

  const changeComplaintStatus = async (complaintId, status) => {
    setActionKey(`complaint-${complaintId}`);
    try {
      await apiFetch(`/api/admin/complaints/${complaintId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      reload();
    } finally {
      setActionKey("");
    }
  };

  const deleteReview = async (reviewId) => {
    setActionKey(`review-${reviewId}`);
    try {
      await apiFetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      reload();
    } finally {
      setActionKey("");
    }
  };

  const saveAnnouncement = async () => {
    setAnnouncementSaving(true);
    try {
      const payload = {
        title: announcementForm.title.trim(),
        body: announcementForm.body.trim(),
        audience: announcementForm.audience,
        status: announcementForm.status,
        publishAt: announcementForm.publishAt || undefined,
        priority: announcementForm.priority,
      };

      if (editingAnnouncementId) {
        await apiFetch(`/api/admin/announcements/${editingAnnouncementId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/admin/announcements", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setAnnouncementForm(emptyAnnouncement);
      setEditingAnnouncementId("");
      reload();
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const editAnnouncement = (announcement) => {
    setEditingAnnouncementId(announcement._id);
    setAnnouncementForm({
      title: announcement.title || "",
      body: announcement.body || "",
      audience: announcement.audience || "all",
      status: announcement.status || "draft",
      publishAt: announcement.publishAt ? String(announcement.publishAt).slice(0, 16) : "",
      priority: announcement.priority || "normal",
    });
    setActiveSection("announcements");
  };

  const savePlan = async () => {
    setPlanSaving(true);
    try {
      const payload = {
        planType: planForm.planType,
        mealsPerDay: Number(planForm.mealsPerDay),
        price: Number(planForm.price),
        isActive: Boolean(planForm.isActive),
      };

      if (editingPlanId) {
        await apiFetch(`/api/admin/subscription-plans/${editingPlanId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/admin/subscription-plans", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setPlanForm(emptyPlan);
      setEditingPlanId("");
      reload();
    } finally {
      setPlanSaving(false);
    }
  };

  const editPlan = (plan) => {
    setEditingPlanId(plan._id);
    setPlanForm({
      planType: plan.planType || "weekly",
      mealsPerDay: plan.mealsPerDay || 1,
      price: plan.price ?? "",
      isActive: plan.isActive !== false,
    });
    setActiveSection("subscriptions");
  };

  const saveSetting = async (key) => {
    setActionKey(`setting-${key}`);
    try {
      await apiFetch(`/api/admin/settings/${encodeURIComponent(key)}`, {
        method: "PUT",
        body: JSON.stringify({ value: parseSettingValue(settingDrafts[key]) }),
      });
      reload();
    } finally {
      setActionKey("");
    }
  };

  const filteredUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase();
    return users.filter((user) => {
      if (userStatusFilter === "active" && !user.isActivated) return false;
      if (userStatusFilter === "inactive" && user.isActivated) return false;
      if (!query) return true;
      return [user.name, user.email, user.role].filter(Boolean).join(" ").toLowerCase().includes(query);
    });
  }, [users, userQuery, userStatusFilter]);

  const filteredKitchens = useMemo(() => {
    const query = kitchenQuery.trim().toLowerCase();
    return kitchens.filter((kitchen) => {
      if (kitchenStatusFilter !== "all" && kitchen.verificationStatus !== kitchenStatusFilter) return false;
      if (!query) return true;
      const haystack = [
        kitchen.name,
        kitchen.description,
        kitchen.addressText,
        kitchen.pincode,
        kitchen.ownerUserId?.name,
        kitchen.ownerUserId?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [kitchens, kitchenQuery, kitchenStatusFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => orderStatusFilter === "all" || order.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => complaintStatusFilter === "all" || complaint.status === complaintStatusFilter);
  }, [complaints, complaintStatusFilter]);

  const filteredReviews = useMemo(() => {
    const query = reviewQuery.trim().toLowerCase();
    return reviews.filter((review) => {
      if (!query) return true;
      const haystack = [review.userId?.name, review.userId?.email, review.kitchenId?.name, review.feedback, review.rating]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [reviews, reviewQuery]);

  const pendingKitchens = useMemo(() => filteredKitchens.filter((kitchen) => kitchen.verificationStatus === "pending"), [filteredKitchens]);
  const activeSubscriptions = useMemo(() => subscriptions.filter((sub) => sub.status === "active"), [subscriptions]);

  return (
    <div className="cc-page-lg">
      <div className="cc-container space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[#DC2626] text-sm uppercase tracking-wide">Admin</p>
            <h1 className="text-3xl font-bold mt-1 text-[#1F2933]">Control Center</h1>
            <p className="cc-muted mt-1">Platform overview, moderation, operations, and configuration.</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="cc-btn-primary px-4 py-2 rounded-xl"
          >
            Back to Home
          </button>
        </div>

        {loading ? (
          <p className="cc-muted">Loading dashboard...</p>
        ) : error ? (
          <div className="cc-alert-error">{error}</div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total users", value: summary?.users?.total ?? users.length },
            { label: "Total kitchens", value: summary?.kitchens?.active ?? kitchens.length },
            { label: "Total orders", value: summary?.orders?.total ?? orders.length },
            { label: "Pending approvals", value: summary?.kitchens?.pending ?? pendingKitchens.length },
          ].map((card) => (
            <div key={card.label} className="cc-card-pad">
              <p className="text-sm font-semibold text-[#F97316]">{card.label}</p>
              <h2 className="text-3xl font-bold mt-2 text-[#1F2933]">{card.value}</h2>
            </div>
          ))}
          <div className="cc-card-pad xl:col-span-4">
            <p className="text-sm font-semibold text-[#F97316]">Subscriptions</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div>
                <p className="cc-muted text-sm">Plans</p>
                <p className="text-xl font-semibold text-[#1F2933]">{plans.length}</p>
              </div>
              <div>
                <p className="cc-muted text-sm">Active subscriptions</p>
                <p className="text-xl font-semibold text-[#1F2933]">{activeSubscriptions.length}</p>
              </div>
              <div>
                <p className="cc-muted text-sm">Open complaints</p>
                <p className="text-xl font-semibold text-[#1F2933]">{summary?.complaints?.open ?? filteredComplaints.filter((item) => item.status === "open").length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
                activeSection === section.key
                  ? "bg-[#F97316] text-[#1F2933] border-[#F97316]/50"
                  : "bg-white/70 text-[#1F2933] border-black/5 hover:bg-white"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {detailLoading ? <div className="cc-card-pad"><p className="cc-muted">Loading kitchen detail...</p></div> : null}
        {detailError ? <div className="cc-card-pad border-[#B91C1C]/25 bg-[#B91C1C]/5 text-[#B91C1C]">{detailError}</div> : null}

        {selectedKitchen && !detailLoading ? (
          <div className="cc-card-pad space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[#F97316] text-sm uppercase tracking-wide">Kitchen Detail</p>
                <h3 className="text-2xl font-semibold text-[#1F2933]">{selectedKitchen.name}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                      selectedKitchen.verificationStatus === "verified"
                        ? "bg-[#15803D]/10 text-[#15803D]"
                        : selectedKitchen.verificationStatus === "rejected"
                          ? "bg-[#B91C1C]/10 text-[#B91C1C]"
                          : "bg-[#F97316]/10 text-[#F97316]"
                    }`}
                  >
                    {selectedKitchen.verificationStatus === "verified"
                      ? "Reviewed: Verified"
                      : selectedKitchen.verificationStatus === "rejected"
                        ? "Reviewed: Rejected"
                        : "Pending review"}
                  </span>
                  <p className="cc-muted">Status: {selectedKitchen.verificationStatus}</p>
                </div>
                <p className="cc-muted">Verified: {selectedKitchen.verified ? "Yes" : "No"}</p>
              </div>
              <button className="text-sm cc-muted hover:text-[#1F2933]" onClick={() => setSelectedKitchen(null)}>
                Close
              </button>
            </div>

            {decisionError ? <div className="cc-alert-error">{decisionError}</div> : null}

            <div className="grid md:grid-cols-2 gap-4 text-sm text-[#1F2933]">
              <div className="space-y-1">
                <p className="font-semibold">Owner</p>
                <p>Name: {selectedKitchen.ownerUserId?.name || "-"}</p>
                <p>Email: {selectedKitchen.ownerUserId?.email || "-"}</p>
                <p>Phone: {selectedKitchen.ownerUserId?.phone || "-"}</p>
                <p>Role: {selectedKitchen.ownerUserId?.role || "-"}</p>
                <p>Joined: {selectedKitchen.ownerUserId?.createdAt ? formatDateTime(selectedKitchen.ownerUserId.createdAt) : "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold">FSSAI</p>
                <p>License: {selectedKitchen.fssai?.licenseNumber || "-"}</p>
                <p>Business: {selectedKitchen.fssai?.businessName || "-"}</p>
                <p>Expiry: {selectedKitchen.fssai?.expiryDate ? new Date(selectedKitchen.fssai.expiryDate).toLocaleDateString() : "-"}</p>
                <p>Status: {selectedKitchen.fssai?.validationStatus || "-"}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-1 gap-4 text-sm text-[#1F2933]">
              <div>
                <p className="font-semibold mb-1">Contact</p>
                <p>
                  Phone: {selectedKitchen.phone || selectedKitchen.contactPhone || selectedKitchen.ownerUserId?.phone ? (
                    <a className="cc-link underline" href={`tel:${selectedKitchen.phone || selectedKitchen.contactPhone || selectedKitchen.ownerUserId?.phone}`}>{selectedKitchen.phone || selectedKitchen.contactPhone || selectedKitchen.ownerUserId?.phone}</a>
                  ) : (
                    "-"
                  )}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm text-[#1F2933]">
              <div>
                <p className="font-semibold mb-1">Documents</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    FSSAI Certificate: {selectedKitchen.documents?.fssaiCertificate?.urlPath ? (
                      <a className="cc-link underline" href={resolveUploadUrl(selectedKitchen.documents.fssaiCertificate.urlPath)} target="_blank" rel="noreferrer">View file</a>
                    ) : "-"}
                  </li>
                  <li>
                    Government ID: {selectedKitchen.documents?.governmentId?.urlPath ? (
                      <a className="cc-link underline" href={resolveUploadUrl(selectedKitchen.documents.governmentId.urlPath)} target="_blank" rel="noreferrer">View file</a>
                    ) : "-"}
                  </li>
                  <li>Kitchen Photos: {(selectedKitchen.documents?.kitchenPhotos || []).length}</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1">Flags</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Verification status: {selectedKitchen.verificationStatus || "-"}</li>
                  <li>Verification reason: {selectedKitchen.verificationRejectedReason || "-"}</li>
                  <li>Pincode status: {selectedKitchen.pincodeVerificationStatus || "-"}</li>
                  <li>Video call: {selectedKitchen.videoCall?.status || "-"}</li>
                  <li>Trial order: {selectedKitchen.premiumVerification?.trialOrderStatus || "-"}</li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white/60 p-4 text-sm text-[#1F2933]">
              <p className="font-semibold mb-2">Review metadata</p>
              <div className="grid gap-1 md:grid-cols-2">
                <p>Reviewed at: {selectedKitchen.verifiedAt ? formatDateTime(selectedKitchen.verifiedAt) : "-"}</p>
                <p>Verified badge: {selectedKitchen.verifiedBadge ? "Enabled" : "Disabled"}</p>
                <p>Rejected reason: {selectedKitchen.verificationRejectedReason || "-"}</p>
                <p>FSSAI validation: {selectedKitchen.fssai?.validationStatus || "-"}</p>
              </div>
            </div>

            {selectedKitchen.verificationStatus === "pending" ? (
              <div className="rounded-2xl border border-black/5 bg-white/60 p-4">
                <p className="text-sm font-semibold text-[#1F2933] mb-3">Review actions</p>
                <div className="grid gap-3 lg:grid-cols-[auto_1fr_auto] lg:items-end">
                  <button
                    disabled={decisionLoading}
                    onClick={() => saveKitchenDecision("verified")}
                    className="cc-btn-primary rounded-lg px-4 py-2 disabled:opacity-60"
                  >
                    {decisionLoading ? "Saving..." : "Mark as Verified"}
                  </button>
                  <div>
                    <label className="block text-sm font-semibold text-[#1F2933] mb-1">Rejection reason</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason before rejecting"
                      rows={2}
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                    />
                  </div>
                  <button
                    disabled={decisionLoading}
                    onClick={() => saveKitchenDecision("rejected")}
                    className="cc-btn-danger rounded-lg px-4 py-2 disabled:opacity-60"
                  >
                    {decisionLoading ? "Saving..." : "Reject"}
                  </button>
                </div>
              </div>
            ) : (
              <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${selectedKitchen.verificationStatus === "verified" ? "border-[#15803D]/20 bg-[#15803D]/5 text-[#15803D]" : "border-[#B91C1C]/20 bg-[#B91C1C]/5 text-[#B91C1C]"}`}>
                {selectedKitchen.verificationStatus === "verified"
                  ? "This kitchen has already been verified."
                  : "This kitchen has already been rejected. Review the reason above before changing it again."}
              </div>
            )}
          </div>
        ) : null}

        {activeSection === "overview" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="cc-card-pad space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-[#F97316]">Kitchen verification queue</p>
                  <h2 className="text-xl font-semibold text-[#1F2933]">Pending approvals</h2>
                </div>
                <span className="rounded-full bg-[#F97316]/15 text-[#F97316] px-3 py-1 text-sm font-semibold">{pendingKitchens.length}</span>
              </div>
              <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                {pendingKitchens.length === 0 ? <p className="cc-muted">No kitchens waiting for approval.</p> : pendingKitchens.map((kitchen) => (
                  <div key={kitchen._id} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70">
                    <p className="font-semibold text-[#1F2933]">{kitchen.name}</p>
                    <p className="text-sm cc-muted">Owner: {typeof kitchen.ownerUserId === "object" ? (kitchen.ownerUserId?.email || kitchen.ownerUserId?.name || kitchen.ownerUserId?._id) : kitchen.ownerUserId || "N/A"}</p>
                    <p className="text-sm cc-muted">Status: {kitchen.verificationStatus}</p>
                    <button className="mt-2 cc-btn-primary rounded-lg px-3 py-1 text-sm" onClick={() => loadKitchenDetail(kitchen._id)}>View details</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="cc-card-pad space-y-3">
              <p className="text-sm font-semibold text-[#F97316]">Platform snapshot</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-black/5 bg-white/70 p-4"><p className="cc-muted text-sm">Verified kitchens</p><p className="text-2xl font-semibold text-[#1F2933]">{summary?.kitchens?.verified ?? kitchens.filter((item) => item.verificationStatus === "verified").length}</p></div>
                <div className="rounded-xl border border-black/5 bg-white/70 p-4"><p className="cc-muted text-sm">Rejected kitchens</p><p className="text-2xl font-semibold text-[#1F2933]">{summary?.kitchens?.rejected ?? kitchens.filter((item) => item.verificationStatus === "rejected").length}</p></div>
                <div className="rounded-xl border border-black/5 bg-white/70 p-4"><p className="cc-muted text-sm">Open complaints</p><p className="text-2xl font-semibold text-[#1F2933]">{summary?.complaints?.open ?? complaints.filter((item) => item.status === "open").length}</p></div>
                <div className="rounded-xl border border-black/5 bg-white/70 p-4"><p className="cc-muted text-sm">Active users</p><p className="text-2xl font-semibold text-[#1F2933]">{summary?.users?.active ?? users.filter((item) => item.isActivated).length}</p></div>
              </div>
              <p className="cc-muted text-sm">Use the tabs below to manage each area of the platform.</p>
            </div>
          </div>
        ) : null}

        {activeSection === "verification" ? (
          <VerificationDashboard
            kitchens={filteredKitchens}
            loadKitchenDetail={loadKitchenDetail}
            kitchenQuery={kitchenQuery}
            setKitchenQuery={setKitchenQuery}
            kitchenStatusFilter={kitchenStatusFilter}
            setKitchenStatusFilter={setKitchenStatusFilter}
            actionKey={actionKey}
          />
        ) : null}

        {activeSection === "users" ? (
          <UsersDashboard
            users={users}
            filteredUsers={filteredUsers}
            userQuery={userQuery}
            setUserQuery={setUserQuery}
            userStatusFilter={userStatusFilter}
            setUserStatusFilter={setUserStatusFilter}
            changeUserActivation={changeUserActivation}
            actionKey={actionKey}
          />
        ) : null}

        {activeSection === "kitchens" ? (
          <KitchensDashboard
            kitchens={kitchens}
            filteredKitchens={filteredKitchens}
            kitchenQuery={kitchenQuery}
            setKitchenQuery={setKitchenQuery}
            kitchenStatusFilter={kitchenStatusFilter}
            setKitchenStatusFilter={setKitchenStatusFilter}
            loadKitchenDetail={loadKitchenDetail}
            actionKey={actionKey}
          />
        ) : null}

        {activeSection === "orders" ? (
          <div className="cc-card-pad space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-[#F97316]">Order Monitoring</p>
                <h2 className="text-xl font-semibold text-[#1F2933]">View all orders and track status</h2>
              </div>
              <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm">
                <option value="all">All statuses</option>
                <option value="prebooked">Prebooked</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
                <option value="fulfilled">Fulfilled</option>
              </select>
            </div>
            <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
              {filteredOrders.length === 0 ? <p className="cc-muted">No orders found.</p> : filteredOrders.map((order) => (
                <div key={order._id} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-[#1F2933]">{order.kitchenId?.name || "Kitchen"}</p>
                      <p className="text-sm cc-muted">User: {order.userId?.email || order.userId?.name || "-"}</p>
                      <p className="text-sm cc-muted">Meal: {order.mealId?.title || "-"} | Status: {order.status}</p>
                    </div>
                    <div className="text-sm cc-muted text-right">
                      <p>Date: {order.date ? new Date(order.date).toLocaleDateString() : "-"}</p>
                      <p>Created: {formatDateTime(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeSection === "complaints" ? (
          <div className="cc-card-pad space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-[#F97316]">Complaint & Report Section</p>
                <h2 className="text-xl font-semibold text-[#1F2933]">Review and resolve platform reports</h2>
              </div>
              <select value={complaintStatusFilter} onChange={(e) => setComplaintStatusFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm">
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
              {filteredComplaints.length === 0 ? <p className="cc-muted">No complaints found.</p> : filteredComplaints.map((complaint) => (
                <div key={complaint._id} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70 space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-[#1F2933]">{complaint.category || complaint.type}</p>
                      <p className="text-sm cc-muted">Reporter: {complaint.reporterUserId?.email || complaint.reporterUserId?.name || "-"}</p>
                      <p className="text-sm cc-muted">Kitchen: {complaint.kitchenId?.name || "-"} | Order: {complaint.orderId?.status || "-"}</p>
                    </div>
                    <span className="rounded-full bg-[#F97316]/10 text-[#F97316] px-3 py-1 text-xs font-semibold">{complaint.status}</span>
                  </div>
                  <p className="text-sm text-[#1F2933]">{complaint.message}</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ["open", "Open"],
                      ["investigating", "Investigate"],
                      ["resolved", "Resolve"],
                      ["rejected", "Reject"],
                    ].map(([value, label]) => (
                      <button key={value} className="rounded-lg px-3 py-1 text-sm border border-black/10 bg-white" onClick={() => changeComplaintStatus(complaint._id, value)} disabled={actionKey === `complaint-${complaint._id}`}>{label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeSection === "reviews" ? (
          <div className="cc-card-pad space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-[#F97316]">Reviews & Ratings Management</p>
                <h2 className="text-xl font-semibold text-[#1F2933]">Monitor fake or abusive reviews</h2>
              </div>
              <input value={reviewQuery} onChange={(e) => setReviewQuery(e.target.value)} placeholder="Search reviews..." className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm" />
            </div>
            <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
              {filteredReviews.length === 0 ? <p className="cc-muted">No reviews found.</p> : filteredReviews.map((review) => (
                <div key={review._id} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70 space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-[#1F2933]">{review.kitchenId?.name || "Kitchen"} | Rating: {review.rating}</p>
                      <p className="text-sm cc-muted">By: {review.userId?.email || review.userId?.name || "-"}</p>
                    </div>
                    <button className="rounded-lg px-3 py-1 text-sm border border-[#B91C1C]/20 bg-[#B91C1C]/5 text-[#B91C1C]" onClick={() => deleteReview(review._id)} disabled={actionKey === `review-${review._id}`}>Delete</button>
                  </div>
                  <p className="text-sm text-[#1F2933]">{review.feedback || "No feedback provided."}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeSection === "announcements" ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="cc-card-pad space-y-4">
              <div>
                <p className="text-sm font-semibold text-[#F97316]">Announcement / Notification Section</p>
                <h2 className="text-xl font-semibold text-[#1F2933]">Send updates to users or kitchens</h2>
              </div>
              <div className="grid gap-3">
                <input value={announcementForm.title} onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title" className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm" />
                <textarea value={announcementForm.body} onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, body: e.target.value }))} placeholder="Announcement body" rows={4} className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm" />
                <div className="grid md:grid-cols-2 gap-3">
                  <select value={announcementForm.audience} onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, audience: e.target.value }))} className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm">
                    <option value="all">All</option>
                    <option value="customers">Customers</option>
                    <option value="kitchens">Kitchens</option>
                    <option value="admins">Admins</option>
                  </select>
                  <select value={announcementForm.status} onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, status: e.target.value }))} className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm">
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                  <select value={announcementForm.priority} onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, priority: e.target.value }))} className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                  <input type="datetime-local" value={announcementForm.publishAt} onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, publishAt: e.target.value }))} className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm" />
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button className="cc-btn-primary rounded-lg px-4 py-2" onClick={saveAnnouncement} disabled={announcementSaving}>{announcementSaving ? "Saving..." : editingAnnouncementId ? "Update announcement" : "Create announcement"}</button>
                  {editingAnnouncementId ? <button className="cc-btn-secondary rounded-lg px-4 py-2" onClick={() => { setEditingAnnouncementId(""); setAnnouncementForm(emptyAnnouncement); }}>Cancel edit</button> : null}
                </div>
              </div>
            </div>

            <div className="cc-card-pad space-y-3 max-h-[740px] overflow-auto">
              <p className="font-semibold text-[#1F2933]">Recent announcements</p>
              {announcements.length === 0 ? <p className="cc-muted">No announcements yet.</p> : announcements.map((announcement) => (
                <div key={announcement._id} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70 space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-[#1F2933]">{announcement.title}</p>
                      <p className="text-sm cc-muted">Audience: {announcement.audience} | Status: {announcement.status} | Priority: {announcement.priority}</p>
                    </div>
                    <button className="cc-btn-primary rounded-lg px-3 py-1 text-sm" onClick={() => editAnnouncement(announcement)}>Edit</button>
                  </div>
                  <p className="text-sm text-[#1F2933] whitespace-pre-wrap">{announcement.body}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeSection === "subscriptions" ? (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="cc-card-pad space-y-4">
              <div>
                <p className="text-sm font-semibold text-[#F97316]">Subscription & Payment Management</p>
                <h2 className="text-xl font-semibold text-[#1F2933]">Manage plans and active subscriptions</h2>
              </div>
              <div className="grid gap-3">
                <select value={planForm.planType} onChange={(e) => setPlanForm((prev) => ({ ...prev, planType: e.target.value }))} className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm">
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <input type="number" min={1} max={3} value={planForm.mealsPerDay} onChange={(e) => setPlanForm((prev) => ({ ...prev, mealsPerDay: e.target.value }))} className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm" placeholder="Meals per day" />
                <input type="number" min={0} value={planForm.price} onChange={(e) => setPlanForm((prev) => ({ ...prev, price: e.target.value }))} className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm" placeholder="Price" />
                <label className="flex items-center gap-2 text-sm text-[#1F2933]"><input type="checkbox" checked={planForm.isActive} onChange={(e) => setPlanForm((prev) => ({ ...prev, isActive: e.target.checked }))} /> Active</label>
                <div className="flex gap-3 flex-wrap">
                  <button className="cc-btn-primary rounded-lg px-4 py-2" onClick={savePlan} disabled={planSaving}>{planSaving ? "Saving..." : editingPlanId ? "Update plan" : "Create plan"}</button>
                  {editingPlanId ? <button className="cc-btn-secondary rounded-lg px-4 py-2" onClick={() => { setEditingPlanId(""); setPlanForm(emptyPlan); }}>Cancel edit</button> : null}
                </div>
              </div>
            </div>

            <div className="cc-card-pad space-y-4 max-h-[740px] overflow-auto">
              <p className="font-semibold text-[#1F2933]">Plan catalog</p>
              {plans.length === 0 ? <p className="cc-muted">No plans found.</p> : plans.map((plan) => (
                <div key={plan._id} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold text-[#1F2933]">{plan.planType} | {plan.mealsPerDay} meals/day</p>
                    <p className="text-sm cc-muted">Price: ₹{plan.price} | Active: {plan.isActive ? "Yes" : "No"}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button className="cc-btn-primary rounded-lg px-3 py-1 text-sm" onClick={() => editPlan(plan)}>Edit</button>
                    <button className="rounded-lg px-3 py-1 text-sm border border-[#B91C1C]/20 bg-[#B91C1C]/5 text-[#B91C1C]" onClick={() => apiFetch(`/api/admin/subscription-plans/${plan._id}`, { method: "PATCH", body: JSON.stringify({ isActive: !plan.isActive }) }).then(reload)}>
                      {plan.isActive ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-black/5">
                <p className="font-semibold text-[#1F2933] mb-2">Active subscriptions</p>
                {subscriptions.length === 0 ? <p className="cc-muted">No subscriptions found.</p> : subscriptions.map((subscription) => (
                  <div key={subscription._id} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70 mb-3">
                    <p className="font-semibold text-[#1F2933]">{subscription.userId?.email || subscription.userId?.name || "User"}</p>
                    <p className="text-sm cc-muted">Plan: {subscription.planId?.planType || "-"} | {subscription.planId?.mealsPerDay || "-"} meals/day | ₹{subscription.planId?.price ?? "-"}</p>
                    <p className="text-sm cc-muted">Status: {subscription.status} | Start: {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : "-"} | End: {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : "-"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeSection === "settings" ? (
          <div className="cc-card-pad space-y-4">
            <div>
              <p className="text-sm font-semibold text-[#F97316]">Platform Settings</p>
              <h2 className="text-xl font-semibold text-[#1F2933]">Key/value configuration</h2>
            </div>
            <div className="space-y-3">
              {settings.length === 0 ? <p className="cc-muted">No settings configured.</p> : settings.map((setting) => (
                <div key={setting._id} className="grid gap-3 md:grid-cols-[220px_1fr_auto] items-start border border-black/5 rounded-xl px-4 py-3 bg-white/70">
                  <div>
                    <p className="font-semibold text-[#1F2933]">{setting.key}</p>
                    <p className="text-xs cc-muted">Updated: {formatDateTime(setting.updatedAt)}</p>
                  </div>
                  <textarea
                    value={settingDrafts[setting.key] ?? ""}
                    onChange={(e) => setSettingDrafts((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                    rows={2}
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-[#1F2933]"
                  />
                  <button
                    className="cc-btn-primary rounded-lg px-4 py-2"
                    onClick={() => saveSetting(setting.key)}
                    disabled={actionKey === `setting-${setting.key}`}
                  >
                    Save
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdminDashboard;