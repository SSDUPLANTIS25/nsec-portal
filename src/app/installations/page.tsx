"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMondayData } from "@/lib/use-monday-data";
import type { Installation } from "@/lib/monday-types";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  User,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type StatusFilter = "all" | "active" | "phase_done" | "complete";

export default function InstallationsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const { data: installations, loading, error } = useMondayData<Installation[]>("installations");

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

  if (loading || !installations) {
    return (
      <div className="px-4 py-12 max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto text-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading installations from Monday.com...</p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  // Counts
  const active = installations.filter((i) => i.jobStatus === "In Progress");
  const phaseDone = installations.filter((i) => i.jobStatus === "Phase Done");
  const complete = installations.filter((i) => i.jobStatus === "Totally Complete");
  const overdue = installations.filter((i) => {
    if (i.jobStatus === "Totally Complete" || !i.date) return false;
    return new Date(i.date) < new Date(today);
  });

  // Apply filter
  let filtered = installations;
  if (filter === "active") filtered = active;
  else if (filter === "phase_done") filtered = phaseDone;
  else if (filter === "complete") filtered = complete;

  // Sort by date (upcoming first)
  filtered = [...filtered].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Total crew hours
  const totalHours = installations.reduce((sum, i) => sum + (i.totalHours ?? 0), 0);

  return (
    <div className="px-4 py-4 max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold text-gray-900">Installations</h1>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <StatusCard
          icon={<Wrench className="w-4 h-4" />}
          count={active.length}
          label="Active"
          color="text-blue-600 bg-blue-50"
        />
        <StatusCard
          icon={<Clock className="w-4 h-4" />}
          count={phaseDone.length}
          label="Phase Done"
          color="text-amber-600 bg-amber-50"
        />
        <StatusCard
          icon={<CheckCircle2 className="w-4 h-4" />}
          count={complete.length}
          label="Complete"
          color="text-emerald-600 bg-emerald-50"
        />
        <StatusCard
          icon={<AlertTriangle className="w-4 h-4" />}
          count={overdue.length}
          label="Overdue"
          color={overdue.length > 0 ? "text-red-600 bg-red-50" : "text-gray-500 bg-gray-100"}
        />
      </div>

      {/* Utilization bar */}
      {totalHours > 0 && (
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 font-medium">Total Crew Hours</span>
            <span className="text-sm font-bold text-gray-900">{totalHours.toLocaleString()} hrs</span>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
        {([
          { value: "all" as const, label: "All", count: installations.length },
          { value: "active" as const, label: "In Progress", count: active.length },
          { value: "phase_done" as const, label: "Phase Done", count: phaseDone.length },
          { value: "complete" as const, label: "Complete", count: complete.length },
        ]).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
              filter === opt.value
                ? "bg-brand-blue text-white"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            {opt.label}
            <span className="text-[10px] opacity-70">{opt.count}</span>
          </button>
        ))}
      </div>

      {/* Installation list */}
      <div className="space-y-2 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-3 lg:space-y-0">
        {filtered.map((install) => {
          const isOverdue = install.jobStatus !== "Totally Complete" && install.date && new Date(install.date) < new Date(today);

          return (
            <div
              key={install.id}
              className={`bg-white rounded-xl p-4 border shadow-sm ${
                isOverdue ? "border-red-200 bg-red-50/30" : "border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${jobStatusDot(install.jobStatus)}`} />
                    <span className={`text-[10px] font-semibold uppercase ${jobStatusText(install.jobStatus)}`}>
                      {install.jobStatus}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">OVERDUE</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{install.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                {install.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(install.date)}
                  </span>
                )}
                {install.projectManager && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {install.projectManager}
                  </span>
                )}
                {install.crewSize && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {install.crewSize} crew
                  </span>
                )}
                {install.totalHours && (
                  <span>{install.totalHours}h</span>
                )}
              </div>

              {/* Scores */}
              {(install.pmScore || install.productionRating) && (
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-50">
                  {install.pmScore !== undefined && (
                    <span className="text-[10px] text-gray-500">PM Score: <span className="font-semibold text-gray-700">{install.pmScore}</span></span>
                  )}
                  {install.productionRating !== undefined && (
                    <span className="text-[10px] text-gray-500">Rating: <span className="font-semibold text-gray-700">{install.productionRating}</span></span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No installations in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusCard({ icon, count, label, color }: { icon: React.ReactNode; count: number; label: string; color: string }) {
  return (
    <div className={`flex flex-col items-center py-2.5 rounded-xl ${color}`}>
      {icon}
      <span className="text-lg font-bold mt-0.5">{count}</span>
      <span className="text-[10px] font-medium opacity-70">{label}</span>
    </div>
  );
}

function formatDate(d: string) {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function jobStatusDot(status: string) {
  switch (status) {
    case "In Progress": return "bg-blue-500";
    case "Phase Done": return "bg-amber-500";
    case "Totally Complete": return "bg-emerald-500";
    default: return "bg-gray-400";
  }
}

function jobStatusText(status: string) {
  switch (status) {
    case "In Progress": return "text-blue-500";
    case "Phase Done": return "text-amber-500";
    case "Totally Complete": return "text-emerald-500";
    default: return "text-gray-400";
  }
}
