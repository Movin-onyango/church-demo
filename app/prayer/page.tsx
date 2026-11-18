// app/prayer/page.tsx
'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';

type State = 'form' | 'sending' | 'success' | 'error';

export default function PrayerPage() {
  const supabase = createClient();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [request, setRequest] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [state, setState] = useState<State>('form');
  const [errorMsg, setErrorMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending');
    setErrorMsg('');

    const payload = {
      name: isAnonymous ? null : (name.trim() || null),
      phone: isAnonymous ? null : (phone.trim() || null),
      email: isAnonymous ? null : (email.trim() || null),
      request: request.trim(),
      is_anonymous: isAnonymous,
      is_urgent: isUrgent,
    };

    const { error } = await supabase.from('prayer_requests').insert(payload);

    if (error) {
      setErrorMsg(error.message);
      setState('error');
      return;
    }

    // Save contact locally so next visit prefills
    if (!isAnonymous) {
      try {
        localStorage.setItem('prayer_contact', JSON.stringify({ name, phone, email }));
      } catch {}
    }

    setState('success');
  }

  function reset() {
    setRequest('');
    setIsUrgent(false);
    setState('form');
  }

  if (state === 'success') {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center text-3xl">🙏</div>
        <h1 className="text-2xl font-bold mt-6">We received your request</h1>
        <p className="text-slate-600 mt-3">
          Our pastoral team will be praying for you this week. If you left contact details, someone may reach out.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset}
            className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold">
            Submit Another Request
          </button>
          <a href="/" className="px-5 py-2.5 rounded-lg border border-slate-300 font-semibold hover:bg-slate-50">
            Back to Home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">How Can We Pray for You?</h1>
        <p className="text-slate-600 mt-3">
          Whatever you are carrying today, you don't have to carry it alone. Share your prayer request — our pastoral team prays over every one.
        </p>
      </header>

      <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Your Prayer Request <span className="text-red-500">*</span>
          </label>
          <textarea value={request} onChange={e => setRequest(e.target.value)}
            required rows={5} minLength={5}
            placeholder="What would you like us to pray about?"
            className="w-full border border-slate-300 rounded-lg px-3 py-2" />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isAnonymous}
            onChange={e => setIsAnonymous(e.target.checked)}
            className="rounded border-slate-300" />
          Submit anonymously
        </label>

        {!isAnonymous && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Phone (optional)</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="07XX XXX XXX"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email (optional)</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2" />
              </div>
            </div>
          </>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isUrgent}
            onChange={e => setIsUrgent(e.target.checked)}
            className="rounded border-slate-300" />
          This is urgent (pastor should see today)
        </label>

        {errorMsg && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {errorMsg}
          </p>
        )}

        <button type="submit" disabled={state === 'sending'}
          className="w-full bg-slate-900 text-white rounded-lg py-3 font-semibold hover:bg-slate-800 disabled:opacity-50">
          {state === 'sending' ? 'Sending…' : 'Submit Prayer Request'}
        </button>

        <p className="text-xs text-slate-500 text-center">
          Requests are confidential. Only the pastoral team reads them.
        </p>
      </form>
    </main>
  );
}