// app/admin/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-1">Admin Login</h1>
        <p className="text-sm text-slate-500 mb-6">Church staff only</p>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <label className="block text-sm font-medium mb-1">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4" />
        <label className="block text-sm font-medium mb-1">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-6" />
        <button disabled={loading}
          className="w-full bg-slate-900 text-white rounded-lg py-2 font-semibold hover:bg-slate-800 disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}