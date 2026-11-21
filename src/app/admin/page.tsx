import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { AdminApp } from "@/components/admin/AdminApp";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/admin");

  if (user.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div className="max-w-md">
          <ShieldAlert size={60} strokeWidth={1.3} className="mx-auto text-caramel" />
          <h1 className="mt-5 text-5xl font-semibold">Restricted area</h1>
          <p className="mt-3 text-mocha/70">
            Your account ({user.email}) does not have administrator access. Please sign in with an authorised account.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/" className="btn btn-primary">Back to website</Link>
            <Link href="/account" className="btn btn-ghost">My account</Link>
          </div>
        </div>
      </div>
    );
  }

  const settings = await getSettings();
  return <AdminApp user={user} cafeName={settings.name} />;
}
