import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [pendingKitchens, setPendingKitchens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedKitchen, setSelectedKitchen] = useState(null);
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState("");

  useEffect(() => {
    const loadPending = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch("/api/admin/kitchens/pending");
        setPendingKitchens(res.kitchens || []);
      } catch (err) {
        setError(err.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    loadPending();
  }, []);

  const loadDetail = async (id) => {
    setDetailLoading(true);
    setDetailError("");
    setDecisionError("");
    try {
      const res = await apiFetch(`/api/admin/kitchens/${id}`);
      setSelectedKitchen(res.kitchen || null);
    } catch (err) {
      setDetailError(err.message || "Failed to load details");
      setSelectedKitchen(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const decide = async (id, decision) => {
    setDecisionLoading(true);
    setDecisionError("");
    try {
      await apiFetch(`/api/admin/kitchens/${id}/decision`, {
        method: "PATCH",
        body: JSON.stringify({ decision }),
      });
      // Refresh lists and detail
      const refreshed = await apiFetch("/api/admin/kitchens/pending");
      setPendingKitchens(refreshed.kitchens || []);
      await loadDetail(id);
    } catch (err) {
      setDecisionError(err.message || "Failed to update status");
    } finally {
      setDecisionLoading(false);
    }
  };

  return (
    <div className="cc-page-lg">
      <div className="cc-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[#DC2626] text-sm uppercase tracking-wide">Admin</p>
            <h1 className="text-3xl font-bold mt-1 text-[#1F2933]">Control Center</h1>
            <p className="cc-muted mt-1">Review and manage kitchens.</p>
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
          <div className="cc-alert-error">
            {error}
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="cc-card-pad">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#F97316]">Pending Kitchens</p>
                  <h2 className="text-2xl font-semibold mt-1 text-[#1F2933]">{pendingKitchens.length}</h2>
                </div>
                <div className="rounded-full bg-[#F97316]/15 text-[#F97316] px-3 py-1 text-sm font-semibold">
                  Verification queue
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {pendingKitchens.length === 0 ? (
                  <p className="cc-muted">No kitchens waiting for approval.</p>
                ) : (
                  pendingKitchens.map((k) => (
                    <div key={k._id} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70">
                      <p className="font-semibold text-[#1F2933]">{k.name}</p>
                      <p className="text-sm cc-muted">
                        Owner: {typeof k.ownerUserId === "object" ? (k.ownerUserId?.email || k.ownerUserId?.name || k.ownerUserId?._id) : k.ownerUserId || "N/A"}
                      </p>
                      <p className="text-sm cc-muted">Status: {k.verificationStatus}</p>
                      <button
                        className="mt-2 cc-btn-primary rounded-lg px-3 py-1 text-sm"
                        onClick={() => loadDetail(k._id)}
                      >
                        View details
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {detailLoading && (
              <div className="cc-card-pad">
                <p className="cc-muted">Loading kitchen detail...</p>
              </div>
            )}

            {detailError && (
              <div className="cc-card-pad border-[#B91C1C]/25 bg-[#B91C1C]/5 text-[#B91C1C]">
                {detailError}
              </div>
            )}

            {selectedKitchen && !detailLoading && (
              <div className="cc-card-pad space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[#F97316] text-sm uppercase tracking-wide">Kitchen Detail</p>
                    <h3 className="text-2xl font-semibold text-[#1F2933]">{selectedKitchen.name}</h3>
                    <p className="cc-muted">Status: {selectedKitchen.verificationStatus}</p>
                    <p className="cc-muted">Verified: {selectedKitchen.verified ? "Yes" : "No"}</p>
                  </div>
                  <button
                    className="text-sm cc-muted hover:text-[#1F2933]"
                    onClick={() => setSelectedKitchen(null)}
                  >
                    Close
                  </button>
                </div>

                {decisionError && (
                  <div className="cc-alert-error">
                    {decisionError}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4 text-sm text-[#1F2933]">
                  <div className="space-y-1">
                    <p className="font-semibold">Owner</p>
                    <p>Name: {selectedKitchen.ownerUserId?.name || "-"}</p>
                    <p>Email: {selectedKitchen.ownerUserId?.email || "-"}</p>
                    <p>Phone: {selectedKitchen.ownerUserId?.phone || "-"}</p>
                    <p>Role: {selectedKitchen.ownerUserId?.role || "-"}</p>
                    <p>Joined: {selectedKitchen.ownerUserId?.createdAt ? new Date(selectedKitchen.ownerUserId.createdAt).toLocaleString() : "-"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold">FSSAI</p>
                    <p>License: {selectedKitchen.fssai?.licenseNumber || "-"}</p>
                    <p>Business: {selectedKitchen.fssai?.businessName || "-"}</p>
                    <p>Expiry: {selectedKitchen.fssai?.expiryDate ? new Date(selectedKitchen.fssai.expiryDate).toLocaleDateString() : "-"}</p>
                    <p>Status: {selectedKitchen.fssai?.validationStatus || "-"}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm text-[#1F2933]">
                  <div>
                    <p className="font-semibold mb-1">Documents</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        FSSAI Certificate: {selectedKitchen.documents?.fssaiCertificate?.urlPath ? (
                          <a className="cc-link underline" href={selectedKitchen.documents.fssaiCertificate.urlPath} target="_blank" rel="noreferrer">
                            View file
                          </a>
                        ) : (
                          "-"
                        )}
                      </li>
                      <li>
                        Government ID: {selectedKitchen.documents?.governmentId?.urlPath ? (
                          <a className="cc-link underline" href={selectedKitchen.documents.governmentId.urlPath} target="_blank" rel="noreferrer">
                            View file
                          </a>
                        ) : (
                          "-"
                        )}
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

                <div className="flex gap-3">
                  <button
                    disabled={decisionLoading}
                    onClick={() => decide(selectedKitchen._id, "verified")}
                    className="cc-btn-primary rounded-lg px-4 py-2 disabled:opacity-60"
                  >
                    {decisionLoading ? "Saving..." : "Mark as Verified"}
                  </button>
                  <button
                    disabled={decisionLoading}
                    onClick={() => decide(selectedKitchen._id, "rejected")}
                    className="cc-btn-danger rounded-lg px-4 py-2 disabled:opacity-60"
                  >
                    {decisionLoading ? "Saving..." : "Reject"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
