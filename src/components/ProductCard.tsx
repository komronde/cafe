"use client";

import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatUZS } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  onSelect,
  index = 0,
}: {
  product: Product;
  onSelect: (p: Product) => void;
  index?: number;
}) {
  const { add, setQty, qtyOf } = useCart();
  const qty = qtyOf(product.id);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: Math.min(index, 6) * 0.05, ease: [0.2, 0.7, 0.2, 1] }}
      className="card-lift group flex flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/70 shadow-[0_10px_40px_-24px_rgba(30,20,14,0.35)] backdrop-blur"
    >
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="relative block aspect-[4/3] w-full overflow-hidden text-left"
        aria-label={`View details for ${product.name}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110 ${
            product.available ? "" : "grayscale-[0.7]"
          }`}
        />
        <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-mocha backdrop-blur">
          {product.categoryName}
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
            product.available ? "bg-emerald-700/90 text-white" : "bg-espresso/85 text-cream"
          }`}
        >
          {product.available ? "Available" : "Sold out"}
        </span>
      </button>

      <div className="flex flex-1 flex-col p-5">
        <button type="button" onClick={() => onSelect(product)} className="text-left">
          <h3 className="text-[1.65rem] font-semibold leading-tight text-espresso">{product.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mocha/70">{product.description}</p>
        </button>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="text-[0.95rem] font-semibold tracking-wide text-caramel-dark">{formatUZS(product.priceUzs)}</p>

          {!product.available ? (
            <span className="text-xs font-medium uppercase tracking-widest text-mocha/50">Unavailable</span>
          ) : qty === 0 ? (
            <button
              type="button"
              onClick={() => add(product)}
              className="btn btn-primary btn-sm"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag size={14} /> Add
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-full bg-espresso p-1 text-cream">
              <button
                type="button"
                onClick={() => setQty(product.id, qty - 1)}
                className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-white/15"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(product.id, qty + 1)}
                className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-white/15"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
