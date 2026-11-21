"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatUZS } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {product && <ModalBody key={product.id} product={product} onClose={onClose} />}
    </AnimatePresence>
  );
}

function ModalBody({ product, onClose }: { product: Product; onClose: () => void }) {
  const { add, open } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-espresso/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
        className="relative grid max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-t-[2rem] bg-cream shadow-2xl sm:rounded-[2rem] md:grid-cols-2"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-cream/90 text-espresso shadow transition hover:rotate-90"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="relative h-56 md:h-full md:min-h-[480px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.imageUrl} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent md:hidden" />
        </div>

        <div className="flex flex-col overflow-y-auto p-7 sm:p-9">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">{product.categoryName}</span>
            <span
              className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
                product.available ? "bg-emerald-700/10 text-emerald-800" : "bg-espresso/10 text-espresso"
              }`}
            >
              {product.available ? "Available today" : "Sold out"}
            </span>
          </div>
          <h3 className="mt-3 text-4xl font-semibold leading-tight">{product.name}</h3>
          <p className="mt-4 leading-relaxed text-mocha/75">{product.description}</p>
          <div className="gold-line my-6" />
          <p className="text-2xl font-semibold text-caramel-dark">{formatUZS(product.priceUzs)}</p>

          <div className="mt-auto pt-8">
            {product.available ? (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1 rounded-full border border-sand bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-cream-dark"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-semibold tabular-nums">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(50, q + 1))}
                    className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-cream-dark"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn-primary flex-1"
                  onClick={() => {
                    add(product, qty);
                    setAdded(true);
                    setTimeout(() => {
                      onClose();
                      open();
                    }, 550);
                  }}
                >
                  {added ? <Check size={16} /> : <ShoppingBag size={16} />}
                  {added ? "Added" : `Add · ${formatUZS(product.priceUzs * qty)}`}
                </button>
              </div>
            ) : (
              <p className="rounded-2xl bg-espresso/5 p-4 text-sm text-mocha">
                This item is sold out right now. Please check back later or explore other items in{" "}
                {product.categoryName}.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
