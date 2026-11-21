"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send your message.");
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="glass rounded-[2rem] p-10 text-center">
        <CheckCircle2 size={56} strokeWidth={1.4} className="mx-auto text-emerald-700" />
        <h3 className="mt-4 text-4xl font-semibold">Message sent</h3>
        <p className="mt-2 text-mocha/70">Thank you. We&apos;ll get back to you as soon as possible.</p>
        <button type="button" className="btn btn-primary mt-6" onClick={() => setSent(false)}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass space-y-5 rounded-[2rem] p-7 sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="k-name">Name</label>
          <input id="k-name" className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
        </div>
        <div>
          <label className="label" htmlFor="k-email">Email</label>
          <input id="k-email" className="input" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="k-msg">Message</label>
        <textarea id="k-msg" className="input min-h-36 resize-none" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" />
      </div>
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <button type="submit" disabled={busy} className="btn btn-primary w-full sm:w-auto">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
