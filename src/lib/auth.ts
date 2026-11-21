import { cache } from "react";
import { cookies } from "next/headers";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { passwordResets, profiles, sessions, users } from "@/db/schema";
import type { SessionUser } from "@/lib/types";

export const SESSION_COOKIE = "aurum_session";
const SESSION_DAYS = 30;

function scrypt(password: string, salt: Buffer, len: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, salt, len, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  const key = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return key.length === expected.length && timingSafeEqual(key, expected);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await db.insert(sessions).values({ id: sha256(token), userId, expiresAt });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, sha256(token)));
  jar.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      fullName: profiles.fullName,
      phone: profiles.phone,
      address: profiles.address,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .leftJoin(profiles, eq(profiles.id, users.id))
    .where(and(eq(sessions.id, sha256(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    email: r.email,
    role: r.role,
    fullName: r.fullName ?? "",
    phone: r.phone ?? "",
    address: r.address ?? "",
  };
});

export async function createResetToken(userId: string) {
  const token = randomBytes(32).toString("hex");
  await db.insert(passwordResets).values({
    id: sha256(token),
    userId,
    expiresAt: new Date(Date.now() + 3600_000),
  });
  return token;
}

export async function consumeResetToken(token: string): Promise<string | null> {
  const id = sha256(token);
  const rows = await db
    .select()
    .from(passwordResets)
    .where(eq(passwordResets.id, id))
    .limit(1);
  const r = rows[0];
  if (!r || r.usedAt || r.expiresAt < new Date()) return null;
  await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, id));
  return r.userId;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
