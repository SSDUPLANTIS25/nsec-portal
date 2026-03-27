"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  AlertTriangle,
  Eye,
  Clock,
  CheckCircle2,
  EyeOff,
  MapPin,
  ArrowRight,
  Mail,
  MessageSquare,
  Phone,
  Package,
  Users,
  TrendingUp,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { tasks, calendarEvents, alerts, taskCounts, commCounts } from "@/lib/mock-data";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  if (!user) return null;

  const todayEvents = calendarEvents.filter((e) => e.date === "2026-03-27");
  const activeTasks = tasks.filter((t) => t.status !== "complete");

  return (
    <div className="px-4 py-4 space-y-5 max-w-lg mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {getGreeting()}, {user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {user.role === "field" ? "Here\u2019s your day on site" : user.role === "office" ? "Here\u2019s your office overview" : "Here\u2019s your operations overview"}
        </p>
      </div>

      {/* Urgent Alerts */}
      {alerts.length > 0 && (
        <section>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl p-3 flex items-start gap-3 ${
                  alert.type === "urgent"
                    ? "bg-red-50 border border-red-100"
                    : "bg-amber-50 border border-amber-100"
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    alert.type === "urgent" ? "text-red-500" : "text-amber-500"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Task Status Cards */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Tasks</h2>
          <Link href="/tasks" className="text-xs text-brand-blue font-medium flex items-center gap-0.5">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-5 gap-2">
          <TaskBadge icon={<AlertTriangle className="w-4 h-4" />} count={taskCounts.overdue} label="Overdue" color="text-red-600 bg-red-50" />
          <TaskBadge icon={<EyeOff className="w-4 h-4" />} count={taskCounts.not_viewed} label="New" color="text-blue-600 bg-blue-50" />
          <TaskBadge icon={<Eye className="w-4 h-4" />} count={taskCounts.in_progress} label="Active" color="text-emerald-600 bg-emerald-50" />
          <TaskBadge icon={<Clock className="w-4 h-4" />} count={taskCounts.pending} label="Pending" color="text-amber-600 bg-amber-50" />
          <TaskBadge icon={<CheckCircle2 className="w-4 h-4" />} count={taskCounts.complete} label="Done" color="text-gray-500 bg-gray-100" />
        </div>
      </section>

      {/* Today's Schedule */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Today&apos;s Schedule</h2>
          <Link href="/calendar" className="text-xs text-brand-blue font-medium flex items-center gap-0.5">
            Full calendar <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-2">
          {todayEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl p-3 border border-gray-100 flex items-start gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${eventColor(event.type)}`}>
                {eventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{event.time}</p>
                {event.location && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-400 truncate">{event.location}</p>
                  </div>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </section>

      {/* Communication Summary — office/management only */}
      {user.role !== "field" && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Communications</h2>
          <div className="grid grid-cols-4 gap-2">
            <CommBadge icon={<Mail className="w-4 h-4" />} count={commCounts.emails} label="Email" />
            <CommBadge icon={<MessageSquare className="w-4 h-4" />} count={commCounts.chat} label="Chat" />
            <CommBadge icon={<Phone className="w-4 h-4" />} count={commCounts.calls} label="Calls" />
            <CommBadge icon={<Package className="w-4 h-4" />} count={commCounts.orders} label="Orders" />
          </div>
        </section>
      )}

      {/* KPI Cards — management only */}
      {user.role === "management" && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">This Week</h2>
          <div className="grid grid-cols-2 gap-2">
            <KPICard label="Active Installs" value="4" sub="+1 from last week" icon={<Users className="w-4 h-4 text-blue-500" />} />
            <KPICard label="Revenue Pipeline" value="$128K" sub="3 pending invoices" icon={<TrendingUp className="w-4 h-4 text-green-500" />} />
            <KPICard label="Overdue Tasks" value={String(taskCounts.overdue)} sub="Needs attention" icon={<AlertTriangle className="w-4 h-4 text-red-500" />} />
            <KPICard label="Upcoming Events" value={String(calendarEvents.length)} sub="Next 7 days" icon={<Calendar className="w-4 h-4 text-purple-500" />} />
          </div>
        </section>
      )}

      {/* Field-specific: Route for the day */}
      {user.role === "field" && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Your Route</h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            {todayEvents.filter(e => e.location).map((event, i) => (
              <div key={event.id} className={`p-3 flex items-center gap-3 ${i > 0 ? "border-t border-gray-50" : ""}`}>
                <div className="w-7 h-7 rounded-full bg-brand-blue text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                  <p className="text-xs text-gray-400 truncate">{event.location}</p>
                </div>
                <MapPin className="w-4 h-4 text-brand-blue shrink-0" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Tasks Preview */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Priority Items</h2>
        </div>
        <div className="space-y-2">
          {activeTasks.filter(t => t.priority === "high").map((task) => (
            <div key={task.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${statusDot(task.status)}`} />
                <span className="text-xs font-medium text-gray-400 uppercase">{task.status.replace("_", " ")}</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{task.title}</p>
              <p className="text-xs text-gray-500 mt-1">Due {task.dueDate} &middot; {task.assignee}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function TaskBadge({ icon, count, label, color }: { icon: React.ReactNode; count: number; label: string; color: string }) {
  return (
    <div className={`flex flex-col items-center py-2.5 rounded-xl ${color}`}>
      {icon}
      <span className="text-lg font-bold mt-0.5">{count}</span>
      <span className="text-[10px] font-medium opacity-70">{label}</span>
    </div>
  );
}

function CommBadge({ icon, count, label }: { icon: React.ReactNode; count: number; label: string }) {
  return (
    <div className="bg-white rounded-xl p-2.5 border border-gray-100 flex flex-col items-center shadow-sm">
      <div className="text-gray-500">{icon}</div>
      <span className="text-base font-bold text-gray-900 mt-1">{count}</span>
      <span className="text-[10px] text-gray-400 font-medium">{label}</span>
    </div>
  );
}

function KPICard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

function eventColor(type: string) {
  switch (type) {
    case "installation": return "bg-blue-100 text-blue-600";
    case "meeting": return "bg-purple-100 text-purple-600";
    case "delivery": return "bg-amber-100 text-amber-600";
    case "training": return "bg-green-100 text-green-600";
    default: return "bg-gray-100 text-gray-600";
  }
}

function eventIcon(type: string) {
  switch (type) {
    case "installation": return <Users className="w-5 h-5" />;
    case "meeting": return <MessageSquare className="w-5 h-5" />;
    case "delivery": return <Package className="w-5 h-5" />;
    case "training": return <CheckCircle2 className="w-5 h-5" />;
    default: return <Calendar className="w-5 h-5" />;
  }
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
