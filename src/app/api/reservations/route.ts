import { NextResponse } from "next/server";
import { db } from "@/db";
import { reservations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail("Invalid request.");

  const customerName = str(body.name, 100);
  const phone = str(body.phone, 30);
  const date = str(body.date, 10);
  const time = str(body.time, 5);
  const guests = Math.floor(Number(body.guests));
  const message = str(body.message, 600);

  if (!customerName) return fail("Please enter your name.");
  if (phone.replace(/\D/g, "").length < 7) return fail("Please enter a valid phone number.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return fail("Please choose a valid date.");
  const todayTashkent = new Date(Date.now() + 5 * 3600_000).toISOString().slice(0, 10);
  if (date < todayTashkent) return fail("The date cannot be in the past.");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return fail("Please choose a valid time.");
  if (!(guests >= 1 && guests <= 20)) return fail("We can seat between 1 and 20 guests online. Please call us for larger groups.");

  const user = await getCurrentUser();
  const [r] = await db
    .insert(reservations)
    .values({ userId: user?.id ?? null, customerName, phone, date, time, guests, message })
    .returning({ id: reservations.id });

  return NextResponse.json({ ok: true, id: r.id });
}
