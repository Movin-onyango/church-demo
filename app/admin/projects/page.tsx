// app/admin/projects/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

type Project = {
  id: number; title: string; slug: string; description: string;
  status: 'completed' | 'current' | 'upcoming';
  target_amount: number | null; raised_amount: number | null;
  start_date: string | null; is_published: boolean; display_order: number;
};

export default function AdminProjectsPage() {
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Core Form State
  const [form, setForm] = useState<Partial<Project>>({});
  
  // Relational State
  const [media, setMedia] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('projects').select('*').order('display_order');
    setProjects((data as Project[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function openForm(project?: Project) {
    if (project) {
      setEditing(project);
      setForm(project);
      
      // Fetch relational data
      const [mediaRes, fieldsRes] = await Promise.all([
        supabase.from('project_media').select('*').eq('project_id', project.id).order('display_order'),
        supabase.from('project_custom_fields').select('*').eq('project_id', project.id).order('display_order')
      ]);
      setMedia(mediaRes.data || []);
      setFields(fieldsRes.data || []);
    } else {
      setEditing(null);
      setForm({ status: 'current', is_published: true, display_order: projects.length + 1 });
      setMedia([]);
      setFields([]);
    }
    setIsCreating(true);
  }

  // Helper to generate slug
  function handleTitleChange(val: string) {
    setForm(prev => ({ 
      ...prev, 
      title: val, 
      slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') 
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // 1. Save Project Core
    const payload = {
      title: form.title,
      slug: form.slug,
      description: form.description,
      status: form.status,
      target_amount: form.target_amount || null,
      raised_amount: form.raised_amount || 0,
      start_date: form.start_date || null,
      is_published: form.is_published,
      display_order: form.display_order
    };

    let projectId = editing?.id;

    if (editing) {
      const { error } = await supabase.from('projects').update(payload).eq('id', editing.id);
      if (error) { alert(error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from('projects').insert(payload).select().single();
      if (error) { alert(error.message); setSaving(false); return; }
      projectId = data.id;
    }

    // 2. Sync Media
    // Delete existing to prevent duplicates (simplest approach for this scale)
    await supabase.from('project_media').delete().eq('project_id', projectId);
    if (media.length > 0) {
      const mediaPayload = media.map((m, i) => ({
        project_id: projectId,
        media_type: m.media_type,
        url: m.url,
        caption: m.caption,
        display_order: i
      }));
      await supabase.from('project_media').insert(mediaPayload);
    }

    // 3. Sync Custom Fields
    await supabase.from('project_custom_fields').delete().eq('project_id', projectId);
    if (fields.length > 0) {
      const fieldsPayload = fields.map((f, i) => ({
        project_id: projectId,
        field_key: f.field_key,
        field_value: f.field_value,
        display_order: i
      }));
      await supabase.from('project_custom_fields').insert(fieldsPayload);
    }

    setSaving(false);
    setIsCreating(false);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this project and all its media?')) return;
    await supabase.from('projects').delete().eq('id', id);
    load();
  }

  // --- Media Handlers ---
  async function uploadImage(file: File) {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { error } = await supabase.storage.from('project-images').upload(fileName, file);
    if (error) { alert(error.message); return; }
    const { data } = supabase.storage.from('project-images').getPublicUrl(fileName);
    setMedia(prev => [...prev, { media_type: 'image', url: data.publicUrl, caption: '' }]);
  }

  function addVideo() {
    setMedia(prev => [...prev, { media_type: 'youtube', url: '', caption: '' }]);
  }

  function updateMedia(index: number, key: string, value: string) {
    const newMedia = [...media];
    newMedia[index][key] = value;
    setMedia(newMedia);
  }

  function removeMedia(index: number) {
    setMedia(prev => prev.filter((_, i) => i !== index));
  }

  // --- Field Handlers ---
  function addField() {
    setFields(prev => [...prev, { field_key: '', field_value: '' }]);
  }

  function updateField(index: number, key: string, value: string) {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  }

  function removeField(index: number) {
    setFields(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">Manage church projects, media, and custom fields.</p>
        </div>
        <button onClick={() => openForm()} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800">
          + New Project
        </button>
      </div>

      {loading ? <p>Loading…</p> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Published</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 capitalize">{p.status}</td>
                  <td className="px-4 py-3">{p.is_published ? 'Yes' : 'Draft'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openForm(p)} className="text-amber-600 hover:underline mr-4">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center overflow-y-auto z-50 p-4">
          <form onSubmit={handleSave} className="bg-white rounded-xl w-full max-w-3xl my-8 shadow-xl">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-xl">
              <h2 className="font-bold text-lg">{editing ? 'Edit Project' : 'New Project'}</h2>
              <button type="button" onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* CORE INFO */}
              <section className="space-y-4">
                <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider">Core Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input value={form.title || ''} onChange={e => handleTitleChange(e.target.value)} required className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                    <input value={form.slug || ''} onChange={e => setForm({...form, slug: e.target.value})} required className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} required rows={4} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} className="w-full border border-slate-300 rounded-lg px-3 py-2">
                      <option value="current">Current</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Target Amount (KES)</label>
                    <input type="number" value={form.target_amount || ''} onChange={e => setForm({...form, target_amount: Number(e.target.value)})} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Raised Amount (KES)</label>
                    <input type="number" value={form.raised_amount || ''} onChange={e => setForm({...form, raised_amount: Number(e.target.value)})} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.is_published} onChange={e => setForm({...form, is_published: e.target.checked})} className="rounded border-slate-300" />
                    Published
                  </label>
                </div>
              </section>

              <hr className="border-slate-200" />

              {/* MEDIA GALLERY */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider">Media (Images & Videos)</h3>
                  <div className="flex gap-2">
                    <label className="text-xs font-semibold text-amber-600 hover:underline cursor-pointer">
                      + Upload Image
                      <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                    </label>
                    <button type="button" onClick={addVideo} className="text-xs font-semibold text-amber-600 hover:underline">+ Add YouTube</button>
                  </div>
                </div>
                
                {media.map((m, i) => (
                  <div key={i} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="w-20 h-20 bg-slate-200 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {m.media_type === 'image' ? <img src={m.url} className="w-full h-full object-cover" /> : 'YT'}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input value={m.url} onChange={e => updateMedia(i, 'url', e.target.value)} placeholder="URL or YouTube ID" className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white" readOnly={m.media_type === 'image'} />
                      <input value={m.caption || ''} onChange={e => updateMedia(i, 'caption', e.target.value)} placeholder="Caption (optional)" className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white" />
                    </div>
                    <button type="button" onClick={() => removeMedia(i)} className="text-red-500 text-sm font-medium mt-1">Remove</button>
                  </div>
                ))}
              </section>

              <hr className="border-slate-200" />

              {/* CUSTOM FIELDS */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider">Custom Details (Key/Value)</h3>
                  <button type="button" onClick={addField} className="text-xs font-semibold text-amber-600 hover:underline">+ Add Field</button>
                </div>
                <p className="text-xs text-slate-500">Add specific details like "Project Manager", "Land Size", or "Contractor".</p>
                
                {fields.map((f, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={f.field_key} onChange={e => updateField(i, 'field_key', e.target.value)} placeholder="Label (e.g. Contractor)" className="w-1/3 border border-slate-300 rounded px-3 py-2 text-sm" />
                    <input value={f.field_value} onChange={e => updateField(i, 'field_value', e.target.value)} placeholder="Value (e.g. BuildCo Ltd)" className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm" />
                    <button type="button" onClick={() => removeField(i)} className="text-red-500 text-sm font-medium px-2">✕</button>
                  </div>
                ))}
              </section>

            </div>
            
            <div className="p-6 border-t border-slate-200 flex justify-end gap-2 sticky bottom-0 bg-white rounded-b-xl z-10">
              <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Project'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}