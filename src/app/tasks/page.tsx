"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMondayData } from "@/lib/use-monday-data";
import type { Task } from "@/lib/monday-types";
import { AlertTriangle, Search, CheckCircle2, Flag, ArrowUpDown, Filter } from "lucide-react";

type StatusFilter = "all" | "today" | "upcoming" | "complete";
type SortField = "dueDate" | "priority" | "assignee" | "project";
type SortDir = "asc" | "desc";

export default function TasksPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("dueDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const { data: tasks, loading, error } = useMondayData<Task[]>("tasks");

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

  if (loading || !tasks) {
    return (
      <div className="px-4 py-16 max-w-lg lg:max-w-none mx-auto text-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading tasks...</p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter((t) => t.dueDate === today && t.status !== "complete");
  const upcomingTasks = tasks.filter((t) => t.dueDate > today && t.status !== "complete");
  const completedTasks = tasks.filter((t) => t.status === "complete");
  const activeTasks = tasks.filter((t) => t.status !== "complete");

  let filtered = tasks;
  if (filter === "today") filtered = todayTasks;
  else if (filter === "upcoming") filtered = upcomingTasks;
  else if (filter === "complete") filtered = completedTasks;

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (t) => t.title.toLowerCase().includes(q) || t.project.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q)
    );
  }

  // Sort for desktop table
  filtered = [...filtered].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortField) {
      case "dueDate":
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * dir;
      case "priority": {
        const pMap: Record<string, number> = { high: 0, medium: 1, low: 2, "": 3 };
        return ((pMap[a.priority ?? ""] ?? 3) - (pMap[b.priority ?? ""] ?? 3)) * dir;
      }
      case "assignee":
        return a.assignee.localeCompare(b.assignee) * dir;
      case "project":
        return a.project.localeCompare(b.project) * dir;
      default:
        return 0;
    }
  });

  const tabs = [
    { value: "all" as const, label: "All Tasks", count: activeTasks.length },
    { value: "today" as const, label: "Today", count: todayTasks.length },
    { value: "upcoming" as const, label: "Upcoming", count: upcomingTasks.length },
    { value: "complete" as const, label: "Completed", count: completedTasks.length },
  ];

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-lg lg:max-w-none mx-auto">
      {/* Page Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all tasks across projects</p>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400">
          <span>{filtered.length} tasks</span>
        </div>
      </div>

      {/* Search + Tabs row */}
      <div className="lg:flex lg:items-center lg:gap-4 mb-4 space-y-3 lg:space-y-0">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Tab filters */}
        <div className="tab-bar lg:border-0 -mx-4 px-4 lg:mx-0 lg:px-0 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`tab-item ${filter === tab.value ? "active" : ""}`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* ===== Mobile: Card list ===== */}
      <div className="lg:hidden">
        <div className="card overflow-hidden divide-y divide-border-light">
          {filtered.map((task) => (
            <div
              key={task.id}
              className="px-4 py-3.5 flex items-start gap-3 hover:bg-gray-50/50 transition-colors"
            >
              <div className="mt-0.5 shrink-0">
                {task.status === "complete" ? (
                  <div className="w-5 h-5 rounded-md bg-brand-blue flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                ) : (
                  <div className={`w-5 h-5 rounded-md border-2 ${
                    task.status === "overdue" ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.status === "complete" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                  {task.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {task.project} · {task.dueDate ? formatDate(task.dueDate) : "No date"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold flex items-center justify-center">
                  {getInitials(task.assignee)}
                </div>
                {task.priority && task.status !== "complete" && (
                  <span className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${priorityBadge(task.priority)}`}>
                    <Flag className="w-2.5 h-2.5" />
                    {task.priority === "high" ? "High" : task.priority === "medium" ? "Med" : "Low"}
                  </span>
                )}
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
                <th className="w-10 px-4 py-3" />
                <th className="text-left px-4 py-3">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Task</span>
                </th>
                <th className="text-left px-4 py-3 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => toggleSort("project")}>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider inline-flex items-center gap-1">
                    Project
                    {sortField === "project" && <ArrowUpDown className="w-3 h-3" />}
                  </span>
                </th>
                <th className="text-left px-4 py-3 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => toggleSort("assignee")}>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider inline-flex items-center gap-1">
                    Assignee
                    {sortField === "assignee" && <ArrowUpDown className="w-3 h-3" />}
                  </span>
                </th>
                <th className="text-left px-4 py-3 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => toggleSort("dueDate")}>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider inline-flex items-center gap-1">
                    Due Date
                    {sortField === "dueDate" && <ArrowUpDown className="w-3 h-3" />}
                  </span>
                </th>
                <th className="text-left px-4 py-3 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => toggleSort("priority")}>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider inline-flex items-center gap-1">
                    Priority
                    {sortField === "priority" && <ArrowUpDown className="w-3 h-3" />}
                  </span>
                </th>
                <th className="text-left px-4 py-3">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filtered.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50/50 transition-colors group">
                  {/* Checkbox */}
                  <td className="px-4 py-3">
                    {task.status === "complete" ? (
                      <div className="w-5 h-5 rounded-md bg-brand-blue flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    ) : (
                      <div className={`w-5 h-5 rounded-md border-2 ${
                        task.status === "overdue" ? "border-red-300 bg-red-50" : "border-gray-300 group-hover:border-gray-400"
                      } transition-colors`} />
                    )}
                  </td>
                  {/* Task name */}
                  <td className="px-4 py-3 max-w-xs">
                    <p className={`text-sm font-medium truncate ${task.status === "complete" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                      {task.title}
                    </p>
                  </td>
                  {/* Project */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500 truncate block max-w-[180px]">{task.project}</span>
                  </td>
                  {/* Assignee */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[9px] font-semibold flex items-center justify-center shrink-0">
                        {getInitials(task.assignee)}
                      </div>
                      <span className="text-sm text-gray-600 truncate max-w-[120px]">{task.assignee}</span>
                    </div>
                  </td>
                  {/* Due Date */}
                  <td className="px-4 py-3">
                    <span className={`text-sm ${
                      task.status === "overdue" ? "text-red-600 font-medium" : "text-gray-500"
                    }`}>
                      {task.dueDate ? formatDate(task.dueDate) : "—"}
                    </span>
                  </td>
                  {/* Priority */}
                  <td className="px-4 py-3">
                    {task.priority && task.status !== "complete" ? (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${priorityBadge(task.priority)}`}>
                        <Flag className="w-2.5 h-2.5" />
                        {task.priority === "high" ? "High" : task.priority === "medium" ? "Med" : "Low"}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-300">—</span>
                    )}
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md ${statusBadge(task.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor(task.status)}`} />
                      {statusLabel(task.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <CheckCircle2 className="empty-icon" />
          <p className="empty-text">No tasks in this category</p>
        </div>
      )}
    </div>
  );
}

function getInitials(name: string) {
  if (!name || name === "Unassigned") return "?";
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function priorityBadge(priority: string) {
  switch (priority) {
    case "high": return "bg-red-50 text-red-600 border border-red-100";
    case "medium": return "bg-amber-50 text-amber-600 border border-amber-100";
    case "low": return "bg-gray-50 text-gray-500 border border-gray-100";
    default: return "bg-gray-50 text-gray-500";
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "overdue": return "bg-red-50 text-red-600";
    case "not_viewed": return "bg-blue-50 text-blue-600";
    case "in_progress": return "bg-emerald-50 text-emerald-600";
    case "pending": return "bg-amber-50 text-amber-600";
    case "complete": return "bg-gray-50 text-gray-500";
    default: return "bg-gray-50 text-gray-500";
  }
}

function statusDotColor(status: string) {
  switch (status) {
    case "overdue": return "bg-red-500";
    case "not_viewed": return "bg-blue-500";
    case "in_progress": return "bg-emerald-500";
    case "pending": return "bg-amber-500";
    case "complete": return "bg-gray-400";
    default: return "bg-gray-300";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "overdue": return "Overdue";
    case "not_viewed": return "New";
    case "in_progress": return "In Progress";
    case "pending": return "Pending";
    case "complete": return "Complete";
    default: return status;
  }
}

function formatDate(d: string) {
  if (!d) return "No date";
  const date = new Date(d + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const taskDate = new Date(d + "T00:00:00");

  if (taskDate.getTime() === today.getTime()) return "Today";
  if (taskDate.getTime() === tomorrow.getTime()) return "Tomorrow";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
