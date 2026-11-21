import { notFound, redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MODES = ["login", "register", "forgot", "reset"] as const;
type Mode = (typeof MODES)[number];

export default async function AuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ mode: string }>;
  searchParams: Promise<{ next?: string; token?: string }>;
}) {
  const { mode } = await params;
  const sp = await searchParams;
  if (!MODES.includes(mode as Mode)) notFound();
  if (mode === "login" || mode === "register") {
    const user = await getCurrentUser();
    if (user) redirect(sp.next && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/account");
  }
  return <AuthForm mode={mode as Mode} next={sp.next} token={sp.token} />;
}
