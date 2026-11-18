"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";

type Status = "idle" | "loading" | "done" | "error";

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [status, setStatus] = useState<Status>("idle");

  async function triggerRebuild() {
    setStatus("loading");

    const { error } = await supabase.functions.invoke("trigger-pages-deploy", {
      method: "POST",
    });

    setStatus(error ? "error" : "done");
  }

  return (
    <section className="max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold">Dashboard</h1>
      <p className="mb-6 text-slate-600">
        Publish the latest site content to Cloudflare Pages.
      </p>
      <button
        onClick={triggerRebuild}
        disabled={status === "loading"}
        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
      >
        {status === "loading"
          ? "Building…"
          : status === "done"
            ? "Rebuild triggered ✓"
            : "Refresh Site"}
      </button>
      {status === "error" && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          Could not trigger a rebuild. Check the Edge Function setup and try
          again.
        </p>
      )}
    </section>
  );
}
