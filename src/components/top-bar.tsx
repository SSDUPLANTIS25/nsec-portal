"use client";

import { Bell, Search, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

export default function TopBar() {
  const { user, logout, switchRole } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  if (!user) return null;

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-navy-900 text-white h-14 flex items-center px-4 gap-3">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded bg-brand-blue flex items-center justify-center text-xs font-bold shrink-0">
            NS
          </div>
          <span className="text-sm font-semibold truncate">NSEC Portal</span>
        </div>

        {/* Right actions */}
        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors relative" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-red text-[10px] font-bold flex items-center justify-center">
            5
          </span>
        </button>

        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Search">
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowProfile(!showProfile)}
          className="w-8 h-8 rounded-full bg-brand-blue/80 flex items-center justify-center text-sm font-bold"
          aria-label="Profile"
        >
          {user.name.charAt(0)}
        </button>
      </header>

      {/* Profile dropdown */}
      {showProfile && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
          <div className="fixed top-14 right-2 z-50 bg-white rounded-xl shadow-xl border border-gray-100 w-64 p-4">
            <div className="mb-3">
              <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>

            <div className="border-t border-gray-100 pt-3 mb-3">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">Demo: Switch Role</p>
              <div className="flex gap-1">
                {(["field", "office", "management"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => { switchRole(r); setShowProfile(false); }}
                    className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                      user.role === r
                        ? "bg-brand-blue text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {r === "field" ? "Field" : r === "office" ? "Office" : "Mgmt"}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { logout(); setShowProfile(false); }}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium w-full py-1"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </>
  );
}
