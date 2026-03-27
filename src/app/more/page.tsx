"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
  ChevronRight,
} from "lucide-react";

interface NavSection {
  title: string;
  items: { label: string; icon: React.ReactNode; badge?: number }[];
}

const sections: NavSection[] = [
  {
    title: "My Work",
    items: [
      { label: "Tasks", icon: <CheckSquare className="w-5 h-5" /> },
      { label: "Calendar", icon: <Calendar className="w-5 h-5" /> },
      { label: "Projects", icon: <Briefcase className="w-5 h-5" /> },
      { label: "Routes", icon: <MapPin className="w-5 h-5" /> },
      { label: "Installations", icon: <Wrench className="w-5 h-5" /> },
    ],
  },
  {
    title: "Communication",
    items: [
      { label: "Email", icon: <Mail className="w-5 h-5" />, badge: 3 },
      { label: "Mentions", icon: <Target className="w-5 h-5" />, badge: 2 },
      { label: "SMS", icon: <MessageSquare className="w-5 h-5" />, badge: 3 },
      { label: "Team Chat", icon: <Users className="w-5 h-5" />, badge: 7 },
      { label: "Phone", icon: <Phone className="w-5 h-5" />, badge: 1 },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Production", icon: <Factory className="w-5 h-5" /> },
      { label: "Procurement", icon: <ShoppingCart className="w-5 h-5" /> },
      { label: "Vendors", icon: <Truck className="w-5 h-5" /> },
      { label: "Cost Master", icon: <BarChart3 className="w-5 h-5" /> },
    ],
  },
  {
    title: "Clients & Sales",
    items: [
      { label: "Clients", icon: <Users className="w-5 h-5" /> },
      { label: "Leads", icon: <Target className="w-5 h-5" /> },
      { label: "Customer Portal", icon: <Globe className="w-5 h-5" /> },
      { label: "Campaigns", icon: <Megaphone className="w-5 h-5" /> },
      { label: "Orders", icon: <ClipboardList className="w-5 h-5" />, badge: 5 },
    ],
  },
  {
    title: "Finance & Admin",
    items: [
      { label: "Bills", icon: <Receipt className="w-5 h-5" /> },
      { label: "Payroll", icon: <DollarSign className="w-5 h-5" /> },
      { label: "Mileage & Reimbursements", icon: <Car className="w-5 h-5" /> },
      { label: "CC Expenses", icon: <CreditCard className="w-5 h-5" /> },
      { label: "Receivables", icon: <DollarSign className="w-5 h-5" /> },
    ],
  },
  {
    title: "HR & Compliance",
    items: [
      { label: "Training", icon: <GraduationCap className="w-5 h-5" /> },
      { label: "Recruiting", icon: <UserPlus className="w-5 h-5" /> },
      { label: "Compliance", icon: <ShieldCheck className="w-5 h-5" /> },
      { label: "eSignatures", icon: <PenTool className="w-5 h-5" /> },
    ],
  },
  {
    title: "Tools",
    items: [
      { label: "Doc Scanner", icon: <ScanLine className="w-5 h-5" /> },
      { label: "Project Debrief", icon: <FileText className="w-5 h-5" /> },
      { label: "Performance", icon: <BarChart3 className="w-5 h-5" /> },
      { label: "Reviews", icon: <Star className="w-5 h-5" /> },
    ],
  },
];

export default function MorePage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-5">
      <h1 className="text-xl font-bold text-gray-900">More</h1>

      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 px-1">
            {section.title}
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {section.items.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <span className="text-gray-400">{item.icon}</span>
                <span className="flex-1 text-sm font-medium text-gray-900 text-left">{item.label}</span>
                {item.badge && (
                  <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-brand-blue text-white text-[11px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* App version */}
      <p className="text-center text-[11px] text-gray-300 pt-2 pb-4">
        NSEC Employee Portal v1.0 &middot; National Stage Equipment Company
      </p>
    </div>
  );
}
