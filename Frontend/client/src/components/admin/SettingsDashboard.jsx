import React from 'react';

export default function SettingsDashboard({ settings = [], settingDrafts = {}, setSettingDrafts, saveSetting, actionKey }) {
  return (
    <div className="cc-card-pad space-y-4">
      <div>
        <p className="text-sm font-semibold text-[#F97316]">Settings</p>
        <h2 className="text-xl font-semibold text-[#1F2933]">Platform configuration</h2>
      </div>
      <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
        {settings.length === 0 ? <p className="cc-muted">No settings.</p> : settings.map((s) => (
          <div key={s.key} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70 flex items-center justify-between gap-3">
            <div className="w-full">
              <p className="font-semibold">{s.key}</p>
              <input value={settingDrafts[s.key] ?? ''} onChange={(e) => setSettingDrafts(prev => ({ ...prev, [s.key]: e.target.value }))} className="w-full rounded border px-3 py-2 mt-1" />
            </div>
            <div>
              <button className="rounded-lg px-3 py-1 text-sm" onClick={() => saveSetting(s.key)} disabled={actionKey === `setting-${s.key}`}>Save</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
