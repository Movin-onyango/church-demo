// components/admin/AdminTable.tsx
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { TableConfig, Field } from '@/lib/admin-fields';
import AdminForm from './AdminForm';

type Row = Record<string, any>;

export default function AdminTable({ config }: { config: TableConfig }) {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    let q = supabase.from(config.table).select('*');
    if (config.orderBy) q = q.order(config.orderBy.column, { ascending: config.orderBy.ascending });
    const { data, error } = await q;
    if (error) setMessage(error.message);
    else setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [config.table]);

  async function handleDelete(row: Row) {
    if (!confirm(`Delete this ${config.label.toLowerCase()} entry?`)) return;
    const { error } = await supabase.from(config.table).delete().eq('id', row.id);
    if (error) setMessage(error.message);
    else { setMessage('Deleted.'); load(); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{config.label}</h1>
          <p className="text-sm text-slate-500 mt-1">{rows.length} {rows.length === 1 ? 'entry' : 'entries'}</p>
        </div>
        <button onClick={() => { setCreating(true); setEditing(null); }}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800">
          + New {config.label}
        </button>
      </div>

      {message && (
        <div className="mb-4 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          No entries yet. Click "{`+ New ${config.label}`}" to add the first one.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
              <tr>
                {config.listColumns.map(c => <th key={c} className="text-left px-4 py-3">{c.replace(/_/g,' ')}</th>)}
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-t border-slate-100">
                  {config.listColumns.map(c => (
                    <td key={c} className="px-4 py-3 text-slate-700">
                      {typeof row[c] === 'boolean' ? (row[c] ? 'Yes' : 'No') : String(row[c] ?? '—')}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => { setEditing(row); setCreating(false); }}
                      className="text-amber-600 hover:underline font-medium text-sm mr-4">Edit</button>
                    <button onClick={() => handleDelete(row)}
                      className="text-red-600 hover:underline font-medium text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(editing || creating) && (
        <AdminForm
          config={config}
          initial={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); setMessage('Saved successfully'); load(); }}
        />
      )}
    </div>
  );
}