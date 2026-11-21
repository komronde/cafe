"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, ClipboardList, Coins, Sparkles, Users, UtensilsCrossed } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { adminFetch, card, ErrorNote, PageHeader, Spinner } from "@/components/admin/shared";
import { formatDateTime, formatUZS } from "@/lib/format";

type Stats = {
  totalOrders: number;
  revenue: number;
  newOrders: number;
  pendingReservations: number;
  totalReservations: number;
  customers: number;
  products: number;
  daily: { day: string; revenue: number; orders: number }[];
  recent: { id: number; customerName: string; status: string; totalUzs: number; createdAt: string }[];
};

export function AdminOverview({ go }: { go: (tab: string) => void }) {
  const [s, setS] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<Stats>("stats").then(setS).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorNote message={error} />;
  if (!s) return <Spinner />;

  const tiles = [
    { label: "Total orders", value: s.totalOrders, icon: ClipboardList, tab: "orders" },
    { label: "Total revenue", value: formatUZS(s.revenue), icon: Coins, tab: "orders" },
    { label: "New orders", value: s.newOrders, icon: Sparkles, tab: "orders", highlight: s.newOrders > 0 },
    { label: "Pending reservations", value: s.pendingReservations, icon: CalendarClock, tab: "reservations", highlight: s.pendingReservations > 0 },
    { label: "Customers", value: s.customers, icon: Users, tab: "customers" },
    { label: "Menu products", value: s.products, icon: UtensilsCrossed, tab: "products" },
  ];

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() + 5 * 3600_000 - (6 - i) * 86400_000).toISOString().slice(0, 10);
    const f = s.daily.find((x) => x.day === d);
    return { day: d, revenue: f?.revenue ?? 0, orders: f?.orders ?? 0 };
  });
  const max = Math.max(1, ...days.map((d) => d.revenue));

  return (
    <>
      <PageHeader title="Dashboard" sub="A live overview of your cafe." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t, i) => (
          <motion.button
            key={t.label}
            type="button"
            onClick={() => go(t.tab)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${card} card-lift flex items-center gap-5 p-6 text-left ${t.highlight ? "ring-2 ring-gold/70" : ""}`}
          >
            <span className="grid h-14 w-14 flex-none place-items-center rounded-2xl bg-espresso text-gold-light">
              <t.icon size={22} />
            </span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-mocha/60">{t.label}</span>
              <span className="mt-1 block font-display text-4xl font-semibold leading-none">{t.value}</span>
            </span>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-5">
        <div className={`${card} p-6 xl:col-span-3`}>
          <h2 className="text-3xl font-semibold">Revenue · last 7 days</h2>
          <div className="mt-6 flex h-56 items-end gap-3">
            {days.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2" title={`${formatUZS(d.revenue)} · ${d.orders} orders`}>
                <div className="flex h-44 w-full items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.revenue / max) * 100}%` }}
                    transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
                    className="min-h-1 w-full rounded-t-xl bg-gradient-to-t from-caramel to-gold-light"
                  />
                </div>
                <span className="text-[0.65rem] uppercase tracking-wider text-mocha/60">{d.day.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} p-6 xl:col-span-2`}>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold">Recent orders</h2>
            <button type="button" onClick={() => go("orders")} className="text-xs font-semibold uppercase tracking-widest text-caramel-dark hover:underline">View all</button>
          </div>
          {s.recent.length === 0 ? (
            <p className="mt-6 text-sm text-mocha/60">No orders yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-sand">
              {s.recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">#{o.id} · {o.customerName}</p>
                    <p className="text-xs text-mocha/60">{formatDateTime(o.createdAt)} · {formatUZS(o.totalUzs)}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
