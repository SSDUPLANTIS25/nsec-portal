/**
 * API route for fetching Monday.com data.
 *
 * GET /api/monday?resource=tasks|projects|calendar|alerts|kpis|orders|team
 *
 * Monday.com is the sole data source. Returns 503 if MONDAY_API_KEY is not configured.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getTasks,
  getCalendarEvents,
  getAlerts,
  getProjects,
  getInstallations,
  getOrders,
  getEmployees,
  getDashboardKPIs,
  isMondayConnected,
} from "@/lib/data-provider";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isMondayConnected()) {
    return NextResponse.json(
      { error: "Monday.com not connected. Set MONDAY_API_KEY environment variable." },
      { status: 503 }
    );
  }

  const resource = request.nextUrl.searchParams.get("resource");

  try {
    let data: unknown;

    switch (resource) {
      case "tasks":
        data = await getTasks();
        break;
      case "calendar":
        data = await getCalendarEvents();
        break;
      case "alerts":
        data = await getAlerts();
        break;
      case "projects":
        data = await getProjects();
        break;
      case "installations":
        data = await getInstallations();
        break;
      case "orders":
        data = await getOrders();
        break;
      case "team":
        data = await getEmployees();
        break;
      case "kpis":
        data = await getDashboardKPIs();
        break;
      default:
        return NextResponse.json(
          { error: "Invalid resource. Use: tasks, projects, calendar, alerts, kpis, orders, team" },
          { status: 400 }
        );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error(`[Monday API] Error fetching ${resource}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch from Monday.com", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
