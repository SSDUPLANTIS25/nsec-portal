/**
 * Transform Monday.com API responses into portal-ready data structures.
 *
 * Each function takes raw Monday.com items and returns typed portal objects.
 */

import {
  type MondayItem,
  type MondayStatusValue,
  type MondayDateValue,
  type MondayTimelineValue,
  type Task,
  type TaskStatus,
  type TaskPriority,
  type CalendarEvent,
  type CalendarEventType,
  type Alert,
  type Project,
  type Installation,
  type Order,
  type Employee,
  type UserRole,
  type DashboardKPIs,
} from "./monday-types";
import { getColumnText, getColumnValue } from "./monday-client";

// ─── Status Mapping ──────────────────────────────────────────────────────────

const TASK_STATUS_MAP: Record<string, TaskStatus> = {
  "New": "not_viewed",
  "Working on it": "in_progress",
  "Stuck": "in_progress",
  "Pending": "pending",
  "Waiting for approval": "pending",
  "Ordered": "pending",
  "Done": "complete",
};

function mapTaskStatus(mondayLabel: string, dueDate?: string): TaskStatus {
  const mapped = TASK_STATUS_MAP[mondayLabel];
  if (mapped === "complete") return "complete";

  // Check if overdue (past due date and not complete)
  if (dueDate) {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (due < today) return "overdue";
  }

  return mapped ?? "not_viewed";
}

function deriveTaskPriority(status: TaskStatus, dueDate?: string): TaskPriority {
  if (status === "overdue") return "high";
  if (!dueDate) return "medium";

  const due = new Date(dueDate);
  const today = new Date();
  const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue <= 2) return "high";
  if (daysUntilDue <= 7) return "medium";
  return "low";
}

const DEPARTMENT_ROLE_MAP: Record<string, UserRole> = {
  "Install": "field",
  "Welding": "field",
  "PM-Sales": "office",
  "HUB": "office",
  "Remote": "office",
  "Admin": "office",
};

// ─── Transform Functions ─────────────────────────────────────────────────────

/**
 * Transform Requests & Tasks board items into portal Task objects.
 */
export function transformTasks(items: MondayItem[]): Task[] {
  return items.map((item) => {
    const statusVal = getColumnValue<MondayStatusValue>(item, "status");
    const statusLabel = statusVal?.label ?? getColumnText(item, "status");
    const dueDate = getColumnText(item, "date") || getColumnText(item, "due_date");
    const status = mapTaskStatus(statusLabel, dueDate);
    const priority = deriveTaskPriority(status, dueDate);

    return {
      id: item.id,
      title: item.name,
      project: getColumnText(item, "category") || item.group.title,
      status,
      dueDate: dueDate || "",
      assignee: getColumnText(item, "person") || "Unassigned",
      priority,
      description: getColumnText(item, "long_text") || undefined,
      projectManager: getColumnText(item, "person__1") || undefined, // PM column
      mondayItemId: item.id,
      mondayGroupId: item.group.id,
      mondayBoardId: "4015603070",
    };
  });
}

/**
 * Transform Project Index board items into portal Project objects.
 */
export function transformProjects(items: MondayItem[]): Project[] {
  return items.map((item) => {
    const timelineVal = getColumnValue<MondayTimelineValue>(item, "timeline");

    return {
      id: item.id,
      name: item.name,
      jobNumber: getColumnText(item, "text") || undefined, // Job Number col
      companyName: getColumnText(item, "text5") || undefined,
      projectManager: getColumnText(item, "person") || undefined,
      location: getColumnText(item, "job_location") || undefined,
      installWindow: timelineVal ? { from: timelineVal.from, to: timelineVal.to } : undefined,
      currentStage: getColumnText(item, "current_stage") || undefined,
      leadStatus: getColumnText(item, "lead_status") || undefined,
      proposalStatus: getColumnText(item, "proposal_status") || undefined,
      installationStatus: getColumnText(item, "installation_status") || undefined,
      totalPrice: parseFloat(getColumnText(item, "total_price")) || undefined,
      balance: parseFloat(getColumnText(item, "balance")) || undefined,
      income: parseFloat(getColumnText(item, "income")) || undefined,
      systems: getColumnText(item, "tags") ? getColumnText(item, "tags").split(", ") : undefined,
      description: getColumnText(item, "long_text") || undefined,
      group: item.group.title,
      mondayItemId: item.id,
    };
  });
}

/**
 * Transform Installation board items into portal Installation objects.
 */
export function transformInstallations(items: MondayItem[]): Installation[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    jobStatus: getColumnText(item, "status") || "In Progress",
    date: getColumnText(item, "date") || "",
    projectManager: getColumnText(item, "person") || undefined,
    installer: getColumnText(item, "person__1") || undefined,
    crewSize: parseInt(getColumnText(item, "numbers")) || undefined,
    totalHours: parseFloat(getColumnText(item, "numbers__1")) || undefined,
    mondayItemId: item.id,
  }));
}

/**
 * Generate alerts from installation data.
 */
export function generateAlerts(installations: Installation[]): Alert[] {
  const alerts: Alert[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const install of installations) {
    if (!install.date) continue;
    const installDate = new Date(install.date);

    if (install.jobStatus !== "Totally Complete" && installDate < today) {
      const daysOver = Math.ceil((today.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24));
      alerts.push({
        id: `alert-${install.id}`,
        title: install.name,
        message: `Installation ${daysOver} day${daysOver > 1 ? "s" : ""} past scheduled date`,
        type: daysOver > 3 ? "urgent" : "warning",
        timestamp: new Date().toISOString(),
        mondayItemId: install.mondayItemId,
      });
    }
  }

  return alerts.sort((a, b) => (a.type === "urgent" ? -1 : 1));
}

/**
 * Transform Meetings board items into CalendarEvent objects.
 */
export function transformMeetings(items: MondayItem[]): CalendarEvent[] {
  return items.map((item) => ({
    id: item.id,
    title: item.name,
    date: getColumnText(item, "date") || "",
    time: getColumnText(item, "hour") || "",
    endTime: getColumnText(item, "hour__1") || undefined,
    attendees: getColumnText(item, "person") ? getColumnText(item, "person").split(", ") : undefined,
    teamsLink: getColumnText(item, "link") || undefined,
    type: "meeting" as CalendarEventType,
    mondayItemId: item.id,
    sourceBoardId: "18397692294",
  }));
}

/**
 * Transform Installation items into calendar events (for combined calendar view).
 */
export function installationsToCalendarEvents(installations: Installation[]): CalendarEvent[] {
  return installations
    .filter((i) => i.date && i.jobStatus !== "Totally Complete")
    .map((i) => ({
      id: `install-${i.id}`,
      title: `${i.name} — Install`,
      date: i.date,
      time: "7:00 AM",
      type: "installation" as CalendarEventType,
      mondayItemId: i.mondayItemId,
      sourceBoardId: "2154290563",
    }));
}

/**
 * Transform Ordering items into calendar delivery events (ETA dates).
 */
export function ordersToCalendarEvents(orders: Order[]): CalendarEvent[] {
  return orders
    .filter((o) => o.eta && o.status !== "Received" && o.status !== "Canceled")
    .map((o) => ({
      id: `delivery-${o.id}`,
      title: `${o.name} — Delivery`,
      date: o.eta!,
      time: "9:00 AM",
      type: "delivery" as CalendarEventType,
      mondayItemId: o.mondayItemId,
      sourceBoardId: "7436908659",
    }));
}

/**
 * Transform Ordering board items into portal Order objects.
 */
export function transformOrders(items: MondayItem[]): Order[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    status: getColumnText(item, "status") || "Unknown",
    materials: getColumnText(item, "text") || undefined,
    vendor: getColumnText(item, "status__1") || undefined,
    dateOrdered: getColumnText(item, "date") || undefined,
    eta: getColumnText(item, "date__1") || undefined,
    vendorOrderNumber: getColumnText(item, "text__1") || undefined,
    trackingStatus: getColumnText(item, "status__2") || undefined,
    mondayItemId: item.id,
  }));
}

/**
 * Transform Employee Directory items into portal Employee objects.
 */
export function transformEmployees(items: MondayItem[]): Employee[] {
  return items.map((item) => {
    const dept = getColumnText(item, "status") || "";
    const role: UserRole = DEPARTMENT_ROLE_MAP[dept] ?? "office";

    return {
      id: item.id,
      name: item.name,
      department: dept || undefined,
      manager: getColumnText(item, "person") || undefined,
      email: getColumnText(item, "email") || undefined,
      phone: getColumnText(item, "phone") || undefined,
      status: getColumnText(item, "status__1") || undefined,
      startDate: getColumnText(item, "date") || undefined,
      location: getColumnText(item, "location") || undefined,
      pto: parseFloat(getColumnText(item, "numbers")) || undefined,
      role,
    };
  });
}

/**
 * Compute dashboard KPIs from project and task data.
 */
export function computeKPIs(projects: Project[], tasks: Task[], events: CalendarEvent[]): DashboardKPIs {
  const activeGroups = ["RELEASED", "Submitted for Production"];
  const pipelineGroups = ["PROPOSAL FOLLOW UP TO CLOSE"];

  return {
    activeInstalls: projects.filter((p) => activeGroups.includes(p.group)).length,
    revenuePipeline: projects
      .filter((p) => pipelineGroups.includes(p.group))
      .reduce((sum, p) => sum + (p.totalPrice ?? 0), 0),
    overdueTasks: tasks.filter((t) => t.status === "overdue").length,
    upcomingEvents: events.filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return d >= now && d <= weekFromNow;
    }).length,
  };
}
