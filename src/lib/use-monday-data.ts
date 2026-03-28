"use client";

import { useState, useEffect, useCallback } from "react";

type Resource = "tasks" | "projects" | "calendar" | "alerts" | "kpis" | "orders" | "team" | "installations";

interface UseMondayDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Client-side hook to fetch Monday.com data via the /api/monday route.
 * All portal data flows through this — Monday.com is the single source of truth.
 */
export function useMondayData<T>(resource: Resource): UseMondayDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/monday?resource=${resource}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || `Failed to load ${resource}`);
        setData(null);
      } else {
        setData(json.data as T);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
