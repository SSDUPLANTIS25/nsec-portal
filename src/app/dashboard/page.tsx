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
  Zap,
  ArrowUpRight,
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
      <div className="px-4 py-16 max-w-lg lg:max-w-6xl mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Monday.com Not Connected</h2>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">Set the MONDAY_API_KEY environment variable to connect your NSEC workspace.</p>
      </div>
    );
  }

  const loading = tasksLoading || eventsLoading || alertsLoading || kpisLoading || projectsLoading || installsLoading || ordersLoading;
  if (loading) {
    return (
      <div className="px-4 py-16 max-w-lg lg:max-w-6xl mx-auto text-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading dashboard...</p>
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

  const allInstalls = installations ?? [];
  const activeInstalls = allInstalls.filter((i) => i.jobStatus !== "Totally Complete");
  const completedInstalls = allInstalls.filter((i) => i.jobStatus === "Totally Complete");

  const allProjects = projects ?? [];
  const pipelineGroups = ["PROPOSAL FOLLOW UP TO CLOSE", "CLOSE"];
  const activeProjectGroups = ["RELEASED", "Submitted for Production"];
  const pipelineProjects = allProjects.filter((p) => pipelineGroups.includes(p.group));
  const activeProjectCount = allProjects.filter((p) => activeProjectGroups.includes(p.group)).length;
  const pipelineValue = pipelineProjects.reduce((sum, p) => sum + (p.totalPrice ?? 0), 0);
  const wonProjects = allProjects.filter((p) => p.group === "RELEASED" || p.group === "Submitted for Production");
  const totalProjects = allProjects.length;

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-lg lg:max-w-none mx-auto">
      {/* Page Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
            {getGreeting()}, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Here&apos;s what&apos;s happening across your projects today.
          </p>
        </div>
        <Link
          href="/projects"
          className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:text-blue-700 transition-colors"
        >
          View all projects <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Urgent Alerts */}
      {(alerts ?? []).length > 0 && (
        <section className="space-y-2 mb-6">
          {(alerts ?? []).slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl p-3.5 flex items-start gap-3 ${
                alert.type === "urgent"
                  ? "bg-red-50 border border-red-100"
                  : "bg-amber-50 border border-amber-100"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                alert.type === "urgent" ? "bg-red-100" : "bg-amber-100"
              }`}>
                <AlertTriangle className={`w-4 h-4 ${alert.type === "urgent" ? "text-red-500" : "text-amber-500"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{alert.message}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* KPI Strip — 4 across on desktop */}
      <section className="mb-6">
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
          <Link href="/tasks" className="card p-4 lg:p-5 text-center active:scale-[0.98] transition-all card-hover">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-[18px] h-[18px] text-brand-blue" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{totalActive}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Active Tasks</p>
          </Link>
          <Link href="/calendar" className="card p-4 lg:p-5 text-center active:scale-[0.98] transition-all card-hover">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-[18px] h-[18px] text-purple-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{todayEvents.length}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Today&apos;s Events</p>
          </Link>
          <Link href="/projects" className="card p-4 lg:p-5 text-center active:scale-[0.98] transition-all card-hover">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto mb-2">
              <Briefcase className="w-[18px] h-[18px] text-emerald-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{activeProjectCount}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Active Projects</p>
          </Link>
          {/* Desktop-only 4th KPI */}
          <Link href="/pipeline" className="hidden lg:block card p-5 text-center active:scale-[0.98] transition-all card-hover">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-2">
              <DollarSign className="w-[18px] h-[18px] text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{formatCurrency(pipelineValue)}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Pipeline Value</p>
          </Link>
        </div>
      </section>

      {/* ===== Desktop 3-column layout ===== */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-5 lg:space-y-0">

      {/* Column 1: Tasks + Schedule */}
      <div className="space-y-5">
        {/* Task Status Breakdown */}
        <section>
          <div className="section-header">
            <h2 className="section-title">Tasks</h2>
            <Link href="/tasks" className="section-link">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            <TaskBadge icon={<AlertTriangle className="w-3.5 h-3.5" />} count={taskCounts.overdue} label="Overdue" color="text-red-600 bg-red-50 border border-red-100" />
            <TaskBadge icon={<EyeOff className="w-3.5 h-3.5" />} count={taskCounts.not_viewed} label="New" color="text-blue-600 bg-blue-50 border border-blue-100" />
            <TaskBadge icon={<Eye className="w-3.5 h-3.5" />} count={taskCounts.in_progress} label="Active" color="text-emerald-600 bg-emerald-50 border border-emerald-100" />
            <TaskBadge icon={<Clock className="w-3.5 h-3.5" />} count={taskCounts.pending} label="Pending" color="text-amber-600 bg-amber-50 border border-amber-100" />
            <TaskBadge icon={<CheckCircle2 className="w-3.5 h-3.5" />} count={taskCounts.complete} label="Done" color="text-gray-500 bg-gray-50 border border-gray-100" />
          </div>
        </section>

        {/* Today's Schedule */}
        <section>
          <div className="section-header">
            <h2 className="section-title">Today&apos;s Schedule</h2>
            <Link href="/calendar" className="section-link">
              Full calendar <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {todayEvents.length > 0 ? (
            <div className="space-y-2">
              {todayEvents.slice(0, 4).map((event) => (
                <div key={event.id} className="card p-3 flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${eventColor(event.type)}`}>
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
            <div className="card p-6 text-center">
              <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No events scheduled today</p>
            </div>
          )}
        </section>

        {/* Priority Items */}
        <section>
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Priority Items
            </h2>
          </div>
          <div className="space-y-2">
            {(tasks ?? []).filter(t => t.priority === "high").slice(0, 4).map((task) => (
              <div key={task.id} className="card p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`w-2 h-2 rounded-full ${statusDot(task.status)}`} />
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{task.status.replace("_", " ")}</span>
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100">HIGH</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                <p className="text-xs text-gray-500 mt-1">Due {task.dueDate ? formatDateShort(task.dueDate) : "TBD"} · {task.assignee}</p>
              </div>
            ))}
            {(tasks ?? []).filter(t => t.priority === "high").length === 0 && (
              <div className="card p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No high-priority items</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Column 2: Installations + Procurement */}
      <div className="space-y-5">
        {/* Installation Summary */}
        <section>
          <div className="section-header">
            <h2 className="section-title">Installations</h2>
            <Link href="/installations" className="section-link">
              Schedule <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="card overflow-hidden">
            {activeInstalls.slice(0, 5).map((install, i) => (
              <div key={install.id} className={`p-3.5 flex items-center gap-3 ${i > 0 ? "border-t border-border-light" : ""} hover:bg-gray-50/50 transition-colors`}>
                <div className={`w-1.5 h-8 rounded-full shrink-0 ${installStatusColor(install.jobStatus)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{install.name}</p>
                  <p className="text-xs text-gray-400">{install.date ? formatDateShort(install.date) : "TBD"} {install.projectManager ? `· ${install.projectManager}` : ""}</p>
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md whitespace-nowrap ${installBadge(install.jobStatus)}`}>
                  {install.jobStatus}
                </span>
              </div>
            ))}
            {activeInstalls.length === 0 && (
              <div className="p-8 text-center">
                <Wrench className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No active installations</p>
              </div>
            )}
          </div>
        </section>

        {/* Procurement Orders */}
        <section>
          <div className="section-header">
            <h2 className="section-title">Procurement</h2>
            <Link href="/more" className="section-link">
              All orders <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="card p-3 text-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto mb-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{receivedYesterday}</p>
              <p className="text-[11px] text-gray-500 font-medium">Received</p>
            </div>
            <div className="card p-3 text-center">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-1.5">
                <ShoppingCart className="w-4 h-4 text-brand-blue" />
              </div>
              <p className="text-lg font-bold text-gray-900">{expectedToday}</p>
              <p className="text-[11px] text-gray-500 font-medium">Expected Today</p>
            </div>
            <div className={`card p-3 text-center ${overdueOrders > 0 ? "!bg-red-50 !border-red-100" : ""}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5 ${overdueOrders > 0 ? "bg-red-100" : "bg-gray-50"}`}>
                <AlertTriangle className={`w-4 h-4 ${overdueOrders > 0 ? "text-red-500" : "text-gray-300"}`} />
              </div>
              <p className={`text-lg font-bold ${overdueOrders > 0 ? "text-red-600" : "text-gray-900"}`}>{overdueOrders}</p>
              <p className="text-[11px] text-gray-500 font-medium">Overdue</p>
            </div>
          </div>
        </section>

        {/* Field-specific: Route for the day */}
        {user.role === "field" && (
          <section>
            <div className="section-header">
              <h2 className="section-title">Your Route</h2>
            </div>
            <div className="card overflow-hidden">
              {todayEvents.filter(e => e.location).map((event, i) => (
                <div key={event.id} className={`p-3.5 flex items-center gap-3 ${i > 0 ? "border-t border-border-light" : ""} hover:bg-gray-50/50 transition-colors`}>
                  <div className="w-7 h-7 rounded-full bg-brand-blue text-white text-xs font-semibold flex items-center justify-center shrink-0">
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
                <div className="p-8 text-center">
                  <MapPin className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No routes today</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Column 3: Performance KPIs (management) or Pipeline snapshot */}
      <div className="space-y-5">
        {/* YTD Performance — management only */}
        {user.role === "management" && kpis && (
          <section>
            <div className="section-header">
              <h2 className="section-title">Performance</h2>
            </div>
            <div className="space-y-2.5">
              <KPICard
                label="Revenue Pipeline"
                value={formatCurrency(pipelineValue)}
                sub={`${pipelineProjects.length} proposals`}
                icon={<DollarSign className="w-4 h-4" />}
                color="bg-emerald-50 text-emerald-600"
              />
              <KPICard
                label="Active Installs"
                value={String(activeInstalls.length)}
                sub={`${completedInstalls.length} completed`}
                icon={<Wrench className="w-4 h-4" />}
                color="bg-blue-50 text-blue-600"
              />
              <KPICard
                label="Projects Won"
                value={String(wonProjects.length)}
                sub={`of ${totalProjects} total`}
                icon={<Award className="w-4 h-4" />}
                color="bg-amber-50 text-amber-600"
              />
              <KPICard
                label="Overdue Tasks"
                value={String(taskCounts.overdue)}
                sub={taskCounts.overdue > 0 ? "Needs attention" : "All clear"}
                icon={<AlertTriangle className="w-4 h-4" />}
                color={taskCounts.overdue > 0 ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400"}
              />
            </div>
          </section>
        )}

        {/* Pipeline snapshot — always visible */}
        <section>
          <div className="section-header">
            <h2 className="section-title">Pipeline</h2>
            <Link href="/pipeline" className="section-link">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="card overflow-hidden">
            {pipelineProjects.slice(0, 5).map((project, i) => (
              <div key={project.id} className={`p-3.5 flex items-center gap-3 ${i > 0 ? "border-t border-border-light" : ""} hover:bg-gray-50/50 transition-colors`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${pipelineDotColor(project.group)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
                  <p className="text-xs text-gray-400 truncate">{project.companyName ?? ""}</p>
                </div>
                {project.totalPrice && project.totalPrice > 0 && (
                  <span className="text-xs font-semibold text-gray-600 shrink-0">{formatCurrency(project.totalPrice)}</span>
                )}
              </div>
            ))}
            {pipelineProjects.length === 0 && (
              <div className="p-8 text-center">
                <TrendingUp className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No active pipeline</p>
              </div>
            )}
          </div>
        </section>
      </div>

      </div>{/* end 3-column layout */}
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
      <span className="text-lg font-bold mt-1 tracking-tight">{count}</span>
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

function KPICard({ label, value, sub, icon, color }: { label: string; value: string; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="card p-4 card-hover">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

function eventColor(type: string) {
  switch (type) {
    case "installation": return "bg-blue-50 text-blue-600";
    case "meeting": return "bg-purple-50 text-purple-600";
    case "delivery": return "bg-amber-50 text-amber-600";
    case "training": return "bg-green-50 text-green-600";
    default: return "bg-gray-50 text-gray-600";
  }
}

function eventIcon(type: string) {
  switch (type) {
    case "installation": return <Users className="w-[18px] h-[18px]" />;
    case "meeting": return <MessageSquare className="w-[18px] h-[18px]" />;
    case "delivery": return <Package className="w-[18px] h-[18px]" />;
    case "training": return <CheckCircle2 className="w-[18px] h-[18px]" />;
    default: return <Calendar className="w-[18px] h-[18px]" />;
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
    case "Totally Complete": return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    case "Phase Done": return "bg-amber-50 text-amber-700 border border-amber-100";
    case "In Progress": return "bg-blue-50 text-blue-700 border border-blue-100";
    default: return "bg-gray-50 text-gray-600 border border-gray-100";
  }
}

function pipelineDotColor(group: string) {
  switch (group) {
    case "PROPOSAL FOLLOW UP TO CLOSE": return "bg-orange-500";
    case "CLOSE": return "bg-amber-500";
    default: return "bg-gray-400";
  }
}
