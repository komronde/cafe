"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { IMG } from "@/lib/images";

type Mode = "login" | "register" | "forgot" | "reset";

const COPY: Record<Mode, { title: string; sub: string; cta: string }> = {
  login: { title: "Welcome back", sub: "Sign in to view your orders and speed through checkout.", cta: "Sign in" },
  register: { title: "Join Aurum", sub: "Create an account to track orders and save your details.", cta: "Create account" },
  forgot: { title: "Forgot password?", sub: "Enter your email and we'll send you a reset link.", cta: "Send reset link" },
  reset: { title: "Choose a new password", sub: "Pick something strong, at least 8 characters.", cta: "Update password" },
};

export function AuthForm({ mode, next = "/account", token = "" }: { mode: Mode; next?: string; token?: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState<{ message: string; resetPath?: string } | null>(null);
  const [resetDone, setResetDone] = useState(false);

  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  const c = COPY[mode];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const body =
        mode === "register"
          ? { email, password, fullName, phone }
          : mode === "forgot"
            ? { email }
            : mode === "reset"
              ? { token, password }
              : { email, password };
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      if (mode === "forgot") {
        setInfo({ message: data.message, resetPath: data.demo ? data.resetPath : undefined });
      } else if (mode === "reset") {
        setResetDone(true);
      } else {
        const dest = data.role === "admin" && safeNext === "/account" ? "/admin" : safeNext;
        router.push(dest);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-espresso lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.espresso} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/30 to-transparent" />
        <div className="absolute bottom-16 left-14 right-14 text-cream">
          <p className="eyebrow !text-gold-light">Aurum Café</p>
          <p className="mt-3 font-display text-6xl leading-[0.98]">
            Every cup, <em className="text-gold-light">remembered.</em>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 pb-16 pt-32">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-md">
          {resetDone ? (
            <div className="text-center">
              <CheckCircle2 size={64} strokeWidth={1.3} className="mx-auto text-emerald-700" />
              <h1 className="mt-5 text-5xl font-semibold">Password updated</h1>
              <p className="mt-3 text-mocha/70">You can now sign in with your new password.</p>
              <Link href="/auth/login" className="btn btn-primary mt-8">Go to sign in</Link>
            </div>
          ) : (
            <>
              <h1 className="text-5xl font-semibold md:text-6xl">{c.title}</h1>
              <p className="mt-3 text-mocha/70">{c.sub}</p>

              {info ? (
                <div className="mt-8 rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-900">
                  <p>{info.message}</p>
                  {info.resetPath && (
                    <div className="mt-4 rounded-xl bg-white p-4 text-mocha">
                      <p className="text-xs uppercase tracking-widest text-caramel">Email delivery is not configured</p>
                      <p className="mt-1">Use this one-time link to reset your password:</p>
                      <Link href={info.resetPath} className="btn btn-gold btn-sm mt-3">Reset my password</Link>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={submit} className="mt-8 space-y-5">
                  {mode === "register" && (
                    <>
                      <div>
                        <label className="label" htmlFor="a-name">Full name</label>
                        <input id="a-name" className="input" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
                      </div>
                      <div>
                        <label className="label" htmlFor="a-phone">Phone (optional)</label>
                        <input id="a-phone" className="input" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" />
                      </div>
                    </>
                  )}
                  {mode !== "reset" && (
                    <div>
                      <label className="label" htmlFor="a-email">Email</label>
                      <input id="a-email" className="input" required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                  )}
                  {mode !== "forgot" && (
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="label" htmlFor="a-pass">{mode === "reset" ? "New password" : "Password"}</label>
                        {mode === "login" && (
                          <Link href="/auth/forgot" className="mb-1.5 text-xs text-caramel-dark hover:underline">Forgot password?</Link>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          id="a-pass"
                          className="input !pr-12"
                          required
                          minLength={mode === "login" ? undefined : 8}
                          type={show ? "text" : "password"}
                          autoComplete={mode === "login" ? "current-password" : "new-password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={mode === "login" ? "Your password" : "At least 8 characters"}
                        />
                        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-mocha/50 hover:text-espresso" aria-label={show ? "Hide password" : "Show password"}>
                          {show ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === "reset" && !token && (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">This reset link is missing its token. Please request a new one.</p>
                  )}
                  {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

                  <button type="submit" disabled={busy || (mode === "reset" && !token)} className="btn btn-primary w-full">
                    {busy && <Loader2 size={16} className="animate-spin" />} {c.cta}
                  </button>
                </form>
              )}

              <p className="mt-8 text-center text-sm text-mocha/70">
                {mode === "login" && (
                  <>New here? <Link className="font-semibold text-caramel-dark hover:underline" href={`/auth/register${safeNext !== "/account" ? `?next=${encodeURIComponent(safeNext)}` : ""}`}>Create an account</Link></>
                )}
                {mode === "register" && (
                  <>Already a member? <Link className="font-semibold text-caramel-dark hover:underline" href={`/auth/login${safeNext !== "/account" ? `?next=${encodeURIComponent(safeNext)}` : ""}`}>Sign in</Link></>
                )}
                {(mode === "forgot" || mode === "reset") && (
                  <>Remembered it? <Link className="font-semibold text-caramel-dark hover:underline" href="/auth/login">Back to sign in</Link></>
                )}
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
