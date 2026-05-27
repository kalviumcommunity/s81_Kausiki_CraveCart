import React from 'react';

export default function AnnouncementsDashboard({ announcements = [], editAnnouncement, announcementForm, setAnnouncementForm, saveAnnouncement, announcementSaving }) {
  return (
    <div className="cc-card-pad space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-[#F97316]">Announcements</p>
          <h2 className="text-xl font-semibold text-[#1F2933]">Create and manage announcements</h2>
        </div>
      </div>
      <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
        {announcements.length === 0 ? <p className="cc-muted">No announcements.</p> : announcements.map((a) => (
          <div key={a._id} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{a.title}</p>
              <p className="text-sm cc-muted">{a.body}</p>
            </div>
            <div>
              <button className="rounded-lg px-3 py-1 text-sm" onClick={() => editAnnouncement(a)}>Edit</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-black/5 bg-white/60 p-4">
        <p className="font-semibold mb-2">Create / Edit Announcement</p>
        <input value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className="w-full mb-2 rounded border px-3 py-2" placeholder="Title" />
        <textarea value={announcementForm.body} onChange={(e) => setAnnouncementForm({ ...announcementForm, body: e.target.value })} className="w-full mb-2 rounded border px-3 py-2" placeholder="Body" rows={4} />
        <div className="flex gap-2">
          <button className="cc-btn-primary rounded-lg px-4 py-2" onClick={saveAnnouncement} disabled={announcementSaving}>{announcementSaving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}
