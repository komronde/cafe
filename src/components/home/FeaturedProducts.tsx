"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { Reveal, SectionHeading } from "@/components/Reveal";
import type { Product } from "@/lib/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Product | null>(null);
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <SectionHeading
        eyebrow="Signature favourites"
        title={
          <>
            Crafted to be <em className="text-caramel">savoured</em>
          </>
        }
        text="Our most-loved coffees, pastries and plates, prepared fresh and served with care."
      />
      <div className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} onSelect={setSelected} index={i} />
        ))}
      </div>
      <Reveal className="mt-14 text-center">
        <Link href="/menu" className="btn btn-primary">
          View full menu <ArrowRight size={16} />
        </Link>
      </Reveal>
      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
