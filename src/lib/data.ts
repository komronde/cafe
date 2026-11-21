import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cafeSettings, categories, products } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import type { Category, Product, Settings } from "@/lib/types";

export async function getSettings(): Promise<Settings> {
  await ensureSeeded();
  const [s] = await db.select().from(cafeSettings).where(eq(cafeSettings.id, 1)).limit(1);
  return {
    name: s.name,
    tagline: s.tagline,
    phone: s.phone,
    whatsapp: s.whatsapp,
    telegram: s.telegram,
    instagram: s.instagram,
    email: s.email,
    address: s.address,
    mapQuery: s.mapQuery,
    hours: s.hours,
  };
}

export async function getCategories(): Promise<Category[]> {
  await ensureSeeded();
  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
      sortOrder: categories.sortOrder,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.id));
}

export async function getProducts(): Promise<Product[]> {
  await ensureSeeded();
  return db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      priceUzs: products.priceUzs,
      imageUrl: products.imageUrl,
      available: products.available,
      featured: products.featured,
      categoryId: products.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .orderBy(asc(categories.sortOrder), asc(products.id));
}
