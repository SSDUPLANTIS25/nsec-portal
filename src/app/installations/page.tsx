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
      <div className="px-4 py-16 max-w-lg lg:max-w-none mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Monday.com Not Connected</h2>
        <p className="text-sm text-gray-500">Set the MONDAY_API_KEY environment variable to connect your NSEC workspace.</p>
      </div>
    );
  }

  if (loading || !installations) {
    return (
      <div className="px-4 py-16 max-w-lg lg:max-w-none mx-auto text-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading installations...</p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const active = installations.filter((i) => i.jobStatus === "In Progress");
  const phaseDone = installations.filter((i) => i.jobStatus === "Phase Done");
  const complete = installations.filter((i) => i.jobStatus === "Totally Complete");
  const overdue = installations.filter((i) => {
    if (i.jobStatus === "Totally Complete" || !i.date) return false;
    return new Date(i.date) < new Date(today);
  });

  let filtered = installations;
  if (filter === "active") filtered = active;
  else if (filter === "phase_done") filtered = phaseDone;
  else if (filter === "complete") filtered = complete;

  filtered = [...filtered].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const totalHours = installations.reduce((sum, i) => sum + (i.totalHours ?? 0), 0);

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-lg lg:max-w-none mx-auto">
      <div className="mb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Installations</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track crew dispatch and installation progress</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <StatusCard icon={<Wrench className="w-4 h-4" />} count={active.length} label="Active" colorBg="bg-blue-50" colorText="text-blue-600" />
        <StatusCard icon={<Clock className="w-4 h-4" />} count={phaseDone.length} label="Phase Done" colorBg="bg-amber-50" colorText="text-amber-600" />
        <StatusCard icon={<CheckCircle2 className="w-4 h-4" />} count={complete.length} label="Complete" colorBg="bg-emerald-50" colorText="text-emerald-600" />
        <StatusCard icon={<AlertTriangle className="w-4 h-4" />} count={overdue.length} label="Overdue" colorBg={overdue.length > 0 ? "bg-red-50" : "bg-gray-50"} colorText={overdue.length > 0 ? "text-red-600" : "text-gray-400"} />
      </div>

      {/* Crew hours bar */}
      {totalHours > 0 && (
        <div className="card p-3.5 mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">Total Crew Hours</span>
          <span className="text-sm font-bold text-gray-900">{totalHours.toLocaleString()} hrs</span>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {([
          { value: "all" as const, label: "All", count: installations.length },
          { value: "active" as const, label: "In Progress", count: active.length },
          { value: "phase_done" as const, label: "Phase Done", count: phaseDone.length },
          { value: "complete" as const, label: "Complete", count: complete.length },
        ]).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all border ${
              filter === opt.value
                ? "bg-brand-blue text-white border-brand-blue shadow-sm"
                : "bg-white text-gray-600 border-border hover:bg-gray-50"
            }`}
          >
            {opt.label}
            <span className={`text-[10px] ${filter === opt.value ? "text-blue-200" : "text-gray-400"}`}>{opt.count}</span>
          </button>
        ))}
      </div>

      {/* Installation cards */}
      <div className="space-y-2.5 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-3 lg:space-y-0">
        {filtered.map((install) => {
          const isOverdue = install.jobStatus !== "Totally Complete" && install.date && new Date(install.date) < new Date(today);

          return (
            <div
              key={install.id}
              className={`card p-4 card-hover ${isOverdue ? "!border-red-200 !bg-red-50/30" : ""}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${jobStatusDot(install.jobStatus)}`} />
                    <span className={`text-[11px] font-semibold uppercase tracking-wide ${jobStatusText(install.jobStatus)}`}>
                      {install.jobStatus}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100">OVERDUE</span>
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

              {(install.pmScore || install.productionRating) && (
                <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-border-light">
                  {install.pmScore !== undefined && (
                    <span className="text-[11px] text-gray-500">PM Score: <span className="font-semibold text-gray-700">{install.pmScore}</span></span>
                  )}
                  {install.productionRating !== undefined && (
                    <span className="text-[11px] text-gray-500">Rating: <span className="font-semibold text-gray-700">{install.productionRating}</span></span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state col-span-full">
            <Wrench className="empty-icon" />
            <p className="empty-text">No installations in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusCard({ icon, count, label, colorBg, colorText }: {
  icon: React.ReactNode; count: number; label: string; colorBg: string; colorText: string;
}) {
  return (
    <div className={`flex flex-col items-center py-3 rounded-xl ${colorBg} border border-transparent`}>
      <span className={colorText}>{icon}</span>
      <span className={`text-lg font-bold mt-1 tracking-tight ${colorText}`}>{count}</span>
      <span className={`text-[10px] font-medium ${colorText} opacity-70`}>{label}</span>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
