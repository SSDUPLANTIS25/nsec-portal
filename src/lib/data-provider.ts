/**
 * Data provider — Monday.com is the sole data source.
 *
 * All portal data comes from Monday.com GraphQL API via MONDAY_API_KEY.
 * No mock/fallback data. If the key isn't configured, pages show a setup prompt.
 */

import { isMondayConfigured, fetchBoardItems, BOARD_IDS } from "./monday-client";
import {
  transformTasks,
  transformProjects,
  transformInstallations,
  transformMeetings,
  transformOrders,
  transformEmployees,
  generateAlerts,
  installationsToCalendarEvents,
  ordersToCalendarEvents,
  computeKPIs,
} from "./data-transforms";
import type {
  Task,
  CalendarEvent,
  Alert,
  Project,
  Installation,
  Order,
  Employee,
  DashboardKPIs,
} from "./monday-types";

// ─── Connection Check ────────────────────────────────────────────────────────

export function isMondayConnected(): boolean {
  return isMondayConfigured();
}

// ─── Tasks (Requests & Tasks board) ──────────────────────────────────────────

export async function getTasks(): Promise<Task[]> {
  const { items } = await fetchBoardItems(BOARD_IDS.REQUESTS_TASKS, { limit: 200 });
  return transformTasks(items);
}

// ─── Calendar Events (merged: Meetings + Installations + Ordering ETAs) ──────

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const [meetingsRes, installRes, ordersRes] = await Promise.all([
    fetchBoardItems(BOARD_IDS.MEETINGS, { limit: 100 }),
    fetchBoardItems(BOARD_IDS.INSTALLATION, { limit: 100 }),
    fetchBoardItems(BOARD_IDS.ORDERING, { limit: 100 }),
  ]);

  const meetings = transformMeetings(meetingsRes.items);
  const installs = installationsToCalendarEvents(transformInstallations(installRes.items));
  const deliveries = ordersToCalendarEvents(transformOrders(ordersRes.items));

  return [...meetings, ...installs, ...deliveries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

// ─── Alerts (generated from Installation board overdue items) ────────────────

export async function getAlerts(): Promise<Alert[]> {
  const { items } = await fetchBoardItems(BOARD_IDS.INSTALLATION, { limit: 200 });
  const installations = transformInstallations(items);
  return generateAlerts(installations);
}

// ─── Projects (Project Index board) ──────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const { items } = await fetchBoardItems(BOARD_IDS.PROJECT_INDEX, { limit: 200 });
  return transformProjects(items);
}

// ─── Installations ───────────────────────────────────────────────────────────

export async function getInstallations(): Promise<Installation[]> {
  const { items } = await fetchBoardItems(BOARD_IDS.INSTALLATION, { limit: 200 });
  return transformInstallations(items);
}

// ─── Orders (Ordering board) ─────────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  const { items } = await fetchBoardItems(BOARD_IDS.ORDERING, { limit: 200 });
  return transformOrders(items);
}

// ─── Employees (Employee Directory board) ────────────────────────────────────

export async function getEmployees(): Promise<Employee[]> {
  const { items } = await fetchBoardItems(BOARD_IDS.EMPLOYEE_DIRECTORY, { limit: 200 });
  return transformEmployees(items);
}

// ─── Dashboard KPIs (computed from Projects + Tasks + Events) ────────────────

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const [projects, tasks, events] = await Promise.all([
    getProjects(),
    getTasks(),
    getCalendarEvents(),
  ]);

  return computeKPIs(projects, tasks, events);
}
