"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-client";

type State = "form" | "sending" | "success" | "error";

export default function PrayerPage() {
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [request, setRequest] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [state, setState] = useState<State>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!showToast) return;
    const timer = window.setTimeout(() => setShowToast(false), 5000);
    return () => window.clearTimeout(timer);
  }, [showToast]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setErrorMsg("");
    setShowToast(false);

    const payload = {
      name: isAnonymous ? null : name.trim() || null,
      phone: isAnonymous ? null : phone.trim() || null,
      email: isAnonymous ? null : email.trim() || null,
      request: request.trim(),
      is_anonymous: isAnonymous,
      is_urgent: isUrgent,
    };

    try {
      const { error } = await supabase.from("prayer_requests").insert(payload);
      if (error) {
        setErrorMsg(error.message);
        setState("error");
        return;
      }

      if (!isAnonymous) {
        try {
          localStorage.setItem(
            "prayer_contact",
            JSON.stringify({ name, phone, email }),
          );
        } catch (error) {
          console.warn("Could not save prayer contact details locally.", error);
        }
      }

      setState("success");
      setShowToast(true);
    } catch (error) {
      console.error("Could not submit prayer request.", error);
      setErrorMsg(
        "We could not send your request. Please check your connection and try again.",
      );
      setState("error");
    }
  }

  function reset() {
    setRequest("");
    setIsUrgent(false);
    setErrorMsg("");
    setShowToast(false);
    setState("form");
  }

  return (
    <main className="min-h-full bg-slate-50 px-4 py-12 md:py-16">
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="toast-enter fixed right-4 top-24 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-green-200 bg-white px-5 py-4 text-sm font-semibold text-green-900 shadow-xl"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700"
          >
            ✓
          </span>
          Your prayer request was sent. We&apos;ll be praying with you.
        </div>
      )}

      <div className="mx-auto max-w-xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            How Can We Pray for You?
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Whatever you are carrying today, you don&apos;t have to carry it
            alone. Share your prayer request — our pastoral team prays over
            every one.
          </p>
        </header>

        {state === "success" ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl md:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
              🙏
            </div>
            <h2 className="mb-2 mt-6 text-2xl font-bold text-slate-900">
              We received your request
            </h2>
            <p className="mb-8 text-slate-600">
              Our pastoral team will be praying for you this week. If you left
              contact details, someone may reach out.
            </p>
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-slate-900 px-8 py-3 font-bold text-white transition hover:bg-slate-800"
            >
              Submit Another Request
            </button>
          </section>
        ) : (
          <form
            onSubmit={submit}
            className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-8"
          >
            <div>
              <label
                htmlFor="prayer-request"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Your Prayer Request <span className="text-red-500">*</span>
              </label>
              <textarea
                id="prayer-request"
                value={request}
                onChange={(event) => setRequest(event.target.value)}
                required
                rows={5}
                minLength={5}
                placeholder="What would you like us to pray about?"
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(event) => setIsAnonymous(event.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>
                <span className="block font-semibold text-slate-900">
                  Submit anonymously
                </span>
                <span className="text-sm text-slate-500">
                  Your name and contact will not be saved.
                </span>
              </span>
            </label>

            {!isAnonymous && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="prayer-name"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Name
                  </label>
                  <input
                    id="prayer-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="prayer-phone"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Phone (optional)
                  </label>
                  <input
                    id="prayer-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="07XX XXX XXX"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="prayer-email"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Email (optional)
                  </label>
                  <input
                    id="prayer-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 transition hover:bg-red-100">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(event) => setIsUrgent(event.target.checked)}
                className="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500"
              />
              <span>
                <span className="block font-semibold text-red-900">
                  This is urgent
                </span>
                <span className="text-sm text-red-700">
                  Pastor should see this today.
                </span>
              </span>
            </label>

            {errorMsg && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
              >
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={state === "sending"}
              className="w-full rounded-xl bg-slate-900 py-4 text-lg font-bold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-50"
            >
              {state === "sending" ? "Sending…" : "Submit Prayer Request"}
            </button>
            <p className="text-center text-xs text-slate-500">
              Requests are confidential. Only the pastoral team reads them.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
