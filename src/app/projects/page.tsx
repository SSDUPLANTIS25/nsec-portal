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
        <p className="text-sm text-gray-500">Loading projects...</p>
      </div>
    );
  }

  const activeCount = projects.filter((p) => ACTIVE_GROUPS.includes(p.group)).length;
  const completedCount = projects.filter((p) => COMPLETED_GROUPS.includes(p.group)).length;
  const onHoldCount = 0;
  const totalBudget = projects.reduce((sum, p) => sum + (p.totalPrice ?? 0), 0);

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

  const groupMap = new Map<string, Project[]>();
  for (const p of filtered) {
    const list = groupMap.get(p.group) ?? [];
    list.push(p);
    groupMap.set(p.group, list);
  }

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-lg lg:max-w-none mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Projects</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage all your stage equipment projects</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Active" value={activeCount} icon={<Clock className="w-5 h-5" />} colorBg="bg-blue-50" colorText="text-blue-700" colorIcon="text-blue-400" />
        <StatCard label="Completed" value={completedCount} icon={<CheckCircle2 className="w-5 h-5" />} colorBg="bg-emerald-50" colorText="text-emerald-700" colorIcon="text-emerald-400" />
        <StatCard label="On Hold" value={onHoldCount} icon={<Pause className="w-5 h-5" />} colorBg="bg-amber-50" colorText="text-amber-700" colorIcon="text-amber-400" />
        <StatCard label="Total Budget" value={formatCurrency(totalBudget)} icon={<DollarSign className="w-5 h-5" />} colorBg="bg-purple-50" colorText="text-purple-700" colorIcon="text-purple-400" isString />
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Tab bar */}
      <div className="tab-bar mb-5 -mx-4 px-4 lg:mx-0 lg:px-0 no-scrollbar">
        {([
          { value: "by_phase" as const, label: "By Phase" },
          { value: "all" as const, label: "All Projects" },
          { value: "active" as const, label: "Active" },
          { value: "completed" as const, label: "Completed" },
        ]).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`tab-item ${filter === tab.value ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Project groups */}
      <div className="space-y-6">
        {Array.from(groupMap.entries()).map(([group, groupProjects]) => (
          <div key={group}>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-brand-blue" />
                <h3 className="text-sm font-semibold text-gray-700">{group}</h3>
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                {groupProjects.length}
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 lg:gap-3">
              {groupProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state">
            <Briefcase className="empty-icon" />
            <p className="empty-text">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, colorBg, colorText, colorIcon, isString }: {
  label: string; value: number | string; icon: React.ReactNode;
  colorBg: string; colorText: string; colorIcon: string; isString?: boolean;
}) {
  return (
    <div className={`${colorBg} rounded-xl p-3.5 stat-card`}>
      <div>
        <p className={`text-xs ${colorText} font-medium opacity-80`}>{label}</p>
        <p className={`text-2xl font-bold ${colorText} tracking-tight mt-0.5`}>{isString ? value : value}</p>
      </div>
      <span className={colorIcon}>{icon}</span>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const hasPrice = project.totalPrice && project.totalPrice > 0;
  const hasBalance = project.balance !== undefined && project.balance > 0;
  const progress = hasPrice && hasBalance ? Math.round(((project.totalPrice! - project.balance!) / project.totalPrice!) * 100) : undefined;

  return (
    <div className="card p-3.5 flex flex-col card-hover">
      <p className="text-sm font-medium text-gray-900 leading-tight mb-0.5">{project.name}</p>
      {project.companyName && (
        <p className="text-[11px] text-gray-500 mb-2">{project.companyName}</p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2.5">
        {project.currentStage && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
            {project.currentStage}
          </span>
        )}
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-gray-50 text-gray-500 border border-gray-100">
          {project.group}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-gray-400">Progress</span>
          <span className="text-[11px] font-semibold text-gray-600">{progress ?? 0}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${Math.min(progress ?? 0, 100)}%` }} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-auto">
        {hasPrice && (
          <span className="flex items-center gap-0.5">
            <DollarSign className="w-3 h-3" />
            {formatCurrency(project.totalPrice!)}
          </span>
        )}
        {project.installWindow?.from && (
          <span>{new Date(project.installWindow.from + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        )}
      </div>

      <button className="mt-2.5 text-[12px] font-medium text-brand-blue border border-blue-200 rounded-lg py-1.5 text-center hover:bg-blue-50 transition-colors">
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
