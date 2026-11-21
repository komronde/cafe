"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { adminFetch, card, ErrorNote, PageHeader, Spinner, Toggle } from "@/components/admin/shared";
import type { Settings } from "@/lib/types";

export function AdminSettings() {
  const [s, setS] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    adminFetch<{ item: Settings }>("settings")
      .then((d) => setS(d.item))
      .catch((e) => setErr(e.message));
  }, []);

  if (!s) return err ? <ErrorNote message={err} /> : <Spinner />;

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => {
    setOk(false);
    setS({ ...s, [k]: v });
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!s) return;
    setBusy(true);
    setErr("");
    setOk(false);
    try {
      await adminFetch("settings", { method: "PUT", body: s });
      setOk(true);
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  const field = (label: string, key: keyof Omit<Settings, "hours">, placeholder = "") => (
    <div>
      <label className="label" htmlFor={`st-${key}`}>{label}</label>
      <input id={`st-${key}`} className="input" value={s[key]} placeholder={placeholder} onChange={(e) => set(key, e.target.value)} />
    </div>
  );

  return (
    <>
      <PageHeader title="Cafe settings" sub="Contact information and opening hours shown across the website." />
      <form onSubmit={save} className="grid gap-6 xl:grid-cols-2">
        <div className={`${card} space-y-5 p-6`}>
          <h2 className="text-3xl font-semibold">Contact information</h2>
          {field("Cafe name", "name")}
          {field("Tagline", "tagline")}
          <div className="grid gap-5 sm:grid-cols-2">
            {field("Phone", "phone", "+998 90 123 45 67")}
            {field("WhatsApp number", "whatsapp", "998901234567")}
            {field("Telegram username", "telegram", "aurumcafe")}
            {field("Instagram username", "instagram", "aurumcafe")}
          </div>
          {field("Email", "email")}
          {field("Address", "address")}
          {field("Google Maps search query", "mapQuery", "Street, city")}
        </div>

        <div className={`${card} space-y-4 p-6`}>
          <h2 className="text-3xl font-semibold">Opening hours</h2>
          {s.hours.map((h, i) => (
            <div key={h.day} className="grid grid-cols-[6rem_1fr_1fr] items-center gap-3 sm:grid-cols-[7rem_1fr_1fr_auto]">
              <span className="text-sm font-semibold">{h.day}</span>
              <input
                type="time"
                aria-label={`${h.day} opens`}
                disabled={h.closed}
                className="input !py-2 disabled:opacity-40"
                value={h.open}
                onChange={(e) => set("hours", s.hours.map((x, k) => (k === i ? { ...x, open: e.target.value } : x)))}
              />
              <input
                type="time"
                aria-label={`${h.day} closes`}
                disabled={h.closed}
                className="input !py-2 disabled:opacity-40"
                value={h.close}
                onChange={(e) => set("hours", s.hours.map((x, k) => (k === i ? { ...x, close: e.target.value } : x)))}
              />
              <div className="col-span-3 sm:col-span-1">
                <Toggle checked={h.closed} onChange={(v) => set("hours", s.hours.map((x, k) => (k === i ? { ...x, closed: v } : x)))} label="Closed" />
              </div>
            </div>
          ))}
        </div>

        <div className="xl:col-span-2">
          <ErrorNote message={err} />
          {ok && <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Settings saved. The website now shows the updated details.</p>}
          <button type="submit" disabled={busy} className="btn btn-primary">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save settings
          </button>
        </div>
      </form>
    </>
  );
}
