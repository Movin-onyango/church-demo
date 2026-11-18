// app/admin/prayers/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

type Prayer = {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  request: string;
  is_anonymous: boolean;
  is_urgent: boolean;
  status: 'new' | 'praying' | 'answered' | 'archived';
  pastor_note: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<Prayer['status'], string> = {
  new: 'New',
  praying: 'Praying',
  answered: 'Answered',
  archived: 'Archived',
};

const STATUS_STYLES: Record<Prayer['status'], string> = {
  new: 'bg-amber-100 text-amber-800 border-amber-200',
  praying: 'bg-blue-100 text-blue-800 border-blue-200',
  answered: 'bg-green-100 text-green-800 border-green-200',
  archived: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function PrayersPage() {
  const supabase = createClient();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Prayer['status']>('new');
  const [selected, setSelected] = useState<Prayer | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('prayer_requests')
      .select('*')
      .order('is_urgent', { ascending: false })
      .order('created_at', { ascending: false });
    setPrayers((data as Prayer[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openPrayer(p: Prayer) {
    setSelected(p);
    setNote(p.pastor_note ?? '');
  }

  async function saveStatus(p: Prayer, newStatus: Prayer['status']) {
    setSaving(true);
    const { error } = await supabase
      .from('prayer_requests')
      .update({ status: newStatus, pastor_note: note, updated_at: new Date().toISOString() })
      .eq('id', p.id);
    setSaving(false);
    if (!error) {
      setSelected(null);
      setNote('');
      load();
    }
  }

  const filtered = filter === 'all' ? prayers : prayers.filter(p => p.status === filter);
  const newCount = prayers.filter(p => p.status === 'new').length;
  const urgentCount = prayers.filter(p => p.is_urgent && p.status === 'new').length;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Prayer Requests</h1>
        <p className="text-sm text-slate-500 mt-1">
          {newCount} new · {urgentCount} urgent
        </p>
      </header>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(['new','praying','answered','archived','all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
              filter === f
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}>
            {f === 'all' ? 'All' : STATUS_LABELS[f]}
            {f === 'new' && newCount > 0 && ` (${newCount})`}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          No prayer requests in this view.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <article key={p.id}
              className={`bg-white rounded-xl border p-5 ${
                p.is_urgent && p.status === 'new' ? 'border-red-300' : 'border-slate-200'
              }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${STATUS_STYLES[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                    {p.is_urgent && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-red-100 text-red-800 border-red-200">
                        Urgent
                      </span>
                    )}
                    {p.is_anonymous && (
                      <span className="text-xs text-slate-500">Anonymous</span>
                    )}
                  </div>
                  <p className="text-slate-800 whitespace-pre-wrap">{p.request}</p>
                  <p className="text-xs text-slate-500 mt-3">
                    {p.is_anonymous ? 'Anonymous' : (p.name || 'Unnamed')}
                    {' · '}
                    {new Date(p.created_at).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                  {!p.is_anonymous && (p.phone || p.email) && (
                    <p className="text-xs text-slate-500 mt-1">
                      {p.phone && <span>{p.phone}</span>}
                      {p.phone && p.email && ' · '}
                      {p.email && <span>{p.email}</span>}
                    </p>
                  )}
                  {p.pastor_note && (
                    <p className="text-xs text-slate-600 mt-2 italic border-l-2 border-slate-300 pl-2">
                      Note: {p.pastor_note}
                    </p>
                  )}
                </div>
                <button onClick={() => openPrayer(p)}
                  className="text-sm font-semibold text-amber-600 hover:underline flex-shrink-0">
                  Manage
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl"
            onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-3">Update Prayer Request</h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 mb-4">
              {selected.request}
            </p>
            <label className="block text-sm font-medium mb-1">Pastor's Note (internal)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="e.g. Called on Monday, will follow up next week"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4" />
            <div className="flex flex-wrap gap-2 mb-4">
              {(['new','praying','answered','archived'] as const).map(s => (
                <button key={s} onClick={() => saveStatus(selected, s)}
                  disabled={saving || selected.status === s}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                    selected.status === s
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}>
                  Mark as {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}