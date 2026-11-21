import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail("Invalid request.");

  const customerName = str(body.name, 100);
  const phone = str(body.phone, 30);
  const fulfillment = body.fulfillment === "delivery" ? "delivery" : "pickup";
  const address = str(body.address, 300);
  const notes = str(body.notes, 500);

  if (!customerName) return fail("Please enter your name.");
  if (phone.replace(/\D/g, "").length < 7) return fail("Please enter a valid phone number.");
  if (fulfillment === "delivery" && address.length < 5) return fail("Please enter a delivery address.");

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const wanted = new Map<number, number>();
  for (const it of rawItems) {
    const r = it as { productId?: unknown; quantity?: unknown };
    const id = Number(r.productId);
    const qty = Math.floor(Number(r.quantity));
    if (!Number.isInteger(id) || !(qty >= 1)) continue;
    wanted.set(id, Math.min(50, (wanted.get(id) ?? 0) + qty));
  }
  if (wanted.size === 0) return fail("Your cart is empty.");

  const rows = await db
    .select()
    .from(products)
    .where(inArray(products.id, [...wanted.keys()]));
  if (rows.length !== wanted.size) return fail("Some items are no longer on the menu. Please review your cart.");
  const unavailable = rows.find((p) => !p.available);
  if (unavailable) return fail(`“${unavailable.name}” is currently unavailable. Please remove it and try again.`);

  const user = await getCurrentUser();
  const total = rows.reduce((sum, p) => sum + p.priceUzs * wanted.get(p.id)!, 0);

  const orderId = await db.transaction(async (tx) => {
    const [o] = await tx
      .insert(orders)
      .values({
        userId: user?.id ?? null,
        customerName,
        phone,
        fulfillment,
        address: fulfillment === "delivery" ? address : "",
        notes,
        totalUzs: total,
      })
      .returning({ id: orders.id });
    await tx.insert(orderItems).values(
      rows.map((p) => ({
        orderId: o.id,
        productId: p.id,
        name: p.name,
        unitPriceUzs: p.priceUzs,
        quantity: wanted.get(p.id)!,
      })),
    );
    return o.id;
  });

  return NextResponse.json({ ok: true, id: orderId, total });
}
