"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMondayData } from "@/lib/use-monday-data";
import type { Project } from "@/lib/monday-types";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Pause,
  Search,
} from "lucide-react";

type PhaseFilter = "by_phase" | "all" | "active" | "completed";

const ACTIVE_GROUPS = ["RELEASED", "Submitted for Production"];
const PIPELINE_GROUPS = ["PROPOSAL FOLLOW UP TO CLOSE", "SITE SURVEY", "CLOSE"];
const COMPLETED_GROUPS = ["COMPLETE / TO ARCHIVE"];

export default function ProjectsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<PhaseFilter>("by_phase");
  const [search, setSearch] = useState("");
  const { data: projects, loading, error } = useMondayData<Project[]>("projects");

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  if (error) {
    return (
      <div className="px-4 py-12 max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 mb-1">Monday.com Not Connected</h2>
        <p className="text-sm text-gray-500">Set the MONDAY_API_KEY environment variable to connect your NSEC workspace.</p>
      </div>
    );
  }

  if (loading || !projects) {
    return (
      <div className="px-4 py-12 max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto text-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading projects from Monday.com...</p>
      </div>
    );
  }

  // Counts
  const activeCount = projects.filter((p) => ACTIVE_GROUPS.includes(p.group)).length;
  const completedCount = projects.filter((p) => COMPLETED_GROUPS.includes(p.group)).length;
  const onHoldCount = 0; // Could be mapped to a group if needed
  const totalBudget = projects.reduce((sum, p) => sum + (p.totalPrice ?? 0), 0);

  // Filter
  let filtered = projects;
  if (filter === "active") filtered = projects.filter((p) => ACTIVE_GROUPS.includes(p.group));
  else if (filter === "completed") filtered = projects.filter((p) => COMPLETED_GROUPS.includes(p.group));

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.companyName ?? "").toLowerCase().includes(q) ||
        (p.jobNumber ?? "").toLowerCase().includes(q)
    );
  }

  // Group by phase
  const groupMap = new Map<string, Project[]>();
  for (const p of filtered) {
    const list = groupMap.get(p.group) ?? [];
    list.push(p);
    groupMap.set(p.group, list);
  }

  return (
    <div className="px-4 py-4 max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Projects</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage all your stage equipment projects</p>
        </div>
      </div>

      {/* Summary cards — large colored backgrounds like Replit */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        <div className="bg-blue-50 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-600 font-medium">Active Projects</p>
            <p className="text-2xl font-bold text-blue-700">{activeCount}</p>
          </div>
          <Clock className="w-8 h-8 text-blue-300" />
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 font-medium">Completed</p>
            <p className="text-2xl font-bold text-emerald-700">{completedCount}</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-300" />
        </div>
        <div className="bg-amber-50 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-600 font-medium">On Hold</p>
            <p className="text-2xl font-bold text-amber-700">{onHoldCount}</p>
          </div>
          <Pause className="w-8 h-8 text-amber-300" />
        </div>
        <div className="bg-purple-50 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-purple-600 font-medium">Total Budget</p>
            <p className="text-2xl font-bold text-purple-700">{formatCurrency(totalBudget)}</p>
          </div>
          <DollarSign className="w-8 h-8 text-purple-300" />
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
        />
      </div>

      {/* Tab bar like Replit: By Phase, All Projects, Active, Completed */}
      <div className="flex border-b border-gray-200 mb-4 -mx-4 px-4 no-scrollbar overflow-x-auto">
        {([
          { value: "by_phase" as const, label: "By Phase" },
          { value: "all" as const, label: "All Projects" },
          { value: "active" as const, label: "Active" },
          { value: "completed" as const, label: "Completed" },
        ]).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`relative px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
              filter === tab.value ? "text-brand-blue" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {filter === tab.value && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-blue rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Project groups */}
      <div className="space-y-6">
        {Array.from(groupMap.entries()).map(([group, groupProjects]) => (
          <div key={group}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">{group}</h3>
              </div>
              <span className="w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-500 flex items-center justify-center">
                {groupProjects.length}
              </span>
            </div>

            {/* Responsive project card grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-3">
              {groupProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const hasPrice = project.totalPrice && project.totalPrice > 0;
  const hasBalance = project.balance !== undefined && project.balance > 0;
  const progress = hasPrice && hasBalance ? Math.round(((project.totalPrice! - project.balance!) / project.totalPrice!) * 100) : undefined;

  return (
    <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm flex flex-col">
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <p className="text-sm font-medium text-gray-900 leading-tight">{project.name}</p>
      </div>
      {project.companyName && (
        <p className="text-[11px] text-gray-500 mb-2">{project.companyName}</p>
      )}

      {/* Tags row */}
      <div className="flex flex-wrap gap-1 mb-2">
        {project.currentStage && (
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
            {project.currentStage}
          </span>
        )}
        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">
          {project.group}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] text-gray-400">Progress</span>
          <span className="text-[10px] font-medium text-gray-600">{progress ?? 0}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${Math.min(progress ?? 0, 100)}%` }} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-auto">
        {hasPrice && (
          <span className="flex items-center gap-0.5">
            <DollarSign className="w-2.5 h-2.5" />
            {formatCurrency(project.totalPrice!)}
          </span>
        )}
        {project.installWindow?.from && (
          <span>{new Date(project.installWindow.from + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        )}
      </div>

      {/* View Details button */}
      <button className="mt-2 text-[11px] font-medium text-brand-blue border border-blue-200 rounded-lg py-1.5 text-center hover:bg-blue-50 transition-colors">
        View Details
      </button>
    </div>
  );
}

function formatCurrency(amount: number) {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount}`;
}
