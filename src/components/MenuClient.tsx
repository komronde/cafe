"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ShoppingBag, SearchX, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { formatUZS } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

export function MenuClient({ categories, products }: { categories: Category[]; products: Product[] }) {
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const { count, total, open } = useCart();

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) m.set(p.categorySlug, (m.get(p.categorySlug) ?? 0) + 1);
    return m;
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (active === "all" || p.categorySlug === active) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)),
    );
  }, [products, active, query]);

  return (
    <>
      <section className="relative overflow-hidden bg-espresso pb-20 pt-40 text-cream">
        <div className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full bg-caramel/25 blur-[110px]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="eyebrow !text-gold-light">
            The menu
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="mt-3 text-6xl leading-[0.95] md:text-8xl"
          >
            Taste the <em className="text-gold-light">craft</em>
          </motion.h1>
          <p className="mt-6 max-w-xl text-lg text-cream/70">
            From a perfectly pulled espresso to a slow weekend brunch. Browse, add to your cart and order for pickup or
            delivery.
          </p>
        </div>
      </section>

      <div className="sticky top-[76px] z-30 px-3 pt-3 sm:px-6">
        <div className="glass mx-auto flex max-w-7xl flex-col gap-3 rounded-[1.75rem] p-3 shadow-lg md:flex-row md:items-center">
          <div className="relative md:w-72 md:flex-none">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mocha/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the menu…"
              aria-label="Search menu"
              className="input !rounded-full !py-2.5 !pl-10 !pr-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mocha/50 hover:text-espresso"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label="Menu categories">
            {[{ slug: "all", name: "All", n: products.length }, ...categories.map((c) => ({ slug: c.slug, name: c.name, n: counts.get(c.slug) ?? 0 }))].map(
              (c) => (
                <button
                  key={c.slug}
                  type="button"
                  role="tab"
                  aria-selected={active === c.slug}
                  onClick={() => setActive(c.slug)}
                  className={`relative flex-none whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                    active === c.slug ? "text-cream" : "text-mocha hover:bg-white/70"
                  }`}
                >
                  {active === c.slug && (
                    <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-espresso" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                  )}
                  <span className="relative">
                    {c.name} <span className="opacity-50">{c.n}</span>
                  </span>
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 pb-32 pt-12">
        <p className="mb-8 text-sm text-mocha/60" aria-live="polite">
          Showing {filtered.length} {filtered.length === 1 ? "item" : "items"}
          {query && <> for “{query}”</>}
        </p>
        <motion.div layout className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} onSelect={setSelected} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-24 text-center">
            <SearchX size={54} strokeWidth={1.2} className="text-latte" />
            <h3 className="mt-5 text-4xl font-semibold">Nothing found</h3>
            <p className="mt-2 text-mocha/70">Try another keyword or browse a different category.</p>
            <button
              type="button"
              className="btn btn-primary mt-7"
              onClick={() => {
                setQuery("");
                setActive("all");
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      <AnimatePresence>
        {count > 0 && (
          <motion.button
            type="button"
            onClick={open}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="btn btn-gold fixed bottom-5 left-1/2 z-40 -translate-x-1/2 !px-6 !py-4 shadow-2xl"
          >
            <ShoppingBag size={16} /> View cart · {count} · {formatUZS(total)}
          </motion.button>
        )}
      </AnimatePresence>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  );
}
