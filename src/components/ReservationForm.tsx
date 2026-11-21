"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Loader2, Minus, Plus } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { SessionUser } from "@/lib/types";

const SLOTS = Array.from({ length: 28 }, (_, i) => {
  const mins = 9 * 60 + i * 30;
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${mins % 60 === 0 ? "00" : "30"}`;
});

function todayTashkent() {
  return new Date(Date.now() + 5 * 3600_000).toISOString().slice(0, 10);
}

export function ReservationForm({ user }: { user: SessionUser | null }) {
  const [name, setName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [guests, setGuests] = useState(2);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ id: number; date: string; time: string; guests: number } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, date, time, guests, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save your reservation.");
      setDone({ id: data.id, date, time, guests });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {done ? (
        <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-[2rem] p-10 text-center">
          <CalendarCheck size={64} strokeWidth={1.3} className="mx-auto text-emerald-700" />
          <h2 className="mt-5 text-4xl font-semibold">Table requested</h2>
          <p className="mx-auto mt-3 max-w-sm text-mocha/75">
            Reservation <b>#{done.id}</b> for <b>{done.guests}</b> {done.guests === 1 ? "guest" : "guests"} on{" "}
            <b>{formatDate(done.date)}</b> at <b>{done.time}</b>. We&apos;ll confirm by phone shortly.
          </p>
          <button
            type="button"
            className="btn btn-primary mt-8"
            onClick={() => {
              setDone(null);
              setMessage("");
            }}
          >
            Make another reservation
          </button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass space-y-5 rounded-[2rem] p-7 sm:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="r-name">Full name</label>
              <input id="r-name" className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="label" htmlFor="r-phone">Phone number</label>
              <input id="r-phone" className="input" required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" />
            </div>
            <div>
              <label className="label" htmlFor="r-date">Date</label>
              <input id="r-date" className="input" required type="date" min={todayTashkent()} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="r-time">Time</label>
              <select id="r-time" className="input" value={time} onChange={(e) => setTime(e.target.value)}>
                {SLOTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="label">Number of guests</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 rounded-full border border-sand bg-white p-1">
                <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream-dark" aria-label="Fewer guests">
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center text-lg font-semibold tabular-nums" aria-live="polite">{guests}</span>
                <button type="button" onClick={() => setGuests((g) => Math.min(20, g + 1))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream-dark" aria-label="More guests">
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-sm text-mocha/60">Up to 20 guests online</span>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="r-msg">Additional message</label>
            <textarea id="r-msg" className="input min-h-28 resize-none" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Birthday, high chair, window seat, allergies…" />
          </div>

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

          <button type="submit" disabled={busy} className="btn btn-gold w-full">
            {busy && <Loader2 size={16} className="animate-spin" />}
            {busy ? "Reserving…" : "Reserve my table"}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
