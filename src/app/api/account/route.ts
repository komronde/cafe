import { NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, profiles, reservations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const myOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt))
    .limit(100);
  const items = myOrders.length
    ? await db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, myOrders.map((o) => o.id)))
    : [];
  const myReservations = await db
    .select()
    .from(reservations)
    .where(eq(reservations.userId, user.id))
    .orderBy(desc(reservations.createdAt))
    .limit(50);
  return NextResponse.json({
    user,
    orders: myOrders.map((o) => ({ ...o, items: items.filter((i) => i.orderId === o.id) })),
    reservations: myReservations,
  });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const fullName = str(body.fullName, 100);
  if (!fullName) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  await db
    .update(profiles)
    .set({
      fullName,
      phone: str(body.phone, 30),
      address: str(body.address, 300),
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, user.id));
  return NextResponse.json({ ok: true });
}
