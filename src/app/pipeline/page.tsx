"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMondayData } from "@/lib/use-monday-data";
import type { Project } from "@/lib/monday-types";
import {
  AlertTriangle,
  DollarSign,
  TrendingUp,
  User,
  Target,
  Calendar,
  Search,
  ArrowUpDown,
  ArrowUpRight,
} from "lucide-react";

type StageFilter = "all" | "survey" | "proposal" | "close" | "released" | "production";

const STAGE_MAP: Record<StageFilter, string[]> = {
  all: [],
  survey: ["SITE SURVEY"],
  proposal: ["PROPOSAL FOLLOW UP TO CLOSE"],
  close: ["CLOSE"],
  released: ["RELEASED"],
  production: ["Submitted for Production"],
};

const stageOptions: { value: StageFilter; label: string }[] = [
  { value: "all", label: "All Opportunities" },
  { value: "survey", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "close", label: "Negotiation" },
  { value: "released", label: "Won" },
];

type SortField = "name" | "company" | "value" | "stage" | "date";
type SortDir = "asc" | "desc";

export default function PipelinePage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<StageFilter>("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("value");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const { data: projects, loading, error } = useMondayData<Project[]>("projects");

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  if (error) {
    return (
      <div className="px-4 py-16 max-w-lg lg:max-w-none mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Monday.com Not Connected</h2>
        <p className="text-sm text-gray-500">Set the MONDAY_API_KEY environment variable to connect your NSEC workspace.</p>
      </div>
    );
  }

  if (loading || !projects) {
    return (
      <div className="px-4 py-16 max-w-lg lg:max-w-none mx-auto text-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading pipeline...</p>
      </div>
    );
  }

  const activeProjects = projects.filter((p) => p.group !== "COMPLETE / TO ARCHIVE");

  const filtered = filter === "all"
    ? activeProjects
    : activeProjects.filter((p) => STAGE_MAP[filter].includes(p.group));

  let searchFiltered = search.trim()
    ? filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.companyName ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : filtered;

  // Sort for desktop
  searchFiltered = [...searchFiltered].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortField) {
      case "name": return a.name.localeCompare(b.name) * dir;
      case "company": return (a.companyName ?? "").localeCompare(b.companyName ?? "") * dir;
      case "value": return ((a.totalPrice ?? 0) - (b.totalPrice ?? 0)) * dir;
      case "stage": return stageOrder(a.group) - stageOrder(b.group) * dir;
      case "date":
        if (!a.installWindow?.from) return 1;
        if (!b.installWindow?.from) return -1;
        return (new Date(a.installWindow.from).getTime() - new Date(b.installWindow.from).getTime()) * dir;
      default: return 0;
    }
  });

  const stageCounts = stageOptions.reduce((acc, opt) => {
    if (opt.value === "all") {
      acc[opt.value] = activeProjects.length;
    } else {
      acc[opt.value] = activeProjects.filter((p) => STAGE_MAP[opt.value].includes(p.group)).length;
    }
    return acc;
  }, {} as Record<StageFilter, number>);

  const totalValue = activeProjects.reduce((sum, p) => sum + (p.totalPrice ?? 0), 0);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir(field === "value" ? "desc" : "asc"); }
  };

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-lg lg:max-w-none mx-auto">
      {/* Page Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage sales opportunities</p>
        </div>
        <div className="hidden lg:flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">Total Pipeline Value</p>
            <p className="text-lg font-bold text-gray-900 tracking-tight">{formatCurrency(totalValue)}</p>
          </div>
        </div>
      </div>

      {/* Search + Tabs row */}
      <div className="lg:flex lg:items-center lg:gap-4 mb-4 space-y-3 lg:space-y-0">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="tab-bar lg:border-0 -mx-4 px-4 lg:mx-0 lg:px-0 no-scrollbar">
          {stageOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`tab-item ${filter === opt.value ? "active" : ""}`}
            >
              {opt.label} ({stageCounts[opt.value]})
            </button>
          ))}
        </div>
      </div>

      {/* ===== Mobile: Card list ===== */}
      <div className="lg:hidden">
        <h2 className="text-base font-bold text-gray-900 tracking-tight mb-3">
          {stageOptions.find((o) => o.value === filter)?.label ?? "All Opportunities"}
        </h2>
        <div className="card overflow-hidden divide-y divide-border-light">
          {searchFiltered.map((project) => (
            <div key={project.id} className="px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
              <span className={`w-2 h-2 rounded-full shrink-0 ${stageDotColor(project.group)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{project.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {project.companyName ?? ""}
                  {project.installWindow?.from && (
                    <> · <Calendar className="w-3 h-3 inline -mt-0.5" /> {formatDate(project.installWindow.from)}</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                {project.totalPrice && project.totalPrice > 0 && (
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-gray-700">
                    <DollarSign className="w-3 h-3 text-emerald-500" />
                    {formatCurrency(project.totalPrice)}
                  </span>
                )}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap border ${stageBadge(project.group)}`}>
                  {stageLabel(project.group)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Desktop: Table view ===== */}
      <div className="hidden lg:block">
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                <th className="w-8 px-4 py-3" />
                <th className="text-left px-4 py-3 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => toggleSort("name")}>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider inline-flex items-center gap-1">
                    Opportunity {sortField === "name" && <ArrowUpDown className="w-3 h-3" />}
                  </span>
                </th>
                <th className="text-left px-4 py-3 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => toggleSort("company")}>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider inline-flex items-center gap-1">
                    Company {sortField === "company" && <ArrowUpDown className="w-3 h-3" />}
                  </span>
                </th>
                <th className="text-left px-4 py-3">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Stage</span>
                </th>
                <th className="text-right px-4 py-3 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => toggleSort("value")}>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider inline-flex items-center gap-1 justify-end">
                    Value {sortField === "value" && <ArrowUpDown className="w-3 h-3" />}
                  </span>
                </th>
                <th className="text-left px-4 py-3">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">PM</span>
                </th>
                <th className="text-left px-4 py-3 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => toggleSort("date")}>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider inline-flex items-center gap-1">
                    Install Date {sortField === "date" && <ArrowUpDown className="w-3 h-3" />}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {searchFiltered.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 py-3">
                    <span className={`w-2 h-2 rounded-full block ${stageDotColor(project.group)}`} />
                  </td>
                  <td className="px-4 py-3 max-w-[280px]">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-blue transition-colors">{project.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500 truncate block max-w-[180px]">{project.companyName ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap border ${stageBadge(project.group)}`}>
                      {stageLabel(project.group)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {project.totalPrice && project.totalPrice > 0 ? (
                      <span className="text-sm font-semibold text-gray-700">{formatCurrency(project.totalPrice)}</span>
                    ) : (
                      <span className="text-sm text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {project.projectManager ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[9px] font-semibold flex items-center justify-center">
                          {getInitials(project.projectManager)}
                        </div>
                        <span className="text-sm text-gray-500 truncate max-w-[100px]">{project.projectManager}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">
                      {project.installWindow?.from ? formatDate(project.installWindow.from) : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {searchFiltered.length === 0 && (
        <div className="empty-state">
          <Target className="empty-icon" />
          <p className="empty-text">No opportunities in this stage</p>
        </div>
      )}
    </div>
  );
}

function formatCurrency(amount: number) {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
  return `$${amount.toLocaleString()}`;
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string) {
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function stageOrder(group: string) {
  switch (group) {
    case "SITE SURVEY": return 0;
    case "PROPOSAL FOLLOW UP TO CLOSE": return 1;
    case "CLOSE": return 2;
    case "RELEASED": return 3;
    case "Submitted for Production": return 4;
    default: return 5;
  }
}

function stageDotColor(group: string) {
  switch (group) {
    case "SITE SURVEY": return "bg-emerald-500";
    case "PROPOSAL FOLLOW UP TO CLOSE": return "bg-orange-500";
    case "CLOSE": return "bg-amber-500";
    case "RELEASED": return "bg-blue-500";
    case "Submitted for Production": return "bg-green-500";
    default: return "bg-gray-400";
  }
}

function stageBadge(group: string) {
  switch (group) {
    case "SITE SURVEY": return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "PROPOSAL FOLLOW UP TO CLOSE": return "bg-orange-50 text-orange-700 border-orange-100";
    case "CLOSE": return "bg-amber-50 text-amber-700 border-amber-100";
    case "RELEASED": return "bg-blue-50 text-blue-700 border-blue-100";
    case "Submitted for Production": return "bg-green-50 text-green-700 border-green-100";
    default: return "bg-gray-50 text-gray-600 border-gray-100";
  }
}

function stageLabel(group: string) {
  switch (group) {
    case "SITE SURVEY": return "Qualified";
    case "PROPOSAL FOLLOW UP TO CLOSE": return "Proposal";
    case "CLOSE": return "Negotiation";
    case "RELEASED": return "Won";
    case "Submitted for Production": return "Production";
    default: return group;
  }
}
