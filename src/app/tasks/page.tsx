"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMondayData } from "@/lib/use-monday-data";
import type { Task } from "@/lib/monday-types";
import { AlertTriangle, Search, CheckCircle2, Flag } from "lucide-react";

type StatusFilter = "all" | "today" | "upcoming" | "complete";

export default function TasksPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const { data: tasks, loading, error } = useMondayData<Task[]>("tasks");

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

  if (loading || !tasks) {
    return (
      <div className="px-4 py-16 max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto text-center">
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

  const tabs = [
    { value: "all" as const, label: "All Tasks", count: activeTasks.length },
    { value: "today" as const, label: "Today", count: todayTasks.length },
    { value: "upcoming" as const, label: "Upcoming", count: upcomingTasks.length },
    { value: "complete" as const, label: "Completed", count: completedTasks.length },
  ];

  return (
    <div className="px-4 lg:px-6 py-5 max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Tasks</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage all tasks across projects</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
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
      <div className="tab-bar mb-4 -mx-4 px-4 lg:mx-0 lg:px-0 no-scrollbar">
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

      {/* Task list */}
      <div className="card overflow-hidden divide-y divide-border-light">
        {filtered.map((task) => (
          <div
            key={task.id}
            className="px-4 py-3.5 flex items-start gap-3 hover:bg-gray-50/50 transition-colors"
          >
            {/* Checkbox */}
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

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${task.status === "complete" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                {task.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {task.project} · {task.dueDate ? formatDate(task.dueDate) : "No date"}
              </p>
            </div>

            {/* Right side */}
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
