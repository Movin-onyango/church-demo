// app/admin/homepage/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@/lib/supabase-client";
import MediaUploader from "@/components/admin/MediaUploader";

type HomepageSectionType =
  | "hero"
  | "service_times"
  | "featured_sermon"
  | "visit_cards"
  | "giving_cta"
  | "announcements"
  | "custom_text";

type SectionContent = {
  title?: string;
  headline?: string;
  body?: string;
  subheadline?: string;
  [key: string]: unknown;
};

type Section = {
  id: number;
  section_type: HomepageSectionType;
  is_active: boolean;
  display_order: number;
  content: SectionContent;
};

const SECTION_TYPES: { key: HomepageSectionType; label: string }[] = [
  { key: "hero", label: "Hero Banner" },
  { key: "service_times", label: "Service Times" },
  { key: "featured_sermon", label: "Latest Sermon" },
  { key: "visit_cards", label: "First-Time Visit Cards" },
  { key: "giving_cta", label: "M-Pesa Giving" },
  { key: "announcements", label: "Announcements" },
  { key: "custom_text", label: "Custom Text & Media Block" },
];

export default function AdminHomepagePage() {
  const [supabase] = useState(() => createClient());
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Section | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setPageError(null);
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("id, section_type, is_active, display_order, content")
      .order("display_order", { ascending: true });

    if (error) {
      setPageError(`Could not load homepage sections: ${error.message}`);
      setSections([]);
    } else {
      setSections((data ?? []) as Section[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // The Supabase client is initialized once for this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleActive(section: Section) {
    const is_active = !section.is_active;
    const { error } = await supabase
      .from("homepage_sections")
      .update({ is_active })
      .eq("id", section.id);

    if (error) {
      setPageError(`Could not update section status: ${error.message}`);
      return;
    }
    setSections((current) =>
      current.map((item) =>
        item.id === section.id ? { ...item, is_active } : item,
      ),
    );
  }

  async function moveSection(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length || saving) return;

    const currentSection = sections[index];
    const targetSection = sections[targetIndex];
    setSaving(true);
    setPageError(null);

    const [first, second] = await Promise.all([
      supabase
        .from("homepage_sections")
        .update({ display_order: targetSection.display_order })
        .eq("id", currentSection.id),
      supabase
        .from("homepage_sections")
        .update({ display_order: currentSection.display_order })
        .eq("id", targetSection.id),
    ]);

    if (first.error || second.error) {
      setPageError(
        `Could not reorder sections: ${first.error?.message ?? second.error?.message ?? "Unknown database error"}`,
      );
      await load();
    } else {
      setSections((current) => {
        const reordered = [...current];
        [reordered[index], reordered[targetIndex]] = [
          reordered[targetIndex],
          reordered[index],
        ];
        return reordered;
      });
    }
    setSaving(false);
  }

  async function deleteSection(id: number) {
    if (!window.confirm("Delete this homepage section?")) return;
    setPageError(null);
    const { error } = await supabase
      .from("homepage_sections")
      .delete()
      .eq("id", id);

    if (error) {
      setPageError(`Could not delete section: ${error.message}`);
      return;
    }
    if (editing?.id === id) {
      setEditing(null);
      setIsCreating(false);
    }
    await load();
  }

  function startNewSection() {
    setIsCreating(true);
    setPageError(null);
    setSuccessMessage(null);
    setEditing({
      id: 0,
      section_type: "custom_text",
      is_active: true,
      display_order: 0,
      content: {},
    });
  }

  function updateContent(
    key: "title" | "headline" | "body" | "subheadline",
    value: string,
  ) {
    setEditing((current) =>
      current
        ? {
            ...current,
            content: { ...current.content, [key]: value },
          }
        : current,
    );
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || saving) return;

    setSaving(true);
    setPageError(null);
    setSuccessMessage(null);

    const payload = {
      section_type: editing.section_type,
      content: editing.content ?? {},
      is_active: editing.is_active,
    };

    let savedSuccessfully = false;

    if (isCreating) {
      const maxOrder = sections.reduce(
        (maximum, section) => Math.max(maximum, section.display_order),
        0,
      );
      const { error } = await supabase
        .from("homepage_sections")
        .insert({ ...payload, display_order: maxOrder + 1 });

      if (error) {
        setPageError(`Failed to create block: ${error.message}`);
      } else {
        savedSuccessfully = true;
      }
    } else {
      const { error } = await supabase
        .from("homepage_sections")
        .update(payload)
        .eq("id", editing.id);

      if (error) {
        setPageError(`Failed to update block: ${error.message}`);
      } else {
        savedSuccessfully = true;
      }
    }

    setSaving(false);

    if (!savedSuccessfully) return;

    // Close the editor immediately after a successful save. The confirmation
    // remains visible on the homepage builder page.
    setEditing(null);
    setIsCreating(false);
    setSuccessMessage(
      isCreating
        ? "Homepage block created and saved successfully."
        : "Homepage block changes saved successfully.",
    );
    await load();
  }

  function closeEditor() {
    setEditing(null);
    setIsCreating(false);
    setPageError(null);
  }

  return (
    <div className="max-w-4xl pb-20">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Homepage Builder</h1>
          <p className="mt-1 text-sm text-slate-500">
            Design your homepage layout with dynamic blocks and media.
          </p>
        </div>
        <button
          type="button"
          onClick={startNewSection}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          + Add New Block
        </button>
      </div>

      {pageError && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {pageError}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800"
        >
          <span aria-hidden="true">✓</span>
          {successMessage}
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            aria-label="Dismiss save confirmation"
            className="ml-auto text-green-700 hover:text-green-900"
          >
            &times;
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading homepage layout…</p>
      ) : sections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="font-semibold text-slate-800">No homepage sections found.</p>
          <p className="mt-1 text-sm text-slate-500">
            Add a block to start building your homepage.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`flex items-center gap-4 rounded-xl border p-4 ${
                section.is_active
                  ? "border-slate-200 bg-white shadow-sm"
                  : "border-slate-200 bg-slate-50 opacity-60"
              }`}
            >
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => void moveSection(index, "up")}
                  disabled={index === 0 || saving}
                  aria-label="Move section up"
                  className="p-1 text-xs text-slate-400 hover:text-slate-900 disabled:opacity-20"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => void moveSection(index, "down")}
                  disabled={index === sections.length - 1 || saving}
                  aria-label="Move section down"
                  className="p-1 text-xs text-slate-400 hover:text-slate-900 disabled:opacity-20"
                >
                  ▼
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold capitalize text-slate-900">
                  {section.section_type.replaceAll("_", " ")}
                </h3>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {section.content?.headline ||
                    section.content?.title ||
                    "No headline set"}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(section);
                    setIsCreating(false);
                    setPageError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-sm font-semibold text-amber-600 hover:underline"
                >
                  Edit Content & Media
                </button>
                <button
                  type="button"
                  onClick={() => void deleteSection(section.id)}
                  className="text-sm font-semibold text-red-600 hover:underline"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => void toggleActive(section)}
                  aria-label={section.is_active ? "Deactivate section" : "Activate section"}
                  aria-pressed={section.is_active}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    section.is_active ? "bg-green-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      section.is_active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isCreating ? "Add New Block" : "Edit Block"}
                </h2>
                {!isCreating && (
                  <p className="mt-1 text-xs text-slate-500">
                    Section ID: {editing.id}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeEditor}
                aria-label="Close editor"
                className="text-xl text-slate-400 hover:text-slate-900"
              >
                &times;
              </button>
            </div>

            <div className="space-y-8 p-6">
              {pageError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {pageError}
                </div>
              )}

              <div>
                <label
                  htmlFor="section-type"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Section Type
                </label>
                <select
                  id="section-type"
                  value={editing.section_type}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      section_type: event.target.value as HomepageSectionType,
                    })
                  }
                  disabled={!isCreating}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 disabled:bg-slate-100"
                >
                  {SECTION_TYPES.map((type) => (
                    <option key={type.key} value={type.key}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-bold text-slate-900">Content Settings</h3>
                <div>
                  <label
                    htmlFor="section-headline"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Headline / Title
                  </label>
                  <input
                    id="section-headline"
                    value={String(
                      editing.content?.headline ?? editing.content?.title ?? "",
                    )}
                    onChange={(event) =>
                      updateContent(
                        editing.content?.headline !== undefined ? "headline" : "title",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="section-body"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Body Text / Description
                  </label>
                  <textarea
                    id="section-body"
                    value={String(
                      editing.content?.subheadline ?? editing.content?.body ?? "",
                    )}
                    onChange={(event) =>
                      updateContent(
                        editing.content?.subheadline !== undefined
                          ? "subheadline"
                          : "body",
                        event.target.value,
                      )
                    }
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div
                className={`space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 ${
                  isCreating ? "opacity-50" : "opacity-100"
                }`}
                aria-disabled={isCreating}
              >
                <div>
                  <h3 className="font-bold text-slate-900">
                    Media (Images & Videos)
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Attach images and YouTube videos to this homepage block.
                  </p>
                </div>
                <fieldset
                  disabled={isCreating}
                  className={isCreating ? "pointer-events-none" : ""}
                >
                  <div className={isCreating ? "pointer-events-none" : ""}>
                    <MediaUploader
                      recordId={editing.id}
                      tableName="homepage_sections"
                    />
                  </div>
                </fieldset>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 rounded-b-2xl border-t border-slate-200 bg-white p-6">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg border border-slate-300 px-6 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-slate-900 px-6 py-2 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Block"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
