"use client";

import { useState } from "react";
import { Check, Phone, Trash2, X } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { adminFetch, card, ErrorNote, PageHeader, Spinner, useAdminList } from "@/components/admin/shared";
import { formatDate, formatDateTime, formatUZS } from "@/lib/format";

type Reservation = {
  id: number;
  customerName: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  message: string;
  status: string;
  createdAt: string;
};

export function AdminReservations() {
  const { items, loading, error, reload } = useAdminList<Reservation>("reservations");
  const [err, setErr] = useState("");

  async function setStatus(id: number, status: string) {
    try {
      await adminFetch("reservations", { method: "PUT", body: { id, status } });
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }
  async function remove(id: number) {
    if (!confirm("Delete this reservation?")) return;
    try {
      await adminFetch("reservations", { method: "DELETE", query: `?id=${id}` });
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <>
      <PageHeader title="Reservations" sub="Confirm or cancel table bookings." />
      <ErrorNote message={error || err} />
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <p className={`${card} p-10 text-center text-mocha/60`}>No reservations yet.</p>
      ) : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-sand text-xs uppercase tracking-widest text-mocha/60">
              <tr>
                <th className="p-4">Guest</th>
                <th className="p-4">When</th>
                <th className="p-4">Party</th>
                <th className="p-4">Message</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {items.map((r) => (
                <tr key={r.id}>
                  <td className="p-4">
                    <p className="font-semibold">{r.customerName}</p>
                    <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 text-xs text-mocha/70 hover:text-caramel"><Phone size={11} /> {r.phone}</a>
                  </td>
                  <td className="p-4 whitespace-nowrap">{formatDate(r.date)}<br /><span className="text-mocha/60">{r.time}</span></td>
                  <td className="p-4">{r.guests}</td>
                  <td className="max-w-[240px] p-4 text-mocha/70">{r.message || "—"}</td>
                  <td className="p-4"><StatusBadge status={r.status} /></td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1.5">
                      <button type="button" onClick={() => setStatus(r.id, "confirmed")} disabled={r.status === "confirmed"} className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-emerald-800 transition hover:bg-emerald-200 disabled:opacity-30" aria-label="Confirm reservation" title="Confirm"><Check size={15} /></button>
                      <button type="button" onClick={() => setStatus(r.id, "cancelled")} disabled={r.status === "cancelled"} className="grid h-9 w-9 place-items-center rounded-full bg-amber-100 text-amber-800 transition hover:bg-amber-200 disabled:opacity-30" aria-label="Cancel reservation" title="Cancel"><X size={15} /></button>
                      <button type="button" onClick={() => remove(r.id)} className="grid h-9 w-9 place-items-center rounded-full text-mocha/50 transition hover:bg-red-50 hover:text-red-700" aria-label="Delete reservation" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

type Customer = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  fullName: string | null;
  phone: string | null;
  address: string | null;
  orderCount: number;
  spent: number;
};

export function AdminCustomers({ meId }: { meId: string }) {
  const { items, loading, error, reload } = useAdminList<Customer>("customers");
  const [err, setErr] = useState("");

  async function toggleRole(c: Customer) {
    const to = c.role === "admin" ? "customer" : "admin";
    if (!confirm(`${to === "admin" ? "Grant admin access to" : "Remove admin access from"} ${c.email}?`)) return;
    try {
      await adminFetch("customers", { method: "PUT", body: { id: c.id, role: to } });
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <>
      <PageHeader title="Customers" sub="Registered accounts and their ordering activity." />
      <ErrorNote message={error || err} />
      {loading ? (
        <Spinner />
      ) : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-sand text-xs uppercase tracking-widest text-mocha/60">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Spent</th>
                <th className="p-4 text-right">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {items.map((c) => (
                <tr key={c.id}>
                  <td className="p-4">
                    <p className="font-semibold">{c.fullName || "—"}</p>
                    <p className="text-xs text-mocha/60">{c.email}</p>
                  </td>
                  <td className="p-4 text-mocha/70">{c.phone || "—"}<br /><span className="text-xs">{c.address}</span></td>
                  <td className="p-4 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                  <td className="p-4">{c.orderCount}</td>
                  <td className="p-4 whitespace-nowrap">{formatUZS(c.spent)}</td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      disabled={c.id === meId}
                      onClick={() => toggleRole(c)}
                      className={`rounded-full px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest transition disabled:cursor-not-allowed ${c.role === "admin" ? "bg-espresso text-gold-light" : "bg-sand text-mocha hover:bg-latte"}`}
                      title={c.id === meId ? "This is you" : "Toggle admin access"}
                    >
                      {c.role}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

type Message = { id: number; name: string; email: string; message: string; createdAt: string };

export function AdminMessages() {
  const { items, loading, error, reload } = useAdminList<Message>("messages");
  const [err, setErr] = useState("");

  async function remove(id: number) {
    try {
      await adminFetch("messages", { method: "DELETE", query: `?id=${id}` });
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <>
      <PageHeader title="Messages" sub="Enquiries from the contact form." />
      <ErrorNote message={error || err} />
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <p className={`${card} p-10 text-center text-mocha/60`}>No messages yet.</p>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {items.map((m) => (
            <li key={m.id} className={`${card} p-6`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl font-semibold">{m.name}</p>
                  <a href={`mailto:${m.email}`} className="text-sm text-caramel-dark hover:underline">{m.email}</a>
                </div>
                <button type="button" onClick={() => remove(m.id)} className="text-mocha/40 transition hover:text-red-700" aria-label="Delete message"><Trash2 size={16} /></button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-mocha/80">{m.message}</p>
              <p className="mt-3 text-xs text-mocha/50">{formatDateTime(m.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
