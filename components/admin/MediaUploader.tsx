// components/admin/MediaUploader.tsx
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

type MediaItem = {
  id: number;
  type: 'image' | 'youtube' | 'audio';
  url: string;
  caption: string | null;
  display_order: number;
};

export default function MediaUploader({ 
  recordId, 
  tableName 
}: { 
  recordId: number; 
  tableName: string; 
}) {
  const supabase = createClient();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  async function loadMedia() {
    const { data } = await supabase
      .from('media')
      .select('*')
      .eq('record_id', recordId)
      .eq('table_name', tableName)
      .order('display_order');
    setMedia(data || []);
  }

  useEffect(() => { if (recordId) loadMedia(); }, [recordId]);

  async function uploadImage(file: File) {
    setUploading(true);
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    
    // Using the new clean bucket
    const { error } = await supabase.storage.from('church-media').upload(fileName, file);
    if (error) {
      alert("Storage Error: " + error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('church-media').getPublicUrl(fileName);
    
    await supabase.from('media').insert({
      record_id: recordId,
      table_name: tableName,
      type: 'image',
      url: data.publicUrl,
      display_order: media.length
    });

    setUploading(false);
    loadMedia();
  }

  async function addYouTube() {
    const videoId = prompt("Enter YouTube Video ID (e.g., dQw4w9WgXcQ):");
    if (!videoId) return;

    await supabase.from('media').insert({
      record_id: recordId,
      table_name: tableName,
      type: 'youtube',
      url: videoId,
      display_order: media.length
    });
    loadMedia();
  }

  async function removeMedia(id: number) {
    if (!confirm('Remove this media?')) return;
    await supabase.from('media').delete().eq('id', id);
    loadMedia();
  }

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-900">Media Gallery (Optional)</h3>
        <div className="flex gap-4">
          <label className={`cursor-pointer text-sm font-semibold ${uploading ? 'text-slate-400' : 'text-amber-600 hover:underline'}`}>
            {uploading ? 'Uploading…' : '+ Upload Image'}
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
          </label>
          <button type="button" onClick={addYouTube} className="text-sm font-semibold text-amber-600 hover:underline">+ YouTube Link</button>
        </div>
      </div>

      {media.length === 0 ? (
        <p className="text-sm text-slate-500">No media added yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {media.map(m => (
            <div key={m.id} className="relative group bg-white rounded-lg border border-slate-200 overflow-hidden">
              {m.type === 'image' ? (
                <img src={m.url} className="w-full h-24 object-cover" />
              ) : (
                <div className="w-full h-24 bg-slate-900 flex items-center justify-center text-white text-xs">YouTube</div>
              )}
              <button type="button" onClick={() => removeMedia(m.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}