"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-client";

type Group = {
  id: string | number;
  name: string;
  area: string;
  meeting_day: string | null;
  meeting_time: string | null;
  leader_name: string | null;
  whatsapp_number: string | null;
};

type LoadState = "loading" | "ready" | "error";

export default function GroupsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [groups, setGroups] = useState<Group[]>([]);
  const [area, setArea] = useState("All");
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let active = true;

    async function loadGroups() {
      const { data, error } = await supabase
        .from("small_groups")
        .select(
          "id,name,area,meeting_day,meeting_time,leader_name,whatsapp_number",
        )
        .eq("is_active", true)
        .order("area");

      if (!active) return;
      if (error) {
        console.error("Could not load small groups.", error);
        setState("error");
        return;
      }

      setGroups((data ?? []) as Group[]);
      setState("ready");
    }

    void loadGroups();
    return () => {
      active = false;
    };
  }, [supabase]);

  const areas = ["All", ...new Set(groups.map((group) => group.area).sort())];
  const filtered =
    area === "All" ? groups : groups.filter((group) => group.area === area);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl">Find Your Jumuiya</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Community happens in homes across Nairobi. Pick your area, then
          contact a group leader on WhatsApp.
        </p>
      </header>

      <div className="mb-6">
        <label
          htmlFor="group-area"
          className="mb-2 block text-sm font-medium"
        >
          Filter by area
        </label>
        <select
          id="group-area"
          value={area}
          onChange={(event) => setArea(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          {areas.map((groupArea) => (
            <option key={groupArea} value={groupArea}>
              {groupArea}
            </option>
          ))}
        </select>
      </div>

      {state === "loading" ? (
        <p className="text-slate-500">Loading groups…</p>
      ) : state === "error" ? (
        <p role="alert" className="text-red-600">
          Groups couldn&apos;t be loaded. Please try again later.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-500">No groups in this area yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((group) => (
            <article
              key={group.id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                {group.area}
              </p>
              <h2 className="mt-1 font-bold">{group.name}</h2>
              {(group.meeting_day || group.meeting_time) && (
                <p className="mt-2 text-sm text-slate-600">
                  {[group.meeting_day, group.meeting_time]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              {group.leader_name && (
                <p className="mt-1 text-sm text-slate-500">
                  Leader: {group.leader_name}
                </p>
              )}
              {group.whatsapp_number && (
                <a
                  href={`https://wa.me/${encodeURIComponent(group.whatsapp_number)}?text=${encodeURIComponent(
                    `Hi ${group.leader_name ?? "there"}, I found ${group.name} on the church website and would like to visit.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
                >
                  WhatsApp {group.leader_name?.split(" ")[0] ?? "Leader"}
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
