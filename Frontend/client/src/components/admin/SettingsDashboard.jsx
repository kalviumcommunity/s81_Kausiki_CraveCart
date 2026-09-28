import React, { useState } from 'react';

export default function SettingsDashboard({ settings = [], settingDrafts = {}, setSettingDrafts, saveSetting, actionKey }) {
  const [newPasskey, setNewPasskey] = useState("");
  const [passkeyMsg, setPasskeyMsg] = useState("");
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const currentPasskeySetting = settings.find((s) => s.key === "admin_passkey")?.value || "kausiki@2006";

  const handleUpdatePasskey = async () => {
    if (!newPasskey.trim()) return;
    setPasskeyLoading(true);
    setPasskeyMsg("");
    try {
      await saveSetting("admin_passkey", newPasskey.trim());
      setPasskeyMsg("Admin passkey updated successfully!");
      setNewPasskey("");
      setTimeout(() => setPasskeyMsg(""), 4000);
    } catch {
      setPasskeyMsg("Failed to update passkey.");
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dedicated Admin Passkey Card */}
      <div className="cc-card-pad space-y-4 border border-[#75070C]/20 bg-[#FFFDF9]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#75070C] bg-[#75070C]/10 px-2.5 py-0.5 rounded-full">
              SECURITY & ACCESS
            </span>
            <h2 className="text-xl font-bold text-[#1F2933] mt-1">Admin Security Passkey</h2>
            <p className="text-xs text-[#6E5C52] mt-0.5">
              Set the master passkey used to unlock this Admin Console without requiring email/password signup.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E4D5C3]">
            <p className="text-xs text-[#6E5C52]">Current Active Passkey</p>
            <p className="font-mono font-bold text-sm text-[#23120B] mt-1">
              {String(currentPasskeySetting)}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#23120B]">Set New Passkey</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPasskey}
                onChange={(e) => setNewPasskey(e.target.value)}
                placeholder="Enter new passkey..."
                className="w-full rounded-xl border border-[#E4D5C3] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#75070C]"
              />
              <button
                type="button"
                onClick={handleUpdatePasskey}
                disabled={passkeyLoading || !newPasskey.trim()}
                className="rounded-xl px-4 py-2 bg-[#75070C] text-[#FFFBEA] text-sm font-bold hover:bg-[#5C0509] disabled:opacity-50 transition shrink-0"
              >
                {passkeyLoading ? "Saving..." : "Update Passkey"}
              </button>
            </div>
            {passkeyMsg && (
              <p className={`text-xs font-medium ${passkeyMsg.includes('success') ? 'text-green-700' : 'text-red-600'}`}>
                {passkeyMsg}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* General Platform Settings */}
      <div className="cc-card-pad space-y-4">
        <div>
          <p className="text-sm font-semibold text-[#F97316]">General Settings</p>
          <h2 className="text-xl font-semibold text-[#1F2933]">Platform configuration</h2>
        </div>
        <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
          {settings.filter((s) => s.key !== "admin_passkey").length === 0 ? (
            <p className="cc-muted">No additional platform settings.</p>
          ) : (
            settings
              .filter((s) => s.key !== "admin_passkey")
              .map((s) => (
                <div key={s.key} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70 flex items-center justify-between gap-3">
                  <div className="w-full">
                    <p className="font-semibold text-sm">{s.key}</p>
                    <input
                      value={settingDrafts[s.key] ?? ''}
                      onChange={(e) => setSettingDrafts((prev) => ({ ...prev, [s.key]: e.target.value }))}
                      className="w-full rounded border px-3 py-2 mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <button
                      className="rounded-lg px-3 py-1.5 text-sm bg-[#75070C] text-white font-medium hover:bg-[#5C0509]"
                      onClick={() => saveSetting(s.key)}
                      disabled={actionKey === `setting-${s.key}`}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

