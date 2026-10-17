"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DailySummary() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      const { data, error } = await supabase
        .from("daily_summary")
        .select("summary, created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setSummary(data[0]);
      }
      setLoading(false);
    }
    fetchSummary();
  }, []);

  if (loading) return <div className="p-4 text-gray-400">Loading summary...</div>;
  if (!summary) return <div className="p-4 text-gray-400">No summary available.</div>;

  return (
    <div className="p-3 border border-border rounded-2xl bg-background">
      <p className="text-string-secondary leading-relaxed text-sm">{summary.summary}</p>
    </div>
  );
}
