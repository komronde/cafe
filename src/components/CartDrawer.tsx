"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bike, CheckCircle2, Loader2, Minus, Plus, ShoppingBag, Store, Trash2, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatUZS } from "@/lib/format";

type Done = { id: number; total: number } | null;

export function CartDrawer() {
  const { items, total, count, isOpen, close, setQty, remove, clear, user } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done>(null);

  useEffect(() => {
    if (user) {
      setName((n) => n || user.fullName);
      setPhone((p) => p || user.phone);
      setAddress((a) => a || user.address);
    }
  }, [user]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          fulfillment,
          address,
          notes,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not place your order.");
      setDone({ id: data.id, total: data.total });
      clear();
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function closeAll() {
    close();
    setTimeout(() => setDone(null), 400);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[90]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-espresso/60 backdrop-blur-sm" onClick={closeAll} />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl"
            role="dialog"
            aria-label="Shopping cart"
          >
            <header className="flex items-center justify-between border-b border-sand px-6 py-5">
              <div>
                <p className="eyebrow">Your order</p>
                <h2 className="text-3xl font-semibold">{done ? "Thank you" : `Cart (${count})`}</h2>
              </div>
              <button
                type="button"
                onClick={closeAll}
                className="grid h-10 w-10 place-items-center rounded-full bg-white transition hover:rotate-90"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </header>

            {done ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220 }}>
                  <CheckCircle2 size={72} className="text-emerald-700" strokeWidth={1.4} />
                </motion.div>
                <h3 className="mt-6 text-4xl font-semibold">Order #{done.id} received</h3>
                <p className="mt-3 text-mocha/75">
                  We&apos;ve started preparing your order. Total to pay: <b>{formatUZS(done.total)}</b>. We&apos;ll call
                  you if we need to confirm anything.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {user && (
                    <Link href="/account" onClick={closeAll} className="btn btn-primary">
                      My orders
                    </Link>
                  )}
                  <button type="button" onClick={closeAll} className="btn btn-ghost">
                    Continue browsing
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <ShoppingBag size={56} strokeWidth={1.2} className="text-latte" />
                <h3 className="mt-5 text-3xl font-semibold">Your cart is empty</h3>
                <p className="mt-2 text-mocha/70">Add something delicious from our menu.</p>
                <Link href="/menu" onClick={closeAll} className="btn btn-primary mt-7">
                  Explore menu
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <ul className="space-y-4">
                    {items.map((i) => (
                      <li key={i.productId} className="flex gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={i.image} alt={i.name} className="h-20 w-20 flex-none rounded-2xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-display text-xl font-semibold leading-tight">{i.name}</p>
                            <button
                              type="button"
                              onClick={() => remove(i.productId)}
                              className="text-mocha/50 transition hover:text-red-700"
                              aria-label={`Remove ${i.name}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-sm text-caramel-dark">{formatUZS(i.price)}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-1 rounded-full border border-sand bg-white p-0.5">
                              <button
                                type="button"
                                onClick={() => setQty(i.productId, i.quantity - 1)}
                                className="grid h-7 w-7 place-items-center rounded-full hover:bg-cream-dark"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold tabular-nums">{i.quantity}</span>
                              <button
                                type="button"
                                onClick={() => setQty(i.productId, i.quantity + 1)}
                                className="grid h-7 w-7 place-items-center rounded-full hover:bg-cream-dark"
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <p className="text-sm font-semibold">{formatUZS(i.price * i.quantity)}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="gold-line my-6" />

                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ["pickup", "Pickup", Store],
                        ["delivery", "Delivery", Bike],
                      ] as const
                    ).map(([v, label, Icon]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setFulfillment(v)}
                        className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                          fulfillment === v
                            ? "border-espresso bg-espresso text-cream"
                            : "border-sand bg-white text-mocha hover:border-caramel"
                        }`}
                      >
                        <Icon size={16} /> {label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="label" htmlFor="c-name">Your name</label>
                      <input id="c-name" className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                    </div>
                    <div>
                      <label className="label" htmlFor="c-phone">Phone number</label>
                      <input id="c-phone" className="input" required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" />
                    </div>
                    {fulfillment === "delivery" && (
                      <div>
                        <label className="label" htmlFor="c-addr">Delivery address</label>
                        <input id="c-addr" className="input" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, building, apartment" />
                      </div>
                    )}
                    <div>
                      <label className="label" htmlFor="c-notes">Special instructions</label>
                      <textarea id="c-notes" className="input min-h-20 resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergies, extra hot, no sugar…" />
                    </div>
                  </div>
                </div>

                <footer className="border-t border-sand bg-white/60 px-6 py-5">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-mocha/70">
                      <span>Subtotal ({count} items)</span>
                      <span>{formatUZS(total)}</span>
                    </div>
                    <div className="flex justify-between text-mocha/70">
                      <span>{fulfillment === "pickup" ? "Pickup" : "Delivery fee"}</span>
                      <span>{fulfillment === "pickup" ? "Free" : "Confirmed by phone"}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-caramel-dark">{formatUZS(total)}</span>
                    </div>
                  </div>
                  {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
                  <button type="submit" disabled={busy} className="btn btn-gold mt-4 w-full">
                    {busy ? <Loader2 size={16} className="animate-spin" /> : null}
                    {busy ? "Placing order…" : "Place order"}
                  </button>
                  <p className="mt-2 text-center text-xs text-mocha/60">Pay at the cafe or on delivery.</p>
                </footer>
              </form>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
