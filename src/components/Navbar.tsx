"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogOut, Menu as MenuIcon, ShoppingBag, User as UserIcon, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/reservations", label: "Reservations" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ cafeName }: { cafeName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { count, open, user } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobile(false);
    setMenu(false);
  }, [pathname]);

  const onDarkHero = pathname === "/" && !scrolled && !mobile;
  const textCls = onDarkHero ? "text-cream" : "text-espresso";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMenu(false);
    router.push("/");
    router.refresh();
  }

  const initials = (user?.fullName || user?.email || "?")
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6"
      >
        <nav
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-full px-5 py-3 transition-all duration-500 sm:px-7 ${textCls} ${
            scrolled || mobile || pathname.startsWith("/auth") ? "glass shadow-[0_10px_40px_-20px_rgba(30,20,14,0.4)]" : "border border-transparent"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${cafeName} home`}>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-gold-light via-gold to-caramel font-display text-xl font-bold text-espresso">
              A
            </span>
            <span className="font-display text-2xl font-semibold tracking-wide">{cafeName}</span>
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group relative text-[0.8rem] font-medium uppercase tracking-[0.16em]"
                  >
                    {l.label}
                    <span
                      className={`absolute -bottom-1.5 left-0 h-px bg-gold transition-all duration-300 ${
                        active ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={open}
              className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-black/5"
              aria-label={`Open cart, ${count} items`}
            >
              <ShoppingBag size={20} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[0.65rem] font-bold text-espresso"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {user ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setMenu((m) => !m)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-espresso text-xs font-bold text-cream ring-2 ring-gold/60 transition hover:scale-105"
                  aria-label="Account menu"
                >
                  {initials}
                </button>
                <AnimatePresence>
                  {menu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl bg-cream p-2 text-espresso shadow-2xl ring-1 ring-sand"
                    >
                      <p className="truncate px-3 py-2 text-xs text-mocha/60">{user.email}</p>
                      <Link href="/account" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-cream-dark">
                        <UserIcon size={16} /> My account
                      </Link>
                      {user.role === "admin" && (
                        <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-cream-dark">
                          <LayoutDashboard size={16} /> Admin dashboard
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-cream-dark"
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/auth/login" className="btn btn-sm btn-ghost hidden md:inline-flex">
                Sign in
              </Link>
            )}

            <Link href="/reservations" className="btn btn-sm btn-gold hidden lg:inline-flex">
              Book a table
            </Link>

            <button
              type="button"
              onClick={() => setMobile((m) => !m)}
              className="grid h-10 w-10 place-items-center rounded-full md:hidden"
              aria-label="Toggle menu"
            >
              {mobile ? <X size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-espresso/95 px-8 pt-28 md:hidden"
          >
            <ul className="space-y-1">
              {LINKS.map((l, i) => (
                <motion.li key={l.href} initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}>
                  <Link href={l.href} className="block border-b border-white/10 py-4 font-display text-4xl text-cream">
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3">
              {user ? (
                <>
                  <Link href="/account" className="btn btn-ghost text-cream">My account</Link>
                  {user.role === "admin" && <Link href="/admin" className="btn btn-ghost text-cream">Admin dashboard</Link>}
                  <button type="button" onClick={logout} className="btn btn-gold">Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="btn btn-ghost text-cream">Sign in</Link>
                  <Link href="/auth/register" className="btn btn-gold">Create account</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
