import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountClient } from "@/components/AccountClient";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/account");
  return <AccountClient initialUser={user} />;
}
