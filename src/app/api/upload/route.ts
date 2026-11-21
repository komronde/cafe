import { NextResponse } from "next/server";
import { db } from "@/db";
import { images } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, WebP, AVIF or GIF images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be smaller than 5 MB." }, { status: 400 });
  const data = Buffer.from(await file.arrayBuffer());
  const [img] = await db.insert(images).values({ mime: file.type, data }).returning({ id: images.id });
  return NextResponse.json({ url: `/api/images/${img.id}` });
}
