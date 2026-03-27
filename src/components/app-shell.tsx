"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import TopBar from "./top-bar";
import BottomTabBar from "./bottom-tab-bar";
import QuickCreateSheet from "./quick-create-sheet";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  if (!isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <main className="pt-14 pb-20">{children}</main>
      <BottomTabBar onQuickCreate={() => setQuickCreateOpen(true)} />
      <QuickCreateSheet open={quickCreateOpen} onClose={() => setQuickCreateOpen(false)} />
    </div>
  );
}
