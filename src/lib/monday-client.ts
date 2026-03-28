/**
 * Monday.com GraphQL API client for NSEC Portal.
 *
 * In production, this calls Monday.com's API v2 using a server-side API key.
 * For demo/development, it falls back to mock data when MONDAY_API_KEY is not set.
 */

import { BOARD_IDS, type MondayItem } from "./monday-types";

const MONDAY_API_URL = "https://api.monday.com/v2";

function getApiKey(): string | undefined {
  return process.env.MONDAY_API_KEY;
}

interface MondayQueryResult {
  data: Record<string, unknown>;
  errors?: { message: string }[];
}

/**
 * Execute a GraphQL query against Monday.com API v2.
 */
export async function mondayQuery(query: string, variables?: Record<string, unknown>): Promise<MondayQueryResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("MONDAY_API_KEY not configured");
  }

  const res = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
      "API-Version": "2024-10",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Monday.com API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Check if Monday.com integration is configured.
 */
export function isMondayConfigured(): boolean {
  return !!getApiKey();
}

/**
 * Fetch items from a board with specific columns.
 */
export async function fetchBoardItems(
  boardId: string,
  options?: {
    limit?: number;
    groupIds?: string[];
    columnIds?: string[];
    cursor?: string;
  }
): Promise<{ items: MondayItem[]; cursor: string | null }> {
  const limit = options?.limit ?? 50;

  // Build query_params for filtering by group
  const queryParams = options?.groupIds
    ? `, query_params: { rules: [{column_id: "group", compare_value: [${options.groupIds.map((g) => `"${g}"`).join(",")}]}] }`
    : "";

  const query = options?.cursor
    ? `query { next_items_page(cursor: "${options.cursor}", limit: ${limit}) { cursor items { id name group { id title } column_values { id text value } } } }`
    : `query { boards(ids: [${boardId}]) { items_page(limit: ${limit}${queryParams}) { cursor items { id name group { id title } column_values { id text value } } } } }`;

  const result = await mondayQuery(query);
  const data = result.data as Record<string, unknown>;

  if (options?.cursor) {
    const page = data.next_items_page as { cursor: string | null; items: MondayItem[] };
    return { items: page.items, cursor: page.cursor };
  }

  const boards = data.boards as { items_page: { cursor: string | null; items: MondayItem[] } }[];
  const page = boards[0]?.items_page;
  return { items: page?.items ?? [], cursor: page?.cursor ?? null };
}

/**
 * Helper: extract a column text value from an item.
 */
export function getColumnText(item: MondayItem, columnId: string): string {
  return item.column_values.find((c) => c.id === columnId)?.text ?? "";
}

/**
 * Helper: extract and parse a column JSON value from an item.
 */
export function getColumnValue<T>(item: MondayItem, columnId: string): T | null {
  const col = item.column_values.find((c) => c.id === columnId);
  if (!col?.value) return null;
  try {
    return JSON.parse(col.value) as T;
  } catch {
    return null;
  }
}

// Board ID re-export for convenience
export { BOARD_IDS };
