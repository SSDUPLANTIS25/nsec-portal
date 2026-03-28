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
      <div className="px-4 py-12 max-w-lg mx-auto text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 mb-1">Monday.com Not Connected</h2>
        <p className="text-sm text-gray-500">Set the MONDAY_API_KEY environment variable to connect your NSEC workspace.</p>
      </div>
    );
  }

  if (loading || !projects) {
    return (
      <div className="px-4 py-12 max-w-lg mx-auto text-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading pipeline from Monday.com...</p>
      </div>
    );
  }

  // Exclude archived
  const activeProjects = projects.filter((p) => p.group !== "COMPLETE / TO ARCHIVE");

  const filtered = filter === "all"
    ? activeProjects
    : activeProjects.filter((p) => STAGE_MAP[filter].includes(p.group));

  // Apply search
  const searchFiltered = search.trim()
    ? filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.companyName ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : filtered;

  // Stage counts for tabs
  const stageCounts = stageOptions.reduce((acc, opt) => {
    if (opt.value === "all") {
      acc[opt.value] = activeProjects.length;
    } else {
      acc[opt.value] = activeProjects.filter((p) => STAGE_MAP[opt.value].includes(p.group)).length;
    }
    return acc;
  }, {} as Record<StageFilter, number>);

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track and manage sales opportunities</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search opportunities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
        />
      </div>

      {/* Tab filters matching Replit: All Opportunities (6), Qualified (2), Proposal (2), Negotiation (2), Won (0) */}
      <div className="flex border-b border-gray-200 mb-4 -mx-4 px-4 no-scrollbar overflow-x-auto">
        {stageOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`relative px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
              filter === opt.value ? "text-brand-blue" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {opt.label} ({stageCounts[opt.value]})
            {filter === opt.value && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-blue rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Section header */}
      <h2 className="text-base font-bold text-gray-900 mb-3">
        {stageOptions.find((o) => o.value === filter)?.label ?? "All Opportunities"}
      </h2>

      {/* Opportunity list — matching Replit style */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
        {searchFiltered.map((project) => (
          <div key={project.id} className="px-4 py-3.5 flex items-center gap-3">
            {/* Blue dot */}
            <span className="w-2 h-2 rounded-full bg-brand-blue shrink-0" />

            {/* Name + company + date */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{project.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {project.companyName ?? ""}
                {project.installWindow?.from && (
                  <> · <Calendar className="w-3 h-3 inline -mt-0.5" /> {formatDate(project.installWindow.from)}</>
                )}
              </p>
            </div>

            {/* Right: dollar, probability, avatar, stage badge */}
            <div className="flex items-center gap-2 shrink-0">
              {project.totalPrice && project.totalPrice > 0 && (
                <span className="flex items-center gap-0.5 text-xs font-semibold text-gray-700">
                  <DollarSign className="w-3 h-3 text-emerald-500" />
                  {formatCurrency(project.totalPrice)}
                </span>
              )}

              {/* PM initials avatar */}
              {project.projectManager && (
                <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-[9px] font-bold flex items-center justify-center">
                  {getInitials(project.projectManager)}
                </div>
              )}

              {/* Stage badge */}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${stageBadge(project.group)}`}>
                {stageLabel(project.group)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {searchFiltered.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No opportunities in this stage</p>
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

function stageBadge(group: string) {
  switch (group) {
    case "SITE SURVEY": return "bg-emerald-100 text-emerald-700";
    case "PROPOSAL FOLLOW UP TO CLOSE": return "bg-orange-100 text-orange-700";
    case "CLOSE": return "bg-amber-100 text-amber-700";
    case "RELEASED": return "bg-blue-100 text-blue-700";
    case "Submitted for Production": return "bg-green-100 text-green-700";
    default: return "bg-gray-100 text-gray-600";
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
