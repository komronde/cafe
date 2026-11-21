import type { Metadata } from "next";
import { MenuClient } from "@/components/MenuClient";
import { getCategories, getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Menu",
  description: "Explore our coffee, tea, desserts, cakes, breakfast, main dishes and snacks. Order online.",
};

export default async function MenuPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return <MenuClient categories={categories} products={products} />;
}
