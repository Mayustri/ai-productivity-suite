import { useRef, useState } from "react";

export function useAI<T>(task: "email" | "meeting" | "planner") {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ctrl = useRef<AbortController | null>(null);

  async function run(input: Record<string, string>) {
    ctrl.current?.abort();
    ctrl.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, input }),
        signal: ctrl.current.signal,
      });
      const json = await res.json().catch(() => ({ error: "Unexpected server response." }));
      if (!res.ok || json.error) throw new Error(json.error ?? "Request failed.");
      setData(json.data as T);
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e.message ?? "Request failed.");
    } finally {
      setLoading(false);
    }
  }
  function reset() {
    ctrl.current?.abort();
    setData(null);
    setError(null);
    setLoading(false);
  }
  return { data, setData, loading, error, run, reset };
}
