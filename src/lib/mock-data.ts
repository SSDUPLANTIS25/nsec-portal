import { Task, CalendarEvent, Alert, User } from "./types";

export const currentUser: User = {
  id: "1",
  name: "Seth Duplantis",
  email: "seth@nationalstage.com",
  role: "management",
};

export const tasks: Task[] = [
  { id: "1", title: "Rig motorized curtain track — Riverfront Plaza", project: "Riverfront Plaza", status: "overdue", dueDate: "2026-03-25", assignee: "Mike Torres", priority: "high" },
  { id: "2", title: "QC stage curtain panels — Highland Office", project: "Highland Office", status: "overdue", dueDate: "2026-03-24", assignee: "Jake Ellis", priority: "high" },
  { id: "3", title: "Order replacement motor — Eastside Mall", project: "Eastside Mall", status: "in_progress", dueDate: "2026-03-28", assignee: "Seth Duplantis", priority: "high" },
  { id: "4", title: "Submit install photos — Lakewood Church", project: "Lakewood Church", status: "in_progress", dueDate: "2026-03-29", assignee: "Mike Torres", priority: "medium" },
  { id: "5", title: "Schedule pre-install walkthrough — Dallas ISD PAC", project: "Dallas ISD PAC", status: "pending", dueDate: "2026-04-01", assignee: "Seth Duplantis", priority: "medium" },
  { id: "6", title: "Finalize BOM — Convention Center Retrofit", project: "Convention Center", status: "not_viewed", dueDate: "2026-03-30", assignee: "Jake Ellis", priority: "medium" },
  { id: "7", title: "Coordinate freight delivery — Bass Hall", project: "Bass Hall", status: "pending", dueDate: "2026-04-02", assignee: "Lisa Nguyen", priority: "low" },
  { id: "8", title: "Complete safety training module", project: "Internal", status: "not_viewed", dueDate: "2026-04-05", assignee: "All Staff", priority: "low" },
  { id: "9", title: "Final punch list — Granville Theater", project: "Granville Theater", status: "complete", dueDate: "2026-03-20", assignee: "Mike Torres", priority: "medium" },
  { id: "10", title: "Invoice sent — Majestic Theatre drape install", project: "Majestic Theatre", status: "complete", dueDate: "2026-03-18", assignee: "Seth Duplantis", priority: "low" },
];

export const calendarEvents: CalendarEvent[] = [
  { id: "1", title: "Riverfront Plaza — Install Day 2", date: "2026-03-27", time: "7:00 AM", location: "1200 Commerce St, Dallas", type: "installation" },
  { id: "2", title: "Highland Office — Curtain QC", date: "2026-03-27", time: "1:00 PM", location: "4500 Oak Lawn Ave, Dallas", type: "installation" },
  { id: "3", title: "Weekly Ops Sync", date: "2026-03-27", time: "4:00 PM", type: "meeting" },
  { id: "4", title: "Eastside Mall — Motor Delivery", date: "2026-03-28", time: "9:00 AM", location: "3800 Eastside Blvd, Mesquite", type: "delivery" },
  { id: "5", title: "Dallas ISD PAC — Walkthrough", date: "2026-04-01", time: "10:00 AM", location: "2700 Flora St, Dallas", type: "installation" },
  { id: "6", title: "Safety Cert Training", date: "2026-04-02", time: "2:00 PM", type: "training" },
  { id: "7", title: "Bass Hall — Freight Receiving", date: "2026-04-02", time: "8:00 AM", location: "525 Commerce St, Fort Worth", type: "delivery" },
];

export const alerts: Alert[] = [
  { id: "1", title: "Riverfront Plaza", message: "Installation 2 days outside window — was due 3/25", type: "urgent", timestamp: "2026-03-27T08:00:00" },
  { id: "2", title: "Highland Office", message: "QC deadline passed — curtain panels awaiting inspection", type: "warning", timestamp: "2026-03-27T07:30:00" },
  { id: "3", title: "Eastside Mall", message: "Replacement motor backordered — ETA updated to 3/30", type: "warning", timestamp: "2026-03-26T16:00:00" },
];

export const taskCounts = {
  overdue: tasks.filter((t) => t.status === "overdue").length,
  not_viewed: tasks.filter((t) => t.status === "not_viewed").length,
  in_progress: tasks.filter((t) => t.status === "in_progress").length,
  pending: tasks.filter((t) => t.status === "pending").length,
  complete: tasks.filter((t) => t.status === "complete").length,
};

export const commCounts = {
  emails: 3,
  mentions: 2,
  calls: 1,
  sms: 3,
  orders: 5,
  chat: 7,
  meetings: 3,
};
