"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { tasks } from "@/lib/mock-data";
import { AlertTriangle, Eye, EyeOff, Clock, CheckCircle2, Filter } from "lucide-react";

type StatusFilter = "all" | "overdue" | "not_viewed" | "in_progress" | "pending" | "complete";

const filterOptions: { value: StatusFilter; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "all", label: "All", icon: null, color: "bg-gray-100 text-gray-700" },
  { value: "overdue", label: "Overdue", icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "bg-red-100 text-red-700" },
  { value: "not_viewed", label: "New", icon: <EyeOff className="w-3.5 h-3.5" />, color: "bg-blue-100 text-blue-700" },
  { value: "in_progress", label: "Active", icon: <Eye className="w-3.5 h-3.5" />, color: "bg-emerald-100 text-emerald-700" },
  { value: "pending", label: "Pending", icon: <Clock className="w-3.5 h-3.5" />, color: "bg-amber-100 text-amber-700" },
  { value: "complete", label: "Done", icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "bg-gray-100 text-gray-500" },
];

export default function TasksPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 no-scrollbar">
        {filterOptions.map((opt) => {
          const active = filter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                active
                  ? opt.color + " ring-1 ring-current/20"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {opt.icon}
              {opt.label}
              {opt.value !== "all" && (
                <span className="ml-0.5 text-[10px] opacity-70">
                  {tasks.filter((t) => t.status === opt.value).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm active:scale-[0.99] transition-transform"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot(task.status)}`} />
                  <span className={`text-[11px] font-medium uppercase ${statusText(task.status)}`}>
                    {task.status.replace("_", " ")}
                  </span>
                  {task.priority === "high" && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">HIGH</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{task.project}</span>
                  <span>&middot;</span>
                  <span>Due {formatDate(task.dueDate)}</span>
                </div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-400">{task.assignee}</span>
              <button className="text-xs text-brand-blue font-medium">View</button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No tasks in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function statusDot(status: string) {
  switch (status) {
    case "overdue": return "bg-red-500";
    case "not_viewed": return "bg-blue-500";
    case "in_progress": return "bg-emerald-500";
    case "pending": return "bg-amber-500";
    case "complete": return "bg-gray-400";
    default: return "bg-gray-300";
  }
}

function statusText(status: string) {
  switch (status) {
    case "overdue": return "text-red-500";
    case "not_viewed": return "text-blue-500";
    case "in_progress": return "text-emerald-500";
    case "pending": return "text-amber-500";
    case "complete": return "text-gray-400";
    default: return "text-gray-400";
  }
}

function formatDate(d: string) {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
