export type { HourRow } from "@/db/schema";

export type Product = {
  id: number;
  name: string;
  description: string;
  priceUzs: number;
  imageUrl: string;
  available: boolean;
  featured: boolean;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type SessionUser = {
  id: string;
  email: string;
  role: string;
  fullName: string;
  phone: string;
  address: string;
};

export type Settings = {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  telegram: string;
  instagram: string;
  email: string;
  address: string;
  mapQuery: string;
  hours: { day: string; open: string; close: string; closed: boolean }[];
};
