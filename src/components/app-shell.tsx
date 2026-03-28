"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import TopBar from "./top-bar";
import BottomTabBar from "./bottom-tab-bar";
import Sidebar from "./sidebar";
import QuickCreateSheet from "./quick-create-sheet";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  // Global keyboard shortcut: Cmd+K → Quick Create
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setQuickCreateOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <TopBar />
      <Sidebar onQuickCreate={() => setQuickCreateOpen(true)} />

      {/* Main content: offset for sidebar on desktop */}
      <main className="pt-14 pb-20 lg:pb-6 lg:pl-60 xl:pl-64 transition-[padding] duration-300">
        <div className="animate-fadeIn">
          {children}
        </div>
      </main>

      {/* Mobile-only bottom tab bar */}
      <BottomTabBar onQuickCreate={() => setQuickCreateOpen(true)} />
      <QuickCreateSheet open={quickCreateOpen} onClose={() => setQuickCreateOpen(false)} />
    </div>
  );
}
