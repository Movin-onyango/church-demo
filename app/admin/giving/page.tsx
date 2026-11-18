// app/admin/giving/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

type Section = {
  id: number;
  title: string;
  body: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
};

export default function AdminGivingPage() {
  const supabase = createClient();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Section | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('giving_sections').select('*').order('display_order');
    setSections((data as Section[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openForm(section?: Section) {
    if (section) {
      setEditing(section);
      setTitle(section.title);
      setBody(section.body);
      setDisplayOrder(section.display_order);
      setIsActive(section.is_active);
      setCurrentImageUrl(section.image_url);
    } else {
      setEditing(null);
      setTitle('');
      setBody('');
      setDisplayOrder(sections.length + 1);
      setIsActive(true);
      setCurrentImageUrl(null);
    }
    setImageFile(null);
    setIsCreating(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    let finalImageUrl = currentImageUrl;

    // 1. Upload image if a new one was selected
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('giving-images')
        .upload(fileName, imageFile);
      
      if (uploadError) {
        alert('Error uploading image: ' + uploadError.message);
        setSaving(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('giving-images').getPublicUrl(fileName);
      finalImageUrl = publicUrl;
    }

    // 2. Save to database
    const payload = {
      title,
      body,
      display_order: displayOrder,
      is_active: isActive,
      image_url: finalImageUrl,
    };

    const { error } = editing
      ? await supabase.from('giving_sections').update(payload).eq('id', editing.id)
      : await supabase.from('giving_sections').insert(payload);

    setSaving(false);
    if (error) {
      alert('Error saving: ' + error.message);
    } else {
      setIsCreating(false);
      load();
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this section?')) return;
    await supabase.from('giving_sections').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Giving Impact Sections</h1>
          <p className="text-sm text-slate-500 mt-1">Manage the stories shown under the M-Pesa form.</p>
        </div>
        <button onClick={() => openForm()} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800">
          + New Section
        </button>
      </div>

      {loading ? <p>Loading…</p> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map(s => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{s.title}</td>
                  <td className="px-4 py-3">{s.display_order}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                      {s.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openForm(s)} className="text-amber-600 hover:underline mr-4">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center overflow-y-auto z-50 p-4">
          <form onSubmit={handleSave} className="bg-white rounded-xl w-full max-w-2xl my-8 shadow-xl">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-bold text-lg">{editing ? 'Edit' : 'New'} Impact Section</h2>
              <button type="button" onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full border border-slate-300 rounded-lg px-3 py-2" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Body Text</label>
                <textarea value={body} onChange={e => setBody(e.target.value)} required rows={6} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                <p className="text-xs text-slate-500 mt-1">Press Enter to create new paragraphs.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Display Order</label>
                  <input type="number" value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} required className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded border-slate-300" />
                    Active (visible on site)
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <label className="block text-sm font-medium mb-2">Image (Optional)</label>
                {currentImageUrl && !imageFile && (
                  <div className="mb-3">
                    <img src={currentImageUrl} alt="Current" className="h-32 object-cover rounded-lg border border-slate-200" />
                    <button type="button" onClick={() => setCurrentImageUrl(null)} className="text-xs text-red-600 mt-1 hover:underline">Remove image</button>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-sm" />
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Section'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}