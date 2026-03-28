"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  CheckSquare,
  ClipboardList,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Users,
  ShoppingCart,
  Target,
  Globe,
  Megaphone,
  Factory,
  DollarSign,
  CreditCard,
  Car,
  GraduationCap,
  UserPlus,
  ShieldCheck,
  PenTool,
  ScanLine,
  Star,
  Truck,
  Wrench,
  BarChart3,
  Receipt,
  TrendingUp,
  Search,
  Sparkles,
} from "lucide-react";

/* ── colour theme per section ──────────────────────────── */
type Theme = { bg: string; iconBg: string; iconText: string; ring: string; badge: string };

const themes: Record<string, Theme> = {
  "My Work":          { bg: "bg-blue-50/60",    iconBg: "bg-blue-100",    iconText: "text-blue-600",    ring: "ring-blue-200",    badge: "bg-blue-500" },
  "Communication":    { bg: "bg-violet-50/60",  iconBg: "bg-violet-100",  iconText: "text-violet-600",  ring: "ring-violet-200",  badge: "bg-violet-500" },
  "Operations":       { bg: "bg-amber-50/60",   iconBg: "bg-amber-100",   iconText: "text-amber-600",   ring: "ring-amber-200",   badge: "bg-amber-500" },
  "Clients & Sales":  { bg: "bg-emerald-50/60", iconBg: "bg-emerald-100", iconText: "text-emerald-600", ring: "ring-emerald-200", badge: "bg-emerald-500" },
  "Finance & Admin":  { bg: "bg-purple-50/60",  iconBg: "bg-purple-100",  iconText: "text-purple-600",  ring: "ring-purple-200",  badge: "bg-purple-500" },
  "HR & Compliance":  { bg: "bg-rose-50/60",    iconBg: "bg-rose-100",    iconText: "text-rose-600",    ring: "ring-rose-200",    badge: "bg-rose-500" },
  "Tools":            { bg: "bg-sky-50/60",     iconBg: "bg-sky-100",     iconText: "text-sky-600",     ring: "ring-sky-200",     badge: "bg-sky-500" },
};

const fallbackTheme: Theme = { bg: "bg-gray-50/60", iconBg: "bg-gray-100", iconText: "text-gray-600", ring: "ring-gray-200", badge: "bg-gray-500" };

/* ── section data ──────────────────────────────────────── */
interface NavItem {
  label: string;
  desc: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: "My Work",
    items: [
      { label: "Tasks", desc: "Track your to-dos", icon: <CheckSquare className="w-5 h-5" />, href: "/tasks" },
      { label: "Calendar", desc: "Schedule & events", icon: <Calendar className="w-5 h-5" />, href: "/calendar" },
      { label: "Projects", desc: "All stage projects", icon: <Briefcase className="w-5 h-5" />, href: "/projects" },
      { label: "Pipeline", desc: "Deals & proposals", icon: <TrendingUp className="w-5 h-5" />, href: "/pipeline" },
      { label: "Installations", desc: "Crew dispatch", icon: <Wrench className="w-5 h-5" />, href: "/installations" },
      { label: "Routes", desc: "Delivery routing", icon: <MapPin className="w-5 h-5" /> },
    ],
  },
  {
    title: "Communication",
    items: [
      { label: "Email", desc: "Inbox & compose", icon: <Mail className="w-5 h-5" />, badge: 3 },
      { label: "Mentions", desc: "Tagged items", icon: <Target className="w-5 h-5" />, badge: 2 },
      { label: "SMS", desc: "Text messages", icon: <MessageSquare className="w-5 h-5" />, badge: 3 },
      { label: "Team Chat", desc: "Internal channels", icon: <Users className="w-5 h-5" />, badge: 7 },
      { label: "Phone", desc: "Call log", icon: <Phone className="w-5 h-5" />, badge: 1 },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Production", desc: "Shop floor status", icon: <Factory className="w-5 h-5" /> },
      { label: "Procurement", desc: "Purchase orders", icon: <ShoppingCart className="w-5 h-5" /> },
      { label: "Vendors", desc: "Supplier directory", icon: <Truck className="w-5 h-5" /> },
      { label: "Cost Master", desc: "Material pricing", icon: <BarChart3 className="w-5 h-5" /> },
    ],
  },
  {
    title: "Clients & Sales",
    items: [
      { label: "Clients", desc: "Customer directory", icon: <Users className="w-5 h-5" /> },
      { label: "Leads", desc: "New prospects", icon: <Target className="w-5 h-5" /> },
      { label: "Customer Portal", desc: "Client-facing view", icon: <Globe className="w-5 h-5" /> },
      { label: "Campaigns", desc: "Marketing outreach", icon: <Megaphone className="w-5 h-5" /> },
      { label: "Orders", desc: "Active orders", icon: <ClipboardList className="w-5 h-5" />, badge: 5 },
    ],
  },
  {
    title: "Finance & Admin",
    items: [
      { label: "Bills", desc: "Accounts payable", icon: <Receipt className="w-5 h-5" /> },
      { label: "Payroll", desc: "Gusto integration", icon: <DollarSign className="w-5 h-5" /> },
      { label: "Mileage", desc: "Reimbursements", icon: <Car className="w-5 h-5" /> },
      { label: "CC Expenses", desc: "Card transactions", icon: <CreditCard className="w-5 h-5" /> },
      { label: "Receivables", desc: "Outstanding invoices", icon: <DollarSign className="w-5 h-5" /> },
    ],
  },
  {
    title: "HR & Compliance",
    items: [
      { label: "Training", desc: "Certifications", icon: <GraduationCap className="w-5 h-5" /> },
      { label: "Recruiting", desc: "Open positions", icon: <UserPlus className="w-5 h-5" /> },
      { label: "Compliance", desc: "Policies & audits", icon: <ShieldCheck className="w-5 h-5" /> },
      { label: "eSignatures", desc: "Sign documents", icon: <PenTool className="w-5 h-5" /> },
    ],
  },
  {
    title: "Tools",
    items: [
      { label: "Doc Scanner", desc: "Scan & upload", icon: <ScanLine className="w-5 h-5" /> },
      { label: "Project Debrief", desc: "Post-mortems", icon: <FileText className="w-5 h-5" /> },
      { label: "Performance", desc: "KPI dashboards", icon: <BarChart3 className="w-5 h-5" /> },
      { label: "Reviews", desc: "Team feedback", icon: <Star className="w-5 h-5" /> },
    ],
  },
];

export default function MorePage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  const q = search.toLowerCase().trim();
  const filtered = q
    ? sections
        .map((s) => ({
          ...s,
          items: s.items.filter(
            (item) =>
              item.label.toLowerCase().includes(q) ||
              item.desc.toLowerCase().includes(q)
          ),
        }))
        .filter((s) => s.items.length > 0)
    : sections;

  const totalBadges = sections.reduce(
    (sum, s) => sum + s.items.reduce((a, i) => a + (i.badge ?? 0), 0),
    0
  );

  return (
    <div className="px-4 py-4 max-w-lg lg:max-w-5xl xl:max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">All Modules</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {sections.reduce((a, s) => a + s.items.length, 0)} modules across {sections.length} categories
            {totalBadges > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-brand-blue font-semibold">
                <Sparkles className="w-3 h-3" />
                {totalBadges} pending
              </span>
            )}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue bg-white"
          />
        </div>
      </div>

      {/* Sections grid — masonry-like with auto rows */}
      <div className="columns-1 lg:columns-2 xl:columns-3 gap-4 lg:gap-5">
        {filtered.map((section) => {
          const theme = themes[section.title] ?? fallbackTheme;

          return (
            <div
              key={section.title}
              className="break-inside-avoid mb-4 lg:mb-5"
            >
              {/* Section header */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className={`w-1.5 h-5 rounded-full ${theme.badge}`} />
                <h2 className="text-sm font-semibold text-gray-700">{section.title}</h2>
                <span className="text-[10px] text-gray-400 font-medium">{section.items.length}</span>
              </div>

              {/* Items — tile grid on desktop, list on mobile */}
              {/* Mobile: stacked list */}
              <div className="lg:hidden bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                {section.items.map((item) => {
                  const inner = (
                    <>
                      <span className={`flex items-center justify-center w-9 h-9 rounded-lg ${theme.iconBg} ${theme.iconText}`}>
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-[11px] text-gray-400 leading-tight">{item.desc}</p>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`min-w-[1.25rem] h-5 px-1.5 rounded-full ${theme.badge} text-white text-[11px] font-bold flex items-center justify-center`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  );

                  if (item.href) {
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 px-3.5 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        {inner}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={item.label}
                      className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                    >
                      {inner}
                    </button>
                  );
                })}
              </div>

              {/* Desktop: icon tile grid */}
              <div className="hidden lg:grid grid-cols-2 gap-2">
                {section.items.map((item) => {
                  const tileContent = (
                    <div className={`relative flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group`}>
                      <span className={`flex items-center justify-center w-10 h-10 rounded-xl ${theme.iconBg} ${theme.iconText} shrink-0 group-hover:scale-105 transition-transform`}>
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm font-medium text-gray-900 leading-tight">{item.label}</p>
                        <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{item.desc}</p>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`absolute top-2 right-2 min-w-[1.25rem] h-5 px-1.5 rounded-full ${theme.badge} text-white text-[10px] font-bold flex items-center justify-center`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  );

                  if (item.href) {
                    return (
                      <Link key={item.label} href={item.href}>
                        {tileContent}
                      </Link>
                    );
                  }

                  return (
                    <div key={item.label}>
                      {tileContent}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty search state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No modules matching &ldquo;{search}&rdquo;</p>
          <button
            onClick={() => setSearch("")}
            className="mt-2 text-xs text-brand-blue font-medium hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* App version */}
      <p className="text-center text-[11px] text-gray-300 pt-6 pb-4">
        NSEC Employee Portal v2.0 · National Stage Equipment Company
      </p>
    </div>
  );
}
