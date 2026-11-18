// app/admin/settings/page.tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

const SETTING_FIELDS = [
  { key: 'church_name', label: 'Church Name' },
  { key: 'church_tagline', label: 'Tagline' },
  { key: 'hero_headline', label: 'Hero Headline' },
  { key: 'hero_subheadline', label: 'Hero Subheadline', textarea: true },
  { key: 'hero_primary_cta_text', label: 'Primary CTA Text' },
  { key: 'hero_primary_cta_link', label: 'Primary CTA Link' },
  { key: 'hero_secondary_cta_text', label: 'Secondary CTA Text' },
  { key: 'hero_secondary_cta_link', label: 'Secondary CTA Link' },
  { key: 'contact_phone', label: 'Contact Phone' },
  { key: 'contact_email', label: 'Contact Email' },
  { key: 'contact_address', label: 'Address' },
  { key: 'mpesa_paybill', label: 'M-Pesa Paybill' },
  { key: 'mpesa_account_prefix', label: 'M-Pesa Account Prefix' },
  { key: 'live_stream_url', label: 'Live Stream URL' },
  { key: 'live_stream_enabled', label: 'Live Stream Enabled (true/false)' },
];

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.from('site_settings').select('key,value').then(({ data, error }) => {
      if (error) {
        console.error('Could not load site settings.', error);
        setMessage('Could not load site settings.');
        setLoading(false);
        return;
      }
      const rows = (data ?? []) as { key: string; value: string }[];
      setValues(Object.fromEntries(rows.map(({ key, value }) => [key, value])));
      setLoading(false);
    });
  }, [supabase]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMessage('');
    const upserts = SETTING_FIELDS.map(f => ({
      key: f.key,
      value: values[f.key] ?? (f.key === 'live_stream_enabled' ? 'false' : ''),
    }));
    const { error } = await supabase.from('site_settings').upsert(upserts);
    setSaving(false);
    setMessage(error ? error.message : 'Saved successfully.');
  }

  if (loading) return <p>Loading…</p>;

  return (
    <form onSubmit={save} className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>
      {message && <p className="mb-4 text-sm bg-amber-50 border border-amber-200 rounded px-3 py-2">{message}</p>}
      <div className="space-y-4">
        {SETTING_FIELDS.map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium mb-1">{f.label}</label>
            {f.textarea ? (
              <textarea value={values[f.key] ?? ''} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            ) : f.key === 'live_stream_enabled' ? (
              <select value={values[f.key] ?? 'false'} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                <option value="false">Disabled</option>
                <option value="true">Enabled</option>
              </select>
            ) : (
              <input value={values[f.key] ?? ''} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            )}
          </div>
        ))}
      </div>
      <button disabled={saving} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold disabled:opacity-50">
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </form>
  );
}