/**
 * Transform Monday.com API responses into portal-ready data structures.
 *
 * Each function takes raw Monday.com items and returns typed portal objects.
 * Column IDs are mapped to the NSEC Monday.com workspace (account 33659457).
 */

import {
  type MondayItem,
  type MondayStatusValue,
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
  BOARD_IDS,
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

// ─── Transform Functions ─────────────────────────────────────────────────────

/**
 * Transform Tasks board items into portal Task objects.
 * Board: Tasks (18398842181)
 */
export function transformTasks(items: MondayItem[]): Task[] {
  return items.map((item) => {
    const statusVal = getColumnValue<MondayStatusValue>(item, "color_mm0eee6y");
    const statusLabel = statusVal?.label ?? getColumnText(item, "color_mm0eee6y");
    const dueDate = getColumnText(item, "date_mm0eg1mp");
    const status = mapTaskStatus(statusLabel, dueDate);
    const priority = deriveTaskPriority(status, dueDate);

    return {
      id: item.id,
      title: item.name,
      project: item.group.title,
      status,
      dueDate: dueDate || "",
      assignee: getColumnText(item, "multiple_person_mm0eb2qj") || "Unassigned",
      priority,
      description: getColumnText(item, "text_mm0ev8kj") || undefined,
      projectManager: undefined,
      mondayItemId: item.id,
      mondayGroupId: item.group.id,
      mondayBoardId: BOARD_IDS.REQUESTS_TASKS,
    };
  });
}

/**
 * Transform Project Index board items into portal Project objects.
 * Board: Project Index (18398836223)
 */
export function transformProjects(items: MondayItem[]): Project[] {
  return items.map((item) => {
    return {
      id: item.id,
      name: item.name,
      jobNumber: getColumnText(item, "text_mm0d6q14") || undefined,
      companyName: getColumnText(item, "text_mm0d1xyw") || undefined,
      projectManager: getColumnText(item, "project_owner") || undefined,
      location: getColumnText(item, "text_mm0dj91z") || undefined,
      installWindow: undefined,
      currentStage: item.group.title || undefined,
      leadStatus: undefined,
      proposalStatus: getColumnText(item, "color_mm0dqg57") || undefined,
      installationStatus: undefined,
      totalPrice: parseFloat(getColumnText(item, "numeric_mm0dp3x0")) || undefined,
      balance: undefined,
      income: undefined,
      systems: undefined,
      description: getColumnText(item, "long_text_mm0dy1mz") || undefined,
      group: item.group.title,
      mondayItemId: item.id,
    };
  });
}

/**
 * Transform Install Reports board items into portal Installation objects.
 * Board: Install Reports (18399893998)
 */
export function transformInstallations(items: MondayItem[]): Installation[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    jobStatus: getColumnText(item, "color_mm13q6sp") || getColumnText(item, "color_mm13bxbc") || "In Progress",
    date: getColumnText(item, "date4") || "",
    projectManager: getColumnText(item, "person") || undefined,
    installer: getColumnText(item, "multiple_person_mm136w3q") || undefined,
    crewSize: undefined,
    totalHours: parseFloat(getColumnText(item, "text_mm13jt22")) || undefined,
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

    if (install.jobStatus !== "Totally Complete" && install.jobStatus !== "Yes" && installDate < today) {
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
 * Transform Meeting Notes board items into CalendarEvent objects.
 * Board: Meeting Notes (18398837529)
 */
export function transformMeetings(items: MondayItem[]): CalendarEvent[] {
  return items.map((item) => ({
    id: item.id,
    title: item.name,
    date: getColumnText(item, "date_mm09raq5") || "",
    time: "",
    endTime: undefined,
    attendees: getColumnText(item, "multiple_person_mm09zqtd") ? getColumnText(item, "multiple_person_mm09zqtd").split(", ") : undefined,
    teamsLink: undefined,
    type: "meeting" as CalendarEventType,
    mondayItemId: item.id,
    sourceBoardId: BOARD_IDS.MEETINGS,
  }));
}

/**
 * Transform Installation items into calendar events (for combined calendar view).
 */
export function installationsToCalendarEvents(installations: Installation[]): CalendarEvent[] {
  return installations
    .filter((i) => i.date && i.jobStatus !== "Totally Complete" && i.jobStatus !== "Yes")
    .map((i) => ({
      id: `install-${i.id}`,
      title: `${i.name} — Install`,
      date: i.date,
      time: "7:00 AM",
      type: "installation" as CalendarEventType,
      mondayItemId: i.mondayItemId,
      sourceBoardId: BOARD_IDS.INSTALLATION,
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
      sourceBoardId: BOARD_IDS.ORDERING,
    }));
}

/**
 * Transform Orders board items into portal Order objects.
 * Board: Orders (18398843260)
 */
export function transformOrders(items: MondayItem[]): Order[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    status: getColumnText(item, "color_mm0gyhjv") || getColumnText(item, "status") || "Unknown",
    materials: getColumnText(item, "text_mm0gcgvy") || undefined,
    vendor: getColumnText(item, "text_mm0gyvvc") || undefined,
    dateOrdered: getColumnText(item, "date_mm0gdp7m") || undefined,
    eta: getColumnText(item, "date_mm0g5kd0") || undefined,
    vendorOrderNumber: getColumnText(item, "text_mm0ga4yp") || undefined,
    trackingStatus: getColumnText(item, "text_mm0gs5g0") || undefined,
    mondayItemId: item.id,
  }));
}

/**
 * Transform Contacts board items into portal Employee objects.
 * Board: Contacts (18398842284)
 */
export function transformEmployees(items: MondayItem[]): Employee[] {
  return items.map((item) => {
    return {
      id: item.id,
      name: item.name,
      department: undefined,
      manager: undefined,
      email: getColumnText(item, "email_mm0gqxr2") || undefined,
      phone: getColumnText(item, "text_mm0g18g2") || undefined,
      status: getColumnText(item, "status") || undefined,
      startDate: undefined,
      location: getColumnText(item, "text_mm0gy9yb") || undefined,
      pto: undefined,
      role: "office" as UserRole,
    };
  });
}

/**
 * Compute dashboard KPIs from project and task data.
 */
export function computeKPIs(projects: Project[], tasks: Task[], events: CalendarEvent[]): DashboardKPIs {
  const activeGroups = ["RELEASED", "Submitted for Production", "Released"];
  const pipelineGroups = ["PROPOSAL FOLLOW UP TO CLOSE", "Proposal Follow Up To Close"];

  return {
    activeInstalls: projects.filter((p) => activeGroups.some(g => p.group.toUpperCase() === g.toUpperCase())).length,
    revenuePipeline: projects
      .filter((p) => pipelineGroups.some(g => p.group.toUpperCase() === g.toUpperCase()))
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
