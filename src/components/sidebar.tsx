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
  ChevronRight,
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
  { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
  { label: "Projects", href: "/projects", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Tasks", href: "/tasks", icon: <CheckSquare className="w-5 h-5" /> },
  { label: "Calendar", href: "/calendar", icon: <Calendar className="w-5 h-5" /> },
  { label: "Installations", href: "/installations", icon: <Wrench className="w-5 h-5" /> },
  { label: "Pipeline", href: "/pipeline", icon: <TrendingUp className="w-5 h-5" /> },
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
    <aside className="hidden lg:flex lg:flex-col lg:w-60 xl:w-64 fixed top-14 left-0 bottom-0 bg-white border-r border-gray-200 z-40 overflow-y-auto">
      {/* Quick Create */}
      <div className="p-3">
        <button
          onClick={onQuickCreate}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-brand-blue text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Quick Create
          <span className="ml-1 text-[10px] text-blue-200 font-normal">⌘K</span>
        </button>
      </div>

      {/* Primary nav */}
      <nav className="px-2 pb-2 space-y-0.5">
        {primaryNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-blue-50 text-brand-blue border-l-[3px] border-brand-blue pl-[9px]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className={`transition-colors ${active ? "text-brand-blue" : "text-gray-400 group-hover:text-gray-600"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-gray-100" />

      {/* Secondary collapsible sections */}
      <div className="px-2 pt-2 pb-4 space-y-1">
        {secondaryNav.map((section) => (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="transition-transform duration-200" style={{ transform: openSections[section.title] ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                <ChevronDown className="w-3 h-3" />
              </span>
              {section.title}
              <span className="ml-auto text-[10px] font-medium text-gray-300 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {section.items.length}
              </span>
            </button>
            {openSections[section.title] && (
              <div className="space-y-0.5 ml-2 animate-fadeIn">
                {section.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <span className="text-gray-400 group-hover:text-gray-600 transition-colors">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-brand-blue text-white text-[10px] font-bold flex items-center justify-center">
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

      {/* Bottom: User + Settings */}
      <div className="mt-auto border-t border-gray-100 p-3 space-y-2">
        {/* User card */}
        {user && (
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="w-8 h-8 rounded-full bg-brand-blue text-white text-xs font-bold flex items-center justify-center shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize truncate">{user.role}</p>
            </div>
          </div>
        )}
        <Link
          href="/more"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive("/more")
              ? "bg-blue-50 text-brand-blue"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Settings className="w-4 h-4 text-gray-400" />
          All Modules
        </Link>
      </div>
    </aside>
  );
}
