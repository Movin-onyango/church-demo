"use client";

import { useState } from "react";

type Fund = "Tithe" | "Offering" | "Building Fund" | "Welfare";
const FUNDS: Fund[] = ["Tithe", "Offering", "Building Fund", "Welfare"];

type GiveFormProps = {
  paybill: string;
  accountPrefix: string;
};

export default function GiveForm({ paybill, accountPrefix }: GiveFormProps) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [fund, setFund] = useState<Fund>("Tithe");
  const [demoPreview, setDemoPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  function showDemoPreview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDemoPreview(true);
  }

  async function copyPaybill() {
    if (!paybill) return;
    setCopyError("");
    try {
      await navigator.clipboard.writeText(paybill);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Could not copy the Paybill number.", error);
      setCopyError("Copy failed. Select and copy the Paybill number instead.");
    }
  }

  return (
    <div>
      {demoPreview ? (
        <section
          aria-live="polite"
          className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-center"
        >
          <h2 className="text-lg font-bold">Giving demo preview</h2>
          <p className="mt-3 text-slate-700">
            KES {amount} · {fund}
          </p>
          <p className="mt-1 text-sm text-slate-600">Phone: {phone}</p>
          <p className="mt-4 text-sm font-medium text-amber-900">
            This is only a preview. No M-Pesa request was sent and no payment
            was made.
          </p>
          <button
            type="button"
            onClick={() => setDemoPreview(false)}
            className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white"
          >
            Back
          </button>
        </section>
      ) : (
        <>
          <form
            onSubmit={showDemoPreview}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
          >
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              Demo only: this form does not send an M-Pesa request or collect
              payment.
            </p>
            <div>
              <label
                htmlFor="giving-phone"
                className="mb-1 block text-sm font-medium"
              >
                Phone Number
              </label>
              <input
                id="giving-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="07XX XXX XXX"
                required
                pattern="[0-9+\\s]{10,15}"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label
                htmlFor="giving-amount"
                className="mb-1 block text-sm font-medium"
              >
                Amount (KES)
              </label>
              <input
                id="giving-amount"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="500"
                required
                min="1"
                step="1"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <fieldset>
              <legend className="mb-2 block text-sm font-medium">Fund</legend>
              <div className="grid grid-cols-2 gap-2">
                {FUNDS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={fund === option}
                    onClick={() => setFund(option)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                      fund === option
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
            <button
              type="submit"
              className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-500"
            >
              Preview Demo
            </button>
          </form>

          <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="mb-2 text-sm font-semibold">
              Pay manually via Paybill
            </h2>
            <div className="flex items-center gap-3">
              <code className="rounded border border-slate-300 bg-white px-3 py-1.5 font-mono text-lg">
                {paybill || "Not configured"}
              </code>
              {paybill && (
                <button
                  type="button"
                  onClick={copyPaybill}
                  className="text-sm font-medium text-amber-600 hover:underline"
                >
                  {copied ? "Copied ✓" : "Copy Paybill"}
                </button>
              )}
            </div>
            {copyError && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {copyError}
              </p>
            )}
            {accountPrefix && (
              <p className="mt-2 text-xs text-slate-500">
                Account: {accountPrefix} / your name
              </p>
            )}
          </section>
        </>
      )}
      <p className="mt-6 text-center text-xs text-slate-400">
        Demo flow · Real M-Pesa integration requires a verified payment
        provider.
      </p>
    </div>
  );
}
