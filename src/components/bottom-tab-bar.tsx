"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Briefcase,
  Plus,
  Calendar,
  Menu,
} from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Home", Icon: Home },
  { href: "/projects", label: "Projects", Icon: Briefcase },
  { href: "__action__", label: "New", Icon: Plus },
  { href: "/calendar", label: "Calendar", Icon: Calendar },
  { href: "/more", label: "More", Icon: Menu },
];

interface Props {
  onQuickCreate: () => void;
}

export default function BottomTabBar({ onQuickCreate }: Props) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-border pb-safe lg:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          if (tab.href === "__action__") {
            return (
              <button
                key="action"
                onClick={onQuickCreate}
                className="flex flex-col items-center justify-center -mt-5"
                aria-label="Quick create"
              >
                <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-blue text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
                  <Plus className="w-6 h-6" />
                </span>
              </button>
            );
          }

          const active = pathname === tab.href || pathname.startsWith(tab.href + "/");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[3.5rem] py-1 transition-colors ${
                active ? "text-brand-blue" : "text-gray-400"
              }`}
            >
              <tab.Icon className={`w-[22px] h-[22px] transition-all ${active ? "stroke-[2.5] text-brand-blue" : "text-gray-400 stroke-[1.5]"}`} />
              <span className={`text-[10px] transition-colors ${active ? "font-semibold text-brand-blue" : "font-medium text-gray-400"}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
