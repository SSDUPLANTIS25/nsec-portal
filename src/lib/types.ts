/**
 * Re-export all types from monday-types for backward compatibility.
 * All type definitions now live in monday-types.ts aligned with Monday.com schema.
 */
export type {
  UserRole,
  User,
  Task,
  TaskStatus,
  TaskPriority,
  CalendarEvent,
  CalendarEventType,
  Alert,
  AlertSeverity,
  Project,
  Installation,
  Order,
  Employee,
  NavGroup,
  NavItem,
  DashboardKPIs,
} from "./monday-types";
