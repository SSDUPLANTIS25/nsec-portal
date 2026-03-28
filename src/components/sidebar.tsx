"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Briefcase,
  Calendar,
  CheckSquare,
  Wrench,
  TrendingUp,
  ClipboardList,
  MapPin,
  Users,
  ShoppingCart,
  Factory,
  DollarSign,
  Settings,
  Plus,
  ChevronDown,
  Search,
  LayoutGrid,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <Home className="w-[18px] h-[18px]" /> },
  { label: "Projects", href: "/projects", icon: <Briefcase className="w-[18px] h-[18px]" /> },
  { label: "Tasks", href: "/tasks", icon: <CheckSquare className="w-[18px] h-[18px]" /> },
  { label: "Calendar", href: "/calendar", icon: <Calendar className="w-[18px] h-[18px]" /> },
  { label: "Installations", href: "/installations", icon: <Wrench className="w-[18px] h-[18px]" /> },
  { label: "Pipeline", href: "/pipeline", icon: <TrendingUp className="w-[18px] h-[18px]" /> },
];

const secondaryNav: NavSection[] = [
  {
    title: "Operations",
    defaultOpen: false,
    items: [
      { label: "Orders", href: "/more", icon: <ClipboardList className="w-4 h-4" />, badge: 5 },
      { label: "Procurement", href: "/more", icon: <ShoppingCart className="w-4 h-4" /> },
      { label: "Production", href: "/more", icon: <Factory className="w-4 h-4" /> },
      { label: "Routes", href: "/more", icon: <MapPin className="w-4 h-4" /> },
    ],
  },
  {
    title: "People",
    defaultOpen: false,
    items: [
      { label: "Team", href: "/more", icon: <Users className="w-4 h-4" /> },
      { label: "Payroll", href: "/more", icon: <DollarSign className="w-4 h-4" /> },
    ],
  },
];

interface Props {
  onQuickCreate: () => void;
}

export default function Sidebar({ onQuickCreate }: Props) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(secondaryNav.map((s) => [s.title, s.defaultOpen ?? false]))
  );

  const toggleSection = (title: string) =>
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 xl:w-64 fixed top-14 left-0 bottom-0 bg-white border-r border-border z-40">
      {/* Search + Quick Create */}
      <div className="p-3 space-y-2">
        <button
          onClick={onQuickCreate}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-brand-blue text-white text-sm font-medium hover:bg-blue-600 active:scale-[0.98] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Quick Create
          <kbd className="ml-1.5 text-[10px] text-blue-200 bg-blue-700/50 px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="space-y-0.5">
          {primaryNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-all ${
                  active
                    ? "bg-brand-blue/[0.08] text-brand-blue"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className={`transition-colors ${active ? "text-brand-blue" : "text-gray-400 group-hover:text-gray-500"}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-2 my-3 border-t border-border-light" />

        {/* Secondary collapsible sections */}
        <div className="space-y-0.5">
          {secondaryNav.map((section) => (
            <div key={section.title}>
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center gap-2 px-2.5 py-[7px] text-[11px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-500 rounded-lg transition-colors"
              >
                <ChevronDown
                  className="w-3 h-3 transition-transform duration-200"
                  style={{ transform: openSections[section.title] ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                />
                {section.title}
                <span className="ml-auto text-[10px] font-medium text-gray-300 tabular-nums">
                  {section.items.length}
                </span>
              </button>
              {openSections[section.title] && (
                <div className="space-y-0.5 ml-1 animate-fadeIn">
                  {section.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="group flex items-center gap-2.5 px-2.5 py-[6px] rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                    >
                      <span className="text-gray-400 group-hover:text-gray-500 transition-colors">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-brand-blue text-white text-[10px] font-semibold flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom: User + All Modules */}
      <div className="border-t border-border-light p-3 space-y-1.5">
        {user && (
          <div className="flex items-center gap-2.5 px-1.5 py-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-blue-700 text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-[11px] text-gray-400 capitalize truncate">{user.role}</p>
            </div>
          </div>
        )}
        <Link
          href="/more"
          className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-colors ${
            isActive("/more")
              ? "bg-brand-blue/[0.08] text-brand-blue"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          <LayoutGrid className="w-[18px] h-[18px]" />
          All Modules
        </Link>
      </div>
    </aside>
  );
}
