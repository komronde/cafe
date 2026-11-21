import { NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { isValidEmail } from "@/lib/auth";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail("Invalid request.");
  const name = str(body.name, 100);
  const email = str(body.email, 200).toLowerCase();
  const message = str(body.message);
  if (!name) return fail("Please enter your name.");
  if (!isValidEmail(email)) return fail("Please enter a valid email address.");
  if (message.length < 5) return fail("Please write a short message.");
  await db.insert(contactMessages).values({ name, email, message });
  return NextResponse.json({ ok: true });
}
