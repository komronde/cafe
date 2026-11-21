"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings as SettingsIcon,
  Tags,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { AdminCategories, AdminProducts } from "@/components/admin/AdminCatalog";
import { AdminCustomers, AdminMessages, AdminReservations } from "@/components/admin/AdminMisc";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminSettings } from "@/components/admin/AdminSettings";
import type { SessionUser } from "@/lib/types";

const TABS = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "reservations", label: "Reservations", icon: CalendarClock },
  { id: "products", label: "Products", icon: UtensilsCrossed },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "customers", label: "Customers", icon: Users },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AdminApp({ user, cafeName }: { user: SessionUser; cafeName: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<string>("overview");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside className="flex flex-col bg-espresso text-cream lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:flex-none">
        <div className="flex items-center justify-between gap-3 px-6 py-5 lg:block lg:py-8">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gold-light via-gold to-caramel font-display text-2xl font-bold text-espresso">A</span>
            <div>
              <p className="font-display text-2xl font-semibold leading-none">{cafeName}</p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.25em] text-gold-light">Admin</p>
            </div>
          </div>
          <Link href="/" className="text-cream/60 hover:text-gold lg:hidden" aria-label="View website"><ExternalLink size={18} /></Link>
        </div>

        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Admin sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative flex flex-none items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${tab === t.id ? "text-espresso" : "text-cream/75 hover:bg-white/10"}`}
            >
              {tab === t.id && <motion.span layoutId="admin-tab" className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-light to-gold" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <t.icon size={18} className="relative" />
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="hidden border-t border-white/10 p-4 lg:block">
          <p className="truncate px-2 text-xs text-cream/50">{user.email}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/" className="btn btn-ghost btn-sm flex-1 text-cream"><ExternalLink size={13} /> Website</Link>
            <button type="button" onClick={logout} className="btn btn-ghost btn-sm text-cream" aria-label="Sign out"><LogOut size={13} /></button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {tab === "overview" && <AdminOverview go={setTab} />}
            {tab === "orders" && <AdminOrders />}
            {tab === "reservations" && <AdminReservations />}
            {tab === "products" && <AdminProducts />}
            {tab === "categories" && <AdminCategories />}
            {tab === "customers" && <AdminCustomers meId={user.id} />}
            {tab === "messages" && <AdminMessages />}
            {tab === "settings" && <AdminSettings />}
          </motion.div>
        </AnimatePresence>
        <div className="mt-12 lg:hidden">
          <button type="button" onClick={logout} className="btn btn-ghost btn-sm"><LogOut size={13} /> Sign out</button>
        </div>
      </main>
    </div>
  );
}
