import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { HoursList } from "@/components/HoursList";
import { digitsOnly, instagramHref, telegramHref } from "@/lib/format";
import type { Settings } from "@/lib/types";

export function Footer({ s }: { s: Settings }) {
  return (
    <footer className="relative overflow-hidden bg-espresso text-cream">
      <div className="gold-line" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gold-light via-gold to-caramel font-display text-2xl font-bold text-espresso">
              A
            </span>
            <span className="font-display text-3xl font-semibold">{s.name}</span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/65">{s.tagline}</p>
          <div className="mt-6 flex gap-3">
            <a href={instagramHref(s.instagram)} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 transition hover:border-gold hover:text-gold">
              <InstagramIcon size={17} />
            </a>
            <a href={telegramHref(s.telegram)} target="_blank" rel="noreferrer" aria-label="Telegram" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 transition hover:border-gold hover:text-gold">
              <Send size={17} />
            </a>
            <a href={`https://wa.me/${digitsOnly(s.whatsapp)}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 transition hover:border-gold hover:text-gold">
              <MessageCircle size={17} />
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="eyebrow !text-gold-light">Explore</h4>
          <ul className="mt-5 space-y-3 text-sm text-cream/75">
            {[
              ["/", "Home"],
              ["/menu", "Menu"],
              ["/reservations", "Book a table"],
              ["/contact", "Contact"],
              ["/account", "My account"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition hover:text-gold">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="eyebrow !text-gold-light">Visit us</h4>
          <ul className="mt-5 space-y-4 text-sm text-cream/75">
            <li className="flex gap-3"><MapPin size={16} className="mt-0.5 flex-none text-gold" /> {s.address}</li>
            <li className="flex gap-3"><Phone size={16} className="mt-0.5 flex-none text-gold" /> <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="hover:text-gold">{s.phone}</a></li>
            <li className="flex gap-3"><Mail size={16} className="mt-0.5 flex-none text-gold" /> <a href={`mailto:${s.email}`} className="hover:text-gold">{s.email}</a></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="eyebrow !text-gold-light">Opening hours</h4>
          <div className="mt-3 text-cream">
            <HoursList hours={s.hours} dark />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-6 text-center text-xs tracking-wider text-cream/45">
        © {new Date().getFullYear()} {s.name}. Crafted with care in Tashkent.
      </div>
    </footer>
  );
}
