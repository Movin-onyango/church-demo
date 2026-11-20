
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { TableConfig } from '@/lib/admin-fields';
import MediaUploader from './MediaUploader';

export default function AdminForm({
  config,
  initial,
  onClose,
  onSaved,
}: {
  config: TableConfig;
  initial: Record<string, any> | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const isEdit = !!initial;

  const initialValues: Record<string, any> = {};

  for (const f of config.fields) {
    initialValues[f.name] =
      initial?.[f.name] ??
      f.defaultValue ??
      (f.type === 'boolean' ? false : '');
  }

  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Holds the database ID after a record is created or when editing.
  const [savedId, setSavedId] = useState<number | null>(
    initial?.id ?? null,
  );

  function set(name: string, v: any) {
    setValues((prev) => ({
      ...prev,
      [name]: v,
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setError('');

    const payload: Record<string, any> = {};

    for (const f of config.fields) {
      let v = values[f.name];

      if (v === '' || v === undefined) {
        v = null;
      }

      if (f.type === 'number' && v !== null) {
        v = Number(v);
      }

      if (f.type === 'boolean') {
        v = !!v;
      }

      payload[f.name] = v;
    }

    try {
      if (savedId !== null) {
        // UPDATE MODE
        const { error } = await supabase
          .from(config.table)
          .update(payload)
          .eq('id', savedId);

        if (error) {
          setError(error.message);
          return;
        }

        // Keep the form open so the user can manage media.
        onSaved();
      } else {
        // CREATE MODE
        const { data, error } = await supabase
          .from(config.table)
          .insert(payload)
          .select('id')
          .single();

        if (error) {
          setError(error.message);
          return;
        }

        if (!data?.id) {
          setError('The record was saved, but its ID could not be retrieved.');
          return;
        }

        // The record now exists. Enable MediaUploader immediately.
        setSavedId(data.id);

        // Reload table data without closing this form.
        onSaved();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while saving.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center overflow-y-auto z-50 p-4">
      <form
        onSubmit={save}
        className="bg-white rounded-xl w-full max-w-2xl my-8 shadow-xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-lg">
            {isEdit ? 'Edit' : 'New'} {config.label}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
            aria-label="Close form"
          >
            ✕
          </button>
        </div>

        {/* Form fields */}
        <div className="p-6 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          {config.fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium mb-1">
                {f.label}
                {f.required && (
                  <span className="text-red-500"> *</span>
                )}
              </label>

              {f.type === 'textarea' ? (
                <textarea
                  value={values[f.name] ?? ''}
                  onChange={(e) => set(f.name, e.target.value)}
                  required={f.required}
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              ) : f.type === 'select' ? (
                <select
                  value={values[f.name] ?? ''}
                  onChange={(e) => set(f.name, e.target.value)}
                  required={f.required}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">— select —</option>

                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : f.type === 'boolean' ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!values[f.name]}
                    onChange={(e) => set(f.name, e.target.checked)}
                    className="rounded border-slate-300"
                  />

                  <span>{f.label}</span>
                </label>
              ) : (
                <input
                  type={
                    f.type === 'number'
                      ? 'number'
                      : f.type === 'date'
                        ? 'date'
                        : f.type === 'time'
                          ? 'time'
                          : 'text'
                  }
                  value={values[f.name] ?? ''}
                  onChange={(e) => set(f.name, e.target.value)}
                  required={f.required}
                  step={f.type === 'number' ? 'any' : undefined}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              )}

              {f.helpText && (
                <p className="text-xs text-slate-500 mt-1">
                  {f.helpText}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Media Section: available after a record has an ID */}
        {savedId !== null && (
          <div className="px-6 pb-6 bg-slate-50 border-t border-slate-200">
            <p className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wider pt-4">
              Saved! Now you can add media.
            </p>

            <MediaUploader
              recordId={savedId}
              tableName={config.table}
            />
          </div>
        )}

        {/* Actions */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
          >
            {saving
              ? 'Saving…'
              : savedId !== null
                ? 'Save Changes'
                : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
