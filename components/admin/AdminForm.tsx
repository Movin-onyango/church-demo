// components/admin/AdminForm.tsx
'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { TableConfig } from '@/lib/admin-fields';

export default function AdminForm({
  config, initial, onClose, onSaved,
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
    initialValues[f.name] = initial?.[f.name] ?? f.defaultValue ?? (f.type === 'boolean' ? false : '');
  }

  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(name: string, v: any) { setValues(prev => ({ ...prev, [name]: v })); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload: Record<string, any> = {};
    for (const f of config.fields) {
      let v = values[f.name];
      if (v === '' || v === undefined) v = null;
      if (f.type === 'number' && v !== null) v = Number(v);
      if (f.type === 'boolean') v = !!v;
      payload[f.name] = v;
    }

    const { error } = isEdit
      ? await supabase.from(config.table).update(payload).eq('id', initial!.id)
      : await supabase.from(config.table).insert(payload);

    setSaving(false);
    if (error) setError(error.message);
    else onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center overflow-y-auto z-50 p-4">
      <form onSubmit={save} className="bg-white rounded-xl w-full max-w-2xl my-8 shadow-xl">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-lg">{isEdit ? 'Edit' : 'New'} {config.label}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
          {config.fields.map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium mb-1">
                {f.label}{f.required && <span className="text-red-500"> *</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea value={values[f.name] ?? ''} onChange={e => set(f.name, e.target.value)}
                  required={f.required} rows={4}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              ) : f.type === 'select' ? (
                <select value={values[f.name] ?? ''} onChange={e => set(f.name, e.target.value)}
                  required={f.required}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">— select —</option>
                  {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : f.type === 'boolean' ? (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!values[f.name]} onChange={e => set(f.name, e.target.checked)}
                    className="rounded border-slate-300" />
                  <span>{f.label}</span>
                </label>
              ) : (
                <input type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'time' ? 'time' : 'text'}
                  value={values[f.name] ?? ''} onChange={e => set(f.name, e.target.value)}
                  required={f.required} step={f.type === 'number' ? 'any' : undefined}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              )}
              {f.helpText && <p className="text-xs text-slate-500 mt-1">{f.helpText}</p>}
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-slate-200 flex justify-end gap-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium">Cancel</button>
          <button disabled={saving}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}