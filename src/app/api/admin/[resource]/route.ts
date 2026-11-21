import { NextResponse } from "next/server";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  cafeSettings,
  categories,
  contactMessages,
  orderItems,
  orders,
  products,
  profiles,
  reservations,
  users,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

type Ctx = { params: Promise<{ resource: string }> };
type Body = Record<string, unknown>;

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const bool = (v: unknown) => v === true || v === "true";

const ORDER_STATUSES = ["new", "preparing", "ready", "completed", "cancelled"];
const RESERVATION_STATUSES = ["pending", "confirmed", "cancelled"];

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "category"
  );
}

async function guard() {
  const u = await getCurrentUser();
  return u && u.role === "admin" ? u : null;
}

function parseProduct(b: Body) {
  const name = str(b.name, 120);
  const categoryId = Number(b.categoryId);
  const priceUzs = Math.round(Number(b.priceUzs));
  if (!name) return { error: "Product name is required." };
  if (!Number.isInteger(categoryId) || categoryId <= 0) return { error: "Please choose a category." };
  if (!Number.isFinite(priceUzs) || priceUzs < 0 || priceUzs > 100_000_000) return { error: "Enter a valid price in UZS." };
  return {
    value: {
      name,
      categoryId,
      priceUzs,
      description: str(b.description, 800),
      imageUrl: str(b.imageUrl, 600),
      available: bool(b.available),
      featured: bool(b.featured),
    },
  };
}

export async function GET(req: Request, { params }: Ctx) {
  if (!(await guard())) return fail("Forbidden", 403);
  const { resource } = await params;

  switch (resource) {
    case "stats": {
      const [t] = await db
        .select({
          totalOrders: sql<number>`count(*)::int`,
          revenue: sql<number>`coalesce(sum(case when ${orders.status} <> 'cancelled' then ${orders.totalUzs} else 0 end),0)::bigint`,
          newOrders: sql<number>`count(*) filter (where ${orders.status} = 'new')::int`,
        })
        .from(orders);
      const [r] = await db
        .select({ pending: sql<number>`count(*) filter (where ${reservations.status} = 'pending')::int`, total: sql<number>`count(*)::int` })
        .from(reservations);
      const [c] = await db
        .select({ n: sql<number>`count(*) filter (where ${users.role} = 'customer')::int` })
        .from(users);
      const [p] = await db.select({ n: sql<number>`count(*)::int` }).from(products);
      const daily = await db.execute(sql`
        select to_char(created_at at time zone 'Asia/Tashkent', 'YYYY-MM-DD') as day,
               coalesce(sum(total_uzs),0)::bigint as revenue,
               count(*)::int as orders
        from orders
        where status <> 'cancelled' and created_at > now() - interval '8 days'
        group by 1 order by 1`);
      const recent = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6);
      return NextResponse.json({
        totalOrders: t.totalOrders,
        revenue: Number(t.revenue),
        newOrders: t.newOrders,
        pendingReservations: r.pending,
        totalReservations: r.total,
        customers: c.n,
        products: p.n,
        daily: daily.rows.map((d) => ({ day: String(d.day), revenue: Number(d.revenue), orders: Number(d.orders) })),
        recent,
      });
    }

    case "products": {
      const rows = await db
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
        })
        .from(products)
        .innerJoin(categories, eq(categories.id, products.categoryId))
        .orderBy(desc(products.id));
      return NextResponse.json({ items: rows });
    }

    case "categories": {
      const rows = await db
        .select({
          id: categories.id,
          slug: categories.slug,
          name: categories.name,
          description: categories.description,
          sortOrder: categories.sortOrder,
          productCount: sql<number>`(select count(*)::int from products p where p.category_id = ${categories.id})`,
        })
        .from(categories)
        .orderBy(categories.sortOrder, categories.id);
      return NextResponse.json({ items: rows });
    }

    case "orders": {
      const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(300);
      const items = rows.length
        ? await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((o) => o.id)))
        : [];
      return NextResponse.json({
        items: rows.map((o) => ({ ...o, items: items.filter((i) => i.orderId === o.id) })),
      });
    }

    case "reservations": {
      const rows = await db.select().from(reservations).orderBy(desc(reservations.date), desc(reservations.time)).limit(300);
      return NextResponse.json({ items: rows });
    }

    case "customers": {
      const rows = await db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
          fullName: profiles.fullName,
          phone: profiles.phone,
          address: profiles.address,
          orderCount: sql<number>`(select count(*)::int from orders o where o.user_id = ${users.id})`,
          spent: sql<number>`(select coalesce(sum(o.total_uzs),0)::int from orders o where o.user_id = ${users.id} and o.status <> 'cancelled')`,
        })
        .from(users)
        .leftJoin(profiles, eq(profiles.id, users.id))
        .orderBy(desc(users.createdAt));
      return NextResponse.json({ items: rows });
    }

    case "messages": {
      const rows = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
      return NextResponse.json({ items: rows });
    }

    case "settings": {
      const [s] = await db.select().from(cafeSettings).where(eq(cafeSettings.id, 1)).limit(1);
      return NextResponse.json({ item: s });
    }

    default:
      return fail("Not found", 404);
  }
}

export async function POST(req: Request, { params }: Ctx) {
  if (!(await guard())) return fail("Forbidden", 403);
  const { resource } = await params;
  const b = (await req.json().catch(() => ({}))) as Body;

  if (resource === "products") {
    const p = parseProduct(b);
    if (!p.value) return fail(p.error!);
    const [row] = await db.insert(products).values(p.value).returning();
    return NextResponse.json({ item: row });
  }

  if (resource === "categories") {
    const name = str(b.name, 80);
    if (!name) return fail("Category name is required.");
    let slug = slugify(name);
    const existing = await db.select({ slug: categories.slug }).from(categories);
    const taken = new Set(existing.map((e) => e.slug));
    if (taken.has(slug)) {
      let n = 2;
      while (taken.has(`${slug}-${n}`)) n++;
      slug = `${slug}-${n}`;
    }
    const [mx] = await db.select({ m: sql<number>`coalesce(max(${categories.sortOrder}),0)::int` }).from(categories);
    const [row] = await db
      .insert(categories)
      .values({ name, slug, description: str(b.description, 200), sortOrder: mx.m + 1 })
      .returning();
    return NextResponse.json({ item: row });
  }

  return fail("Not found", 404);
}

export async function PUT(req: Request, { params }: Ctx) {
  if (!(await guard())) return fail("Forbidden", 403);
  const { resource } = await params;
  const b = (await req.json().catch(() => ({}))) as Body;
  const id = Number(b.id);

  switch (resource) {
    case "products": {
      const p = parseProduct(b);
      if (!p.value) return fail(p.error!);
      if (!Number.isInteger(id)) return fail("Missing product id.");
      const [row] = await db
        .update(products)
        .set({ ...p.value, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning();
      return row ? NextResponse.json({ item: row }) : fail("Product not found.", 404);
    }

    case "categories": {
      const name = str(b.name, 80);
      if (!name) return fail("Category name is required.");
      if (!Number.isInteger(id)) return fail("Missing category id.");
      const sortOrder = Number.isFinite(Number(b.sortOrder)) ? Math.round(Number(b.sortOrder)) : 0;
      const [row] = await db
        .update(categories)
        .set({ name, description: str(b.description, 200), sortOrder })
        .where(eq(categories.id, id))
        .returning();
      return row ? NextResponse.json({ item: row }) : fail("Category not found.", 404);
    }

    case "orders": {
      const status = str(b.status, 20);
      if (!ORDER_STATUSES.includes(status)) return fail("Invalid status.");
      await db.update(orders).set({ status }).where(eq(orders.id, id));
      return NextResponse.json({ ok: true });
    }

    case "reservations": {
      const status = str(b.status, 20);
      if (!RESERVATION_STATUSES.includes(status)) return fail("Invalid status.");
      await db.update(reservations).set({ status }).where(eq(reservations.id, id));
      return NextResponse.json({ ok: true });
    }

    case "customers": {
      const role = b.role === "admin" ? "admin" : "customer";
      const userId = str(b.id, 40);
      const me = await getCurrentUser();
      if (me?.id === userId) return fail("You cannot change your own role.");
      await db.update(users).set({ role }).where(eq(users.id, userId));
      return NextResponse.json({ ok: true });
    }

    case "settings": {
      const hoursIn = Array.isArray(b.hours) ? b.hours : [];
      const hours = hoursIn.slice(0, 7).map((h) => {
        const r = h as Record<string, unknown>;
        return {
          day: str(r.day, 20),
          open: /^\d{2}:\d{2}$/.test(str(r.open, 5)) ? str(r.open, 5) : "08:00",
          close: /^\d{2}:\d{2}$/.test(str(r.close, 5)) ? str(r.close, 5) : "22:00",
          closed: bool(r.closed),
        };
      });
      const name = str(b.name, 80);
      if (!name) return fail("Cafe name is required.");
      if (hours.length === 0) return fail("Opening hours are required.");
      await db
        .update(cafeSettings)
        .set({
          name,
          tagline: str(b.tagline, 200),
          phone: str(b.phone, 40),
          whatsapp: str(b.whatsapp, 40),
          telegram: str(b.telegram, 100),
          instagram: str(b.instagram, 100),
          email: str(b.email, 120),
          address: str(b.address, 300),
          mapQuery: str(b.mapQuery, 300),
          hours,
          updatedAt: new Date(),
        })
        .where(eq(cafeSettings.id, 1));
      return NextResponse.json({ ok: true });
    }

    default:
      return fail("Not found", 404);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!(await guard())) return fail("Forbidden", 403);
  const { resource } = await params;
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id)) return fail("Missing id.");

  switch (resource) {
    case "products":
      await db.delete(products).where(eq(products.id, id));
      return NextResponse.json({ ok: true });
    case "categories": {
      const [c] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(products)
        .where(eq(products.categoryId, id));
      if (c.n > 0) return fail("This category still contains products. Move or delete them first.", 409);
      await db.delete(categories).where(eq(categories.id, id));
      return NextResponse.json({ ok: true });
    }
    case "reservations":
      await db.delete(reservations).where(eq(reservations.id, id));
      return NextResponse.json({ ok: true });
    case "messages":
      await db.delete(contactMessages).where(eq(contactMessages.id, id));
      return NextResponse.json({ ok: true });
    case "orders":
      await db.delete(orders).where(eq(orders.id, id));
      return NextResponse.json({ ok: true });
    default:
      return fail("Not found", 404);
  }
}

