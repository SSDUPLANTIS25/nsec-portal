"use client";

import { Bell, Search, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/calendar": "Calendar",
  "/installations": "Installations",
  "/pipeline": "Pipeline",
  "/more": "All Modules",
};

export default function TopBar() {
  const { user, logout, switchRole } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const pathname = usePathname();

  // Close dropdown on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showProfile) setShowProfile(false);
    };
    if (showProfile) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showProfile]);

  if (!user) return null;

  const pageLabel = PAGE_LABELS[pathname] || pathname.split("/").pop()?.replace(/-/g, " ") || "";

  const roleBadgeColor =
    user.role === "field" ? "bg-emerald-500/20 text-emerald-300" :
    user.role === "office" ? "bg-purple-500/20 text-purple-300" :
    "bg-orange-500/20 text-orange-300";

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-navy-900 text-white h-14 flex items-center px-4 gap-3">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-xs font-bold">
            NS
          </div>
          <span className="text-sm font-semibold hidden sm:inline">NSEC Portal</span>
        </div>

        {/* Desktop breadcrumb */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs text-navy-300 ml-4 flex-1 min-w-0">
          <Link href="/dashboard" className="hover:text-white transition-colors">Home</Link>
          {pathname !== "/dashboard" && (
            <>
              <ChevronRight className="w-3 h-3 text-navy-500" />
              <span className="text-white font-medium capitalize truncate">{pageLabel}</span>
            </>
          )}
        </nav>

        {/* Spacer for mobile */}
        <div className="flex-1 lg:hidden" />

        {/* Role badge (desktop) */}
        <span className={`hidden lg:flex text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${roleBadgeColor}`}>
          {user.role}
        </span>

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
          className="w-8 h-8 rounded-full bg-brand-blue/80 flex items-center justify-center text-sm font-bold hover:bg-brand-blue transition-colors"
          aria-label="Profile"
        >
          {user.name.charAt(0)}
        </button>
      </header>

      {/* Profile dropdown */}
      {showProfile && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
          <div className="fixed top-14 right-2 z-50 bg-white rounded-xl shadow-xl border border-gray-100 w-64 p-4 animate-fadeIn">
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
