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

export default function PipelinePage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<StageFilter>("all");
  const [search, setSearch] = useState("");
  const { data: projects, loading, error } = useMondayData<Project[]>("projects");

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  if (error) {
    return (
      <div className="px-4 py-16 max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto text-center">
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
      <div className="px-4 py-16 max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto text-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading pipeline...</p>
      </div>
    );
  }

  const activeProjects = projects.filter((p) => p.group !== "COMPLETE / TO ARCHIVE");

  const filtered = filter === "all"
    ? activeProjects
    : activeProjects.filter((p) => STAGE_MAP[filter].includes(p.group));

  const searchFiltered = search.trim()
    ? filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.companyName ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : filtered;

  const stageCounts = stageOptions.reduce((acc, opt) => {
    if (opt.value === "all") {
      acc[opt.value] = activeProjects.length;
    } else {
      acc[opt.value] = activeProjects.filter((p) => STAGE_MAP[opt.value].includes(p.group)).length;
    }
    return acc;
  }, {} as Record<StageFilter, number>);

  return (
    <div className="px-4 lg:px-6 py-5 max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Pipeline</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track and manage sales opportunities</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search opportunities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Tab filters */}
      <div className="tab-bar mb-5 -mx-4 px-4 lg:mx-0 lg:px-0 no-scrollbar">
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

      {/* Section header */}
      <h2 className="text-base font-bold text-gray-900 tracking-tight mb-3">
        {stageOptions.find((o) => o.value === filter)?.label ?? "All Opportunities"}
      </h2>

      {/* Opportunity list */}
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

              {project.projectManager && (
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[9px] font-semibold flex items-center justify-center">
                  {getInitials(project.projectManager)}
                </div>
              )}

              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap border ${stageBadge(project.group)}`}>
                {stageLabel(project.group)}
              </span>
            </div>
          </div>
        ))}
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
