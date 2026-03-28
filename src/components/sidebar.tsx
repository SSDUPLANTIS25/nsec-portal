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
          className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Quick Create
        </button>
      </div>

      {/* Primary nav */}
      <nav className="px-2 pb-2 space-y-0.5">
        {primaryNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-blue-50 text-brand-blue"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className={isActive(item.href) ? "text-brand-blue" : "text-gray-400"}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-gray-100" />

      {/* Secondary collapsible sections */}
      <div className="px-2 pt-2 pb-4 space-y-1">
        {secondaryNav.map((section) => (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-600 transition-colors"
            >
              {openSections[section.title] ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              {section.title}
            </button>
            {openSections[section.title] && (
              <div className="space-y-0.5 ml-2">
                {section.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <span className="text-gray-400">{item.icon}</span>
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

      {/* Bottom: More/Settings link */}
      <div className="mt-auto border-t border-gray-100 p-2">
        <Link
          href="/more"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive("/more")
              ? "bg-blue-50 text-brand-blue"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Settings className="w-5 h-5 text-gray-400" />
          All Modules
        </Link>
      </div>
    </aside>
  );
}
