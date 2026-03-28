// Monday.com board IDs for NSEC workspace
export const BOARD_IDS = {
  REQUESTS_TASKS: "18398842181",
  PROJECT_INDEX: "18398836223",
  INSTALLATION: "18399893998",
  EMPLOYEE_DIRECTORY: "18398842284",
  ORDERING: "18398843260",
  MEETINGS: "18398837529",
} as const;

// Monday.com API response types

export interface MondayColumn {
  id: string;
  text: string;
  value: string | null;
}

export interface MondayItem {
  id: string;
  name: string;
  group: { id: string; title: string };
  column_values: MondayColumn[];
  created_at?: string;
  updated_at?: string;
}

export interface MondayBoard {
  id: string;
  name: string;
  items_page: {
    cursor: string | null;
    items: MondayItem[];
  };
}

// Parsed column value helpers
export interface MondayPeopleValue {
  personsAndTeams: { id: number; kind: string }[];
}

export interface MondayStatusValue {
  index: number;
  label: string;
}

export interface MondayDateValue {
  date: string;
  time?: string;
}

export interface MondayTimelineValue {
  from: string;
  to: string;
}

export interface MondayLocationValue {
  lat: number;
  lng: number;
  address: string;
}

export interface MondayLinkValue {
  url: string;
  text?: string;
}

// Portal-specific types aligned to Monday.com schema

export type UserRole = "field" | "office" | "management";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  phone?: string;
  mondayUserId?: number;
}

export type TaskStatus = "overdue" | "not_viewed" | "in_progress" | "pending" | "complete";
export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  project: string;
  status: TaskStatus;
  dueDate: string;
  assignee: string;
  assigneeId?: number;
  priority: TaskPriority;
  description?: string;
  projectManager?: string;
  mondayItemId?: string;
  mondayGroupId?: string;
  mondayBoardId?: string;
}

export type CalendarEventType = "installation" | "meeting" | "delivery" | "training" | "deadline";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  location?: string;
  type: CalendarEventType;
  attendees?: string[];
  teamsLink?: string;
  mondayItemId?: string;
  sourceBoardId?: string;
}

export type AlertSeverity = "warning" | "info" | "urgent";

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: AlertSeverity;
  timestamp: string;
  projectId?: string;
  mondayItemId?: string;
}

export interface Project {
  id: string;
  name: string;
  jobNumber?: string;
  companyName?: string;
  projectManager?: string;
  location?: string;
  installWindow?: { from: string; to: string };
  currentStage?: string;
  leadStatus?: string;
  proposalStatus?: string;
  installationStatus?: string;
  totalPrice?: number;
  balance?: number;
  income?: number;
  systems?: string[];
  description?: string;
  group: string; // Pipeline stage group
  mondayItemId?: string;
}

export type InstallJobStatus = "In Progress" | "Phase Done" | "Totally Complete";

export interface Installation {
  id: string;
  name: string;
  jobStatus: InstallJobStatus | string;
  date: string;
  projectManager?: string;
  installer?: string;
  crew?: string[];
  crewSize?: number;
  totalHours?: number;
  pmScore?: number;
  productionRating?: number;
  adminStatus?: string;
  mondayItemId?: string;
}

export type OrderStatus = "Sent" | "Received" | "Late" | "Canceled" | "Confirmed" | string;

export interface Order {
  id: string;
  name: string;
  status: OrderStatus;
  materials?: string;
  vendor?: string;
  dateOrdered?: string;
  eta?: string;
  vendorOrderNumber?: string;
  trackingStatus?: string;
  mondayItemId?: string;
}

export interface Employee {
  id: string;
  name: string;
  department?: string;
  manager?: string;
  email?: string;
  phone?: string;
  status?: "Current" | "Past" | "Onboarding" | string;
  startDate?: string;
  location?: string;
  pto?: number;
  role: UserRole;
}

// Navigation types (unchanged)
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

// Dashboard KPI types
export interface DashboardKPIs {
  activeInstalls: number;
  revenuePipeline: number;
  overdueTasks: number;
  upcomingEvents: number;
}
