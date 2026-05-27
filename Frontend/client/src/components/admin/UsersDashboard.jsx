import React from 'react';

export default function UsersDashboard({ users = [], filteredUsers = [], userQuery, setUserQuery, userStatusFilter, setUserStatusFilter, changeUserActivation, actionKey }) {
  const list = filteredUsers.length ? filteredUsers : users;
  return (
    <div className="cc-card-pad space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-[#F97316]">User Management</p>
          <h2 className="text-xl font-semibold text-[#1F2933]">Search, block, and unblock accounts</h2>
        </div>
        <input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Search users..." className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[["all", "All"], ["active", "Active"], ["inactive", "Blocked"]].map(([value, label]) => (
          <button key={value} onClick={() => setUserStatusFilter(value)} className={`rounded-full px-3 py-1 text-sm font-semibold border ${userStatusFilter === value ? "bg-[#F97316] text-[#1F2933] border-[#F97316]/50" : "bg-white/70 text-[#1F2933] border-black/5"}`}>{label}</button>
        ))}
      </div>
      <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
        {list.length === 0 ? <p className="cc-muted">No users found.</p> : list.map((user) => (
          <div key={user._id} className="border border-black/5 rounded-xl px-4 py-3 bg-white/70 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="font-semibold text-[#1F2933]">{user.name}</p>
              <p className="text-sm cc-muted">{user.email}</p>
              <p className="text-sm cc-muted">Role: {user.role} | Status: {user.isActivated ? "Active" : "Blocked"}</p>
            </div>
            <button
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${user.isActivated ? "border border-[#B91C1C]/20 bg-[#B91C1C]/5 text-[#B91C1C]" : "border border-[#15803D]/20 bg-[#15803D]/5 text-[#15803D]"}`}
              onClick={() => changeUserActivation(user._id, !user.isActivated)}
              disabled={actionKey === `user-${user._id}`}
            >
              {user.isActivated ? "Block" : "Unblock"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
