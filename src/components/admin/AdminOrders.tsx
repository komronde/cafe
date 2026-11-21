"use client";

import { useMemo, useState } from "react";
import { Bike, Phone, Store, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { adminFetch, card, ErrorNote, PageHeader, Spinner, useAdminList } from "@/components/admin/shared";
import { formatDateTime, formatUZS } from "@/lib/format";

type Order = {
  id: number;
  customerName: string;
  phone: string;
  fulfillment: string;
  address: string;
  notes: string;
  status: string;
  totalUzs: number;
  createdAt: string;
  items: { id: number; name: string; quantity: number; unitPriceUzs: number }[];
};

const STATUSES = ["new", "preparing", "ready", "completed", "cancelled"];

export function AdminOrders() {
  const { items, loading, error, reload } = useAdminList<Order>("orders");
  const [filter, setFilter] = useState("all");
  const [err, setErr] = useState("");

  const shown = useMemo(() => (filter === "all" ? items : items.filter((o) => o.status === filter)), [items, filter]);

  async function setStatus(id: number, status: string) {
    setErr("");
    try {
      await adminFetch("orders", { method: "PUT", body: { id, status } });
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  async function remove(id: number) {
    if (!confirm(`Delete order #${id} permanently?`)) return;
    try {
      await adminFetch("orders", { method: "DELETE", query: `?id=${id}` });
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <>
      <PageHeader title="Orders" sub="Update status as orders move through the kitchen." />
      <ErrorNote message={error || err} />
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`flex-none rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${filter === s ? "bg-espresso text-cream" : "bg-white/70 text-mocha hover:bg-white"}`}
          >
            {s} {s === "all" ? items.length : items.filter((o) => o.status === s).length}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : shown.length === 0 ? (
        <p className={`${card} p-10 text-center text-mocha/60`}>No orders in this view.</p>
      ) : (
        <ul className="grid gap-5 xl:grid-cols-2">
          {shown.map((o) => (
            <li key={o.id} className={`${card} p-6`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-3xl font-semibold">#{o.id} · {o.customerName}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-mocha/70">
                    <a href={`tel:${o.phone}`} className="inline-flex items-center gap-1.5 hover:text-caramel"><Phone size={13} /> {o.phone}</a>
                    <span className="inline-flex items-center gap-1.5">
                      {o.fulfillment === "delivery" ? <Bike size={13} /> : <Store size={13} />}
                      {o.fulfillment === "delivery" ? "Delivery" : "Pickup"}
                    </span>
                    <span>{formatDateTime(o.createdAt)}</span>
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </div>
              {o.address && <p className="mt-3 rounded-xl bg-cream-dark px-3 py-2 text-sm">📍 {o.address}</p>}
              <ul className="mt-4 divide-y divide-sand text-sm">
                {o.items.map((i) => (
                  <li key={i.id} className="flex justify-between py-1.5">
                    <span>{i.quantity} × {i.name}</span>
                    <span className="text-mocha/70">{formatUZS(i.quantity * i.unitPriceUzs)}</span>
                  </li>
                ))}
              </ul>
              {o.notes && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">Note: {o.notes}</p>}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-sand pt-4">
                <p className="text-lg font-semibold text-caramel-dark">{formatUZS(o.totalUzs)}</p>
                <div className="flex items-center gap-2">
                  <select
                    aria-label={`Status for order ${o.id}`}
                    value={o.status}
                    onChange={(e) => setStatus(o.id, e.target.value)}
                    className="input !w-auto !rounded-full !py-2 text-sm capitalize"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => remove(o.id)} className="grid h-10 w-10 place-items-center rounded-full text-mocha/50 transition hover:bg-red-50 hover:text-red-700" aria-label={`Delete order ${o.id}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
