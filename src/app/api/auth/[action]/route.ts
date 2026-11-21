import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, sessions, users } from "@/db/schema";
import {
  consumeResetToken,
  createResetToken,
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  isValidEmail,
  verifyPassword,
} from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

type Ctx = { params: Promise<{ action: string }> };

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

async function sendResetEmail(to: string, link: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Aurum Café <onboarding@resend.dev>",
        to,
        subject: "Reset your Aurum Café password",
        html: `<p>Click the link below to choose a new password. It is valid for one hour.</p><p><a href="${link}">${link}</a></p>`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request, { params }: Ctx) {
  const { action } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  await ensureSeeded();

  switch (action) {
    case "register": {
      const email = str(body.email).toLowerCase();
      const password = typeof body.password === "string" ? body.password : "";
      const fullName = str(body.fullName, 100);
      const phone = str(body.phone, 30);
      if (!fullName) return fail("Please enter your full name.");
      if (!isValidEmail(email)) return fail("Please enter a valid email address.");
      if (password.length < 8) return fail("Password must be at least 8 characters.");
      const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (existing.length) return fail("An account with this email already exists.", 409);
      const passwordHash = await hashPassword(password);
      const [u] = await db.insert(users).values({ email, passwordHash }).returning({ id: users.id });
      await db.insert(profiles).values({ id: u.id, fullName, phone });
      await createSession(u.id);
      return NextResponse.json({ ok: true, role: "customer" });
    }

    case "login": {
      const email = str(body.email).toLowerCase();
      const password = typeof body.password === "string" ? body.password : "";
      if (!email || !password) return fail("Enter your email and password.");
      const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!u || !(await verifyPassword(password, u.passwordHash))) {
        return fail("Incorrect email or password.", 401);
      }
      await createSession(u.id);
      return NextResponse.json({ ok: true, role: u.role });
    }

    case "logout": {
      await destroySession();
      return NextResponse.json({ ok: true });
    }

    case "forgot": {
      const email = str(body.email).toLowerCase();
      if (!isValidEmail(email)) return fail("Please enter a valid email address.");
      const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      const generic = {
        ok: true,
        message: "If an account exists for this email, a reset link has been sent.",
      };
      if (!u) return NextResponse.json(generic);
      const token = await createResetToken(u.id);
      const path = `/auth/reset?token=${token}`;
      const proto = req.headers.get("x-forwarded-proto") || "http";
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
      const sent = await sendResetEmail(email, `${proto}://${host}${path}`);
      if (sent) return NextResponse.json(generic);
      // No email provider configured: expose the link so the flow can be completed (demo mode).
      return NextResponse.json({ ...generic, demo: true, resetPath: path });
    }

    case "reset": {
      const token = str(body.token, 200);
      const password = typeof body.password === "string" ? body.password : "";
      if (password.length < 8) return fail("Password must be at least 8 characters.");
      const userId = token ? await consumeResetToken(token) : null;
      if (!userId) return fail("This reset link is invalid or has expired.", 400);
      await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, userId));
      await db.delete(sessions).where(eq(sessions.userId, userId));
      return NextResponse.json({ ok: true });
    }

    case "password": {
      const me = await getCurrentUser();
      if (!me) return fail("Please sign in.", 401);
      const current = typeof body.current === "string" ? body.current : "";
      const next = typeof body.next === "string" ? body.next : "";
      if (next.length < 8) return fail("New password must be at least 8 characters.");
      const [u] = await db.select().from(users).where(eq(users.id, me.id)).limit(1);
      if (!u || !(await verifyPassword(current, u.passwordHash))) {
        return fail("Your current password is incorrect.", 403);
      }
      await db.update(users).set({ passwordHash: await hashPassword(next) }).where(eq(users.id, me.id));
      return NextResponse.json({ ok: true });
    }

    default:
      return fail("Unknown action.", 404);
  }
}
