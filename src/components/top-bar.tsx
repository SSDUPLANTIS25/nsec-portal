"use client";

import { Bell, Search, LogOut, ChevronRight, Command } from "lucide-react";
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
    user.role === "field" ? "bg-emerald-100 text-emerald-700" :
    user.role === "office" ? "bg-purple-100 text-purple-700" :
    "bg-orange-100 text-orange-700";

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-navy-900 h-14 flex items-center px-4 gap-2">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white text-xs font-bold">
            NS
          </div>
          <span className="text-sm font-semibold text-white hidden sm:inline tracking-tight">NSEC Portal</span>
        </div>

        {/* Desktop breadcrumb */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs text-navy-400 ml-6 flex-1 min-w-0">
          <Link href="/dashboard" className="hover:text-navy-200 transition-colors">Home</Link>
          {pathname !== "/dashboard" && (
            <>
              <ChevronRight className="w-3 h-3 text-navy-600" />
              <span className="text-white font-medium capitalize truncate">{pageLabel}</span>
            </>
          )}
        </nav>

        {/* Spacer for mobile */}
        <div className="flex-1 lg:hidden" />

        {/* Desktop search hint */}
        <button className="hidden lg:flex items-center gap-2 h-8 pl-3 pr-2 rounded-lg bg-white/[0.07] border border-white/[0.08] text-navy-400 text-xs hover:bg-white/10 hover:text-navy-200 transition-all cursor-pointer">
          <Search className="w-3.5 h-3.5" />
          <span>Search...</span>
          <kbd className="flex items-center gap-0.5 text-[10px] text-navy-500 bg-white/5 px-1.5 py-0.5 rounded font-mono ml-4">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        {/* Role badge */}
        <span className={`hidden lg:flex text-[11px] font-semibold px-2.5 py-1 rounded-md capitalize ${roleBadgeColor}`}>
          {user.role}
        </span>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors relative" aria-label="Notifications">
          <Bell className="w-[18px] h-[18px] text-navy-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-red ring-2 ring-navy-900" />
        </button>

        {/* Mobile search */}
        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden" aria-label="Search">
          <Search className="w-[18px] h-[18px] text-navy-300" />
        </button>

        {/* Profile avatar */}
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-blue-700 flex items-center justify-center text-sm font-semibold text-white hover:ring-2 hover:ring-brand-blue/50 transition-all"
          aria-label="Profile"
        >
          {user.name.charAt(0)}
        </button>
      </header>

      {/* Profile dropdown */}
      {showProfile && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
          <div className="fixed top-[60px] right-3 z-50 bg-white rounded-xl shadow-xl border border-border w-72 animate-scaleIn overflow-hidden">
            {/* User info header */}
            <div className="px-4 pt-4 pb-3 border-b border-border-light">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-blue-700 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Role switcher */}
            <div className="px-4 py-3 border-b border-border-light">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">Demo: Switch Role</p>
              <div className="flex gap-1.5">
                {(["field", "office", "management"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => { switchRole(r); setShowProfile(false); }}
                    className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                      user.role === r
                        ? "bg-brand-blue text-white shadow-sm"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {r === "field" ? "Field" : r === "office" ? "Office" : "Mgmt"}
                  </button>
                ))}
              </div>
            </div>

            {/* Sign out */}
            <div className="px-4 py-3">
              <button
                onClick={() => { logout(); setShowProfile(false); }}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 font-medium w-full py-1 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
