"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import type { HomepageSection } from "@/lib/data";

const SECTION_LABELS: Record<HomepageSection["section_type"], string> = {
  hero: "Hero Banner",
  service_times: "Service Times",
  featured_sermon: "Latest Sermon",
  visit_cards: "Visit Information Cards",
  giving_cta: "Giving Call to Action",
  announcements: "Announcements",
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

export default function AdminHomepagePage() {
  const supabase = useMemo(() => createClient(), []);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSections() {
      setLoading(true);
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("id,section_type,title,is_active,display_order")
        .order("display_order", { ascending: true });

      if (!active) return;
      if (error) {
        console.error("Could not load homepage sections.", error);
        setMessage(`Could not load homepage sections: ${error.message}`);
      } else {
        setSections((data ?? []) as HomepageSection[]);
        setMessage("");
      }
      setLoading(false);
    }

    void loadSections().catch((error: unknown) => {
      if (!active) return;
      console.error("Could not load homepage sections.", error);
      setMessage(`Could not load homepage sections: ${getErrorMessage(error)}`);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [supabase]);

  async function toggleActive(section: HomepageSection) {
    const isActive = !section.is_active;
    setSaving(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("homepage_sections")
        .update({ is_active: isActive })
        .eq("id", section.id);

      if (error) throw error;

      setSections((current) =>
        current.map((item) =>
          item.id === section.id ? { ...item, is_active: isActive } : item,
        ),
      );
    } catch (error) {
      console.error("Could not update homepage section visibility.", error);
      setMessage(
        `Could not update section visibility: ${getErrorMessage(error)}`,
      );
    } finally {
      setSaving(false);
    }
  }

  async function moveSection(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length || saving) return;

    const currentSection = sections[index];
    const targetSection = sections[targetIndex];
    setSaving(true);
    setMessage("");

    try {
      const firstUpdate = await supabase
        .from("homepage_sections")
        .update({ display_order: targetSection.display_order })
        .eq("id", currentSection.id);
      if (firstUpdate.error) throw firstUpdate.error;

      const secondUpdate = await supabase
        .from("homepage_sections")
        .update({ display_order: currentSection.display_order })
        .eq("id", targetSection.id);
      if (secondUpdate.error) throw secondUpdate.error;

      setSections((current) => {
        const reordered = [...current];
        reordered[index] = {
          ...targetSection,
          display_order: currentSection.display_order,
        };
        reordered[targetIndex] = {
          ...currentSection,
          display_order: targetSection.display_order,
        };
        return reordered;
      });
    } catch (error) {
      console.error("Could not reorder homepage sections.", error);
      setMessage(`Could not save the new order: ${getErrorMessage(error)}`);

      const { data, error: loadError } = await supabase
        .from("homepage_sections")
        .select("id,section_type,title,is_active,display_order")
        .order("display_order", { ascending: true });

      if (loadError) {
        console.error("Could not refresh homepage sections after reordering.", loadError);
        setMessage(
          `Could not save the new order or refresh sections: ${loadError.message}`,
        );
      } else {
        setSections((data ?? []) as HomepageSection[]);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Homepage Builder</h1>
        <p className="mt-1 text-sm text-slate-500">
          Reorder homepage sections and choose which ones are visible.
        </p>
      </div>

      {message && (
        <p
          role="alert"
          className="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
        >
          {message}
        </p>
      )}

      {loading ? (
        <p>Loading homepage sections…</p>
      ) : sections.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          No homepage sections were found. Apply the homepage sections
          migration, then refresh this page.
        </p>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => {
            const isOnlyVisibleSection =
              section.is_active &&
              sections.filter((item) => item.is_active).length === 1;

            return (
            <div
              key={section.id}
              className={`flex items-center gap-4 rounded-xl border p-4 ${
                section.is_active
                  ? "border-slate-200 bg-white"
                  : "border-slate-200 bg-slate-50 opacity-70"
              }`}
            >
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => void moveSection(index, -1)}
                  disabled={index === 0 || saving}
                  aria-label={`Move ${SECTION_LABELS[section.section_type]} up`}
                  className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => void moveSection(index, 1)}
                  disabled={index === sections.length - 1 || saving}
                  aria-label={`Move ${SECTION_LABELS[section.section_type]} down`}
                  className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                >
                  ▼
                </button>
              </div>

              <div className="flex-1">
                <h2 className="font-bold text-slate-900">
                  {section.title || SECTION_LABELS[section.section_type]}
                </h2>
                <p className="text-xs text-slate-500">
                  Section key: {section.section_type}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-semibold ${
                    section.is_active ? "text-green-700" : "text-slate-500"
                  }`}
                >
                  {section.is_active ? "Visible" : "Hidden"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={section.is_active}
                  aria-label={`Show ${SECTION_LABELS[section.section_type]}`}
                  disabled={saving || isOnlyVisibleSection}
                  title={
                    isOnlyVisibleSection
                      ? "At least one homepage section must remain visible."
                      : undefined
                  }
                  onClick={() => void toggleActive(section)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:cursor-wait ${
                    section.is_active ? "bg-green-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      section.is_active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
