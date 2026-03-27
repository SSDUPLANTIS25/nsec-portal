export type UserRole = "field" | "office" | "management";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  project: string;
  status: "overdue" | "not_viewed" | "in_progress" | "pending" | "complete";
  dueDate: string;
  assignee: string;
  priority: "high" | "medium" | "low";
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  type: "installation" | "meeting" | "delivery" | "training";
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: "warning" | "info" | "urgent";
  timestamp: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}
