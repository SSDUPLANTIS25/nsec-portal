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
  MessageSquare,
  Package,
  Users,
  TrendingUp,
  Calendar,
  ChevronRight,
  Briefcase,
  DollarSign,
  Wrench,
  ShoppingCart,
  BarChart3,
  Award,
  Target,
  Percent,
} from "lucide-react";
import { useMondayData } from "@/lib/use-monday-data";
import type { Task, CalendarEvent, Alert, DashboardKPIs, Project, Installation, Order } from "@/lib/monday-types";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const { data: tasks, loading: tasksLoading, error: tasksError } = useMondayData<Task[]>("tasks");
  const { data: calendarEvents, loading: eventsLoading } = useMondayData<CalendarEvent[]>("calendar");
  const { data: alerts, loading: alertsLoading } = useMondayData<Alert[]>("alerts");
  const { data: kpis, loading: kpisLoading } = useMondayData<DashboardKPIs>("kpis");
  const { data: projects, loading: projectsLoading } = useMondayData<Project[]>("projects");
  const { data: installations, loading: installsLoading } = useMondayData<Installation[]>("installations");
  const { data: orders, loading: ordersLoading } = useMondayData<Order[]>("orders");

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  if (!user) return null;

  if (tasksError) {
    return (
      <div className="px-4 py-12 max-w-lg lg:max-w-5xl mx-auto text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 mb-1">Monday.com Not Connected</h2>
        <p className="text-sm text-gray-500">Set the MONDAY_API_KEY environment variable to connect your NSEC workspace.</p>
      </div>
    );
  }

  const loading = tasksLoading || eventsLoading || alertsLoading || kpisLoading || projectsLoading || installsLoading || ordersLoading;
  if (loading) {
    return (
      <div className="px-4 py-12 max-w-lg lg:max-w-5xl mx-auto text-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading Mission Control...</p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const todayEvents = (calendarEvents ?? []).filter((e) => e.date === today);
  const taskCounts = {
    overdue: (tasks ?? []).filter((t) => t.status === "overdue").length,
    not_viewed: (tasks ?? []).filter((t) => t.status === "not_viewed").length,
    in_progress: (tasks ?? []).filter((t) => t.status === "in_progress").length,
    pending: (tasks ?? []).filter((t) => t.status === "pending").length,
    complete: (tasks ?? []).filter((t) => t.status === "complete").length,
  };
  const totalActive = taskCounts.overdue + taskCounts.not_viewed + taskCounts.in_progress + taskCounts.pending;

  // Procurement summary
  const allOrders = orders ?? [];
  const receivedYesterday = allOrders.filter((o) => {
    if (o.status !== "Received" || !o.eta) return false;
    const d = new Date(o.eta);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.toDateString() === yesterday.toDateString();
  }).length;
  const expectedToday = allOrders.filter((o) => o.status !== "Received" && o.status !== "Canceled" && o.eta === today).length;
  const overdueOrders = allOrders.filter((o) => {
    if (o.status === "Received" || o.status === "Canceled" || !o.eta) return false;
    return new Date(o.eta) < new Date(today);
  }).length;

  // Installation summary
  const allInstalls = installations ?? [];
  const activeInstalls = allInstalls.filter((i) => i.jobStatus !== "Totally Complete");
  const completedInstalls = allInstalls.filter((i) => i.jobStatus === "Totally Complete");

  // Project pipeline summary
  const allProjects = projects ?? [];
  const pipelineGroups = ["PROPOSAL FOLLOW UP TO CLOSE", "CLOSE"];
  const activeProjectGroups = ["RELEASED", "Submitted for Production"];
  const pipelineProjects = allProjects.filter((p) => pipelineGroups.includes(p.group));
  const activeProjectCount = allProjects.filter((p) => activeProjectGroups.includes(p.group)).length;
  const pipelineValue = pipelineProjects.reduce((sum, p) => sum + (p.totalPrice ?? 0), 0);
  const wonProjects = allProjects.filter((p) => p.group === "RELEASED" || p.group === "Submitted for Production");
  const totalProjects = allProjects.length;

  return (
    <div className="px-4 py-4 space-y-4 max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
          {getGreeting()}, {user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Mission Control</p>
      </div>

      {/* Urgent Alerts */}
      {(alerts ?? []).length > 0 && (
        <section>
          <div className="space-y-2">
            {(alerts ?? []).slice(0, 3).map((alert) => (
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

      {/* Summary Row — quick glance cards */}
      <section>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          <Link href="/tasks" className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center active:scale-[0.98] transition-transform">
            <CheckCircle2 className="w-5 h-5 text-brand-blue mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{totalActive}</p>
            <p className="text-[10px] text-gray-500 font-medium">Active Tasks</p>
          </Link>
          <Link href="/calendar" className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center active:scale-[0.98] transition-transform">
            <Calendar className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{todayEvents.length}</p>
            <p className="text-[10px] text-gray-500 font-medium">Today&apos;s Events</p>
          </Link>
          <Link href="/projects" className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center active:scale-[0.98] transition-transform">
            <Briefcase className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{activeProjectCount}</p>
            <p className="text-[10px] text-gray-500 font-medium">Active Projects</p>
          </Link>
        </div>
      </section>

      {/* Desktop 2-column layout for middle sections */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">

      {/* Left column on desktop */}
      <div className="space-y-4">

      {/* Task Status Breakdown */}
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
        {todayEvents.length > 0 ? (
          <div className="space-y-2">
            {todayEvents.slice(0, 4).map((event) => (
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
        ) : (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-sm text-gray-400">No events scheduled today</p>
          </div>
        )}
      </section>

      </div>{/* end left column */}

      {/* Right column on desktop */}
      <div className="space-y-4">

      {/* Procurement Orders */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Procurement</h2>
          <Link href="/more" className="text-xs text-brand-blue font-medium flex items-center gap-0.5">
            All orders <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
            <Package className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{receivedYesterday}</p>
            <p className="text-[10px] text-gray-500 font-medium">Received</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
            <ShoppingCart className="w-5 h-5 text-brand-blue mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{expectedToday}</p>
            <p className="text-[10px] text-gray-500 font-medium">Expected Today</p>
          </div>
          <div className={`rounded-xl p-3 border shadow-sm text-center ${overdueOrders > 0 ? "bg-red-50 border-red-100" : "bg-white border-gray-100"}`}>
            <AlertTriangle className={`w-5 h-5 mx-auto mb-1 ${overdueOrders > 0 ? "text-red-500" : "text-gray-300"}`} />
            <p className={`text-lg font-bold ${overdueOrders > 0 ? "text-red-600" : "text-gray-900"}`}>{overdueOrders}</p>
            <p className="text-[10px] text-gray-500 font-medium">Overdue</p>
          </div>
        </div>
      </section>

      {/* YTD Performance — management only */}
      {user.role === "management" && kpis && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Performance</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <KPICard
              label="Revenue Pipeline"
              value={formatCurrency(pipelineValue)}
              sub={`${pipelineProjects.length} proposals pending`}
              icon={<DollarSign className="w-4 h-4 text-green-500" />}
            />
            <KPICard
              label="Active Installs"
              value={String(activeInstalls.length)}
              sub={`${completedInstalls.length} completed`}
              icon={<Wrench className="w-4 h-4 text-blue-500" />}
            />
            <KPICard
              label="Projects Won"
              value={String(wonProjects.length)}
              sub={`of ${totalProjects} total`}
              icon={<Award className="w-4 h-4 text-amber-500" />}
            />
            <KPICard
              label="Overdue Tasks"
              value={String(taskCounts.overdue)}
              sub={taskCounts.overdue > 0 ? "Needs attention" : "All clear"}
              icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
            />
          </div>
        </section>
      )}

      </div>{/* end right column */}
      </div>{/* end 2-column layout */}

      {/* Below: full-width sections */}
      {/* Installation Summary */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Installations</h2>
          <Link href="/installations" className="text-xs text-brand-blue font-medium flex items-center gap-0.5">
            Schedule <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {activeInstalls.slice(0, 4).map((install, i) => (
            <div key={install.id} className={`p-3 flex items-center gap-3 ${i > 0 ? "border-t border-gray-50" : ""}`}>
              <div className={`w-2 h-8 rounded-full shrink-0 ${installStatusColor(install.jobStatus)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{install.name}</p>
                <p className="text-xs text-gray-400">{install.date ? formatDateShort(install.date) : "TBD"} {install.projectManager ? `· ${install.projectManager}` : ""}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${installBadge(install.jobStatus)}`}>
                {install.jobStatus}
              </span>
            </div>
          ))}
          {activeInstalls.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-400">No active installations</p>
            </div>
          )}
        </div>
      </section>

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
            {todayEvents.filter(e => e.location).length === 0 && (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-400">No routes today</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Priority Items */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Priority Items</h2>
        </div>
        <div className="space-y-2">
          {(tasks ?? []).filter(t => t.priority === "high").slice(0, 5).map((task) => (
            <div key={task.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${statusDot(task.status)}`} />
                <span className="text-xs font-medium text-gray-400 uppercase">{task.status.replace("_", " ")}</span>
                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">HIGH</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{task.title}</p>
              <p className="text-xs text-gray-500 mt-1">Due {task.dueDate ? formatDateShort(task.dueDate) : "TBD"} · {task.assignee}</p>
            </div>
          ))}
          {(tasks ?? []).filter(t => t.priority === "high").length === 0 && (
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-sm text-gray-400">No high-priority items</p>
            </div>
          )}
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

function formatCurrency(amount: number) {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount}`;
}

function formatDateShort(d: string) {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

function installStatusColor(status: string) {
  switch (status) {
    case "Totally Complete": return "bg-emerald-400";
    case "Phase Done": return "bg-amber-400";
    case "In Progress": return "bg-blue-400";
    default: return "bg-gray-300";
  }
}

function installBadge(status: string) {
  switch (status) {
    case "Totally Complete": return "bg-emerald-50 text-emerald-600";
    case "Phase Done": return "bg-amber-50 text-amber-600";
    case "In Progress": return "bg-blue-50 text-blue-600";
    default: return "bg-gray-50 text-gray-600";
  }
}
