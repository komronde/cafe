"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Loader2, LogOut, Receipt, ShieldCheck, UserRound } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatDateTime, formatUZS } from "@/lib/format";
import type { SessionUser } from "@/lib/types";

type OrderRow = {
  id: number;
  status: string;
  totalUzs: number;
  fulfillment: string;
  address: string;
  notes: string;
  createdAt: string;
  items: { id: number; name: string; quantity: number; unitPriceUzs: number }[];
};
type ResRow = { id: number; date: string; time: string; guests: number; status: string; message: string };
type Data = { user: SessionUser; orders: OrderRow[]; reservations: ResRow[] };

const TABS = [
  { id: "orders", label: "Order history", icon: Receipt },
  { id: "reservations", label: "Reservations", icon: CalendarDays },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "security", label: "Security", icon: ShieldCheck },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function AccountClient({ initialUser }: { initialUser: SessionUser }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("orders");
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/account");
    if (res.status === 401) {
      router.push("/auth/login?next=/account");
      return;
    }
    setData(await res.json());
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const user = data?.user ?? initialUser;

  return (
    <>
      <section className="bg-espresso pb-16 pt-40 text-cream">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-6">
          <div>
            <p className="eyebrow !text-gold-light">My account</p>
            <h1 className="mt-3 text-5xl leading-none md:text-7xl">
              Hello, <em className="text-gold-light">{user.fullName.split(" ")[0] || "friend"}</em>
            </h1>
            <p className="mt-4 text-cream/65">{user.email}</p>
          </div>
          <div className="flex gap-3">
            {user.role === "admin" && (
              <Link href="/admin" className="btn btn-gold btn-sm">Admin dashboard</Link>
            )}
            <button type="button" onClick={logout} className="btn btn-ghost btn-sm text-cream"><LogOut size={14} /> Sign out</button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-sand pb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex flex-none items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                tab === t.id ? "bg-espresso text-cream" : "text-mocha hover:bg-white"
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="grid place-items-center py-24"><Loader2 className="animate-spin text-caramel" /></div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                {tab === "orders" && <Orders orders={data?.orders ?? []} />}
                {tab === "reservations" && <Reservations rows={data?.reservations ?? []} />}
                {tab === "profile" && <Profile user={user} onSaved={load} />}
                {tab === "security" && <Security />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>
    </>
  );
}

function Empty({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <div className="glass rounded-[2rem] p-14 text-center">
      <h3 className="text-4xl font-semibold">{title}</h3>
      <p className="mt-2 text-mocha/70">{text}</p>
      <Link href={href} className="btn btn-primary mt-6">{cta}</Link>
    </div>
  );
}

function Orders({ orders }: { orders: OrderRow[] }) {
  if (orders.length === 0)
    return <Empty title="No orders yet" text="Your orders will appear here once you place one." href="/menu" cta="Explore menu" />;
  return (
    <ul className="grid gap-5 lg:grid-cols-2">
      {orders.map((o) => (
        <li key={o.id} className="glass rounded-[1.75rem] p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-3xl font-semibold">Order #{o.id}</p>
              <p className="text-sm text-mocha/60">{formatDateTime(o.createdAt)} · {o.fulfillment === "delivery" ? "Delivery" : "Pickup"}</p>
            </div>
            <StatusBadge status={o.status} />
          </div>
          <ul className="mt-4 divide-y divide-sand text-sm">
            {o.items.map((i) => (
              <li key={i.id} className="flex justify-between py-2">
                <span>{i.quantity} × {i.name}</span>
                <span className="text-mocha/70">{formatUZS(i.quantity * i.unitPriceUzs)}</span>
              </li>
            ))}
          </ul>
          {o.notes && <p className="mt-3 text-xs italic text-mocha/60">“{o.notes}”</p>}
          <p className="mt-4 flex justify-between border-t border-sand pt-4 font-semibold">
            <span>Total</span><span className="text-caramel-dark">{formatUZS(o.totalUzs)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

function Reservations({ rows }: { rows: ResRow[] }) {
  if (rows.length === 0)
    return <Empty title="No reservations" text="Book a table and it will show up here." href="/reservations" cta="Book a table" />;
  return (
    <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {rows.map((r) => (
        <li key={r.id} className="glass rounded-[1.75rem] p-6">
          <div className="flex items-start justify-between">
            <p className="font-display text-3xl font-semibold">{formatDate(r.date)}</p>
            <StatusBadge status={r.status} />
          </div>
          <p className="mt-1 text-mocha/70">{r.time} · {r.guests} {r.guests === 1 ? "guest" : "guests"}</p>
          {r.message && <p className="mt-3 text-sm italic text-mocha/60">“{r.message}”</p>}
        </li>
      ))}
    </ul>
  );
}

function Profile({ user, onSaved }: { user: SessionUser; onSaved: () => void }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.address);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone, address }),
    });
    const d = await res.json();
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Profile saved." });
      onSaved();
      router.refresh();
    } else setMsg({ ok: false, text: d.error || "Could not save." });
  }

  return (
    <form onSubmit={save} className="glass max-w-2xl space-y-5 rounded-[2rem] p-8">
      <div>
        <label className="label" htmlFor="p-email">Email</label>
        <input id="p-email" className="input opacity-70" value={user.email} disabled readOnly />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="p-name">Full name</label>
          <input id="p-name" className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="p-phone">Phone</label>
          <input id="p-phone" className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="p-addr">Default delivery address</label>
        <input id="p-addr" className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, building, apartment" />
      </div>
      {msg && <p className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"}`}>{msg.text}</p>}
      <button type="submit" disabled={busy} className="btn btn-primary">{busy && <Loader2 size={16} className="animate-spin" />} Save profile</button>
    </form>
  );
}

function Security() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current, next }),
    });
    const d = await res.json();
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Password updated." });
      setCurrent("");
      setNext("");
    } else setMsg({ ok: false, text: d.error || "Could not update password." });
  }

  return (
    <form onSubmit={save} className="glass max-w-xl space-y-5 rounded-[2rem] p-8">
      <h3 className="text-3xl font-semibold">Change password</h3>
      <div>
        <label className="label" htmlFor="s-cur">Current password</label>
        <input id="s-cur" className="input" type="password" required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="s-new">New password</label>
        <input id="s-new" className="input" type="password" required minLength={8} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="At least 8 characters" />
      </div>
      {msg && <p className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"}`}>{msg.text}</p>}
      <button type="submit" disabled={busy} className="btn btn-primary">{busy && <Loader2 size={16} className="animate-spin" />} Update password</button>
    </form>
  );
}
