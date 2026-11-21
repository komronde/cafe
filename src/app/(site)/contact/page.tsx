import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Navigation, Phone, Send } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { HoursList } from "@/components/HoursList";
import { InstagramIcon } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { getSettings } from "@/lib/data";
import { digitsOnly, instagramHref, telegramHref } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Contact & Location",
  description: "Phone, WhatsApp, Telegram, Instagram, address, opening hours and map for Aurum Café.",
};

export default async function ContactPage() {
  const s = await getSettings();
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(s.mapQuery || s.address)}&output=embed`;
  const dir = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.mapQuery || s.address)}`;
  const cards = [
    { icon: Phone, label: "Call us", value: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
    { icon: MessageCircle, label: "WhatsApp", value: `+${digitsOnly(s.whatsapp)}`, href: `https://wa.me/${digitsOnly(s.whatsapp)}` },
    { icon: Send, label: "Telegram", value: `@${s.telegram.replace(/^@/, "")}`, href: telegramHref(s.telegram) },
    { icon: InstagramIcon, label: "Instagram", value: `@${s.instagram.replace(/^@/, "")}`, href: instagramHref(s.instagram) },
    { icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
  ];
  return (
    <>
      <section className="bg-espresso pb-20 pt-40 text-cream">
        <div className="mx-auto max-w-7xl px-6">
          <p className="eyebrow !text-gold-light">Contact</p>
          <h1 className="mt-3 text-6xl leading-[0.95] md:text-8xl">
            Let&apos;s <em className="text-gold-light">talk</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-cream/70">
            Questions, catering, private events or just a hello. We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map(({ icon: Icon, label, value, href }, i) => (
            <Reveal key={label} delay={i * 0.06}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="glass card-lift flex h-full flex-col rounded-3xl p-6"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-espresso text-gold-light">
                  <Icon size={20} />
                </span>
                <p className="eyebrow mt-5">{label}</p>
                <p className="mt-1 break-words font-medium">{value}</p>
              </a>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <h2 className="mb-6 text-4xl md:text-5xl">Send us a message</h2>
            <ContactForm />
          </Reveal>
          <Reveal delay={0.1} className="space-y-6">
            <div className="glass rounded-[2rem] p-8">
              <div className="flex gap-4">
                <MapPin className="mt-1 flex-none text-caramel" />
                <div>
                  <p className="eyebrow">Address</p>
                  <p className="mt-1 text-lg">{s.address}</p>
                  <a href={dir} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm mt-4">
                    <Navigation size={14} /> Get directions
                  </a>
                </div>
              </div>
              <div className="gold-line my-6" />
              <p className="eyebrow">Opening hours</p>
              <div className="mt-2"><HoursList hours={s.hours} /></div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-10 overflow-hidden rounded-[2rem] border border-white/70 shadow-xl">
          <iframe title="Map to our cafe" src={mapSrc} loading="lazy" className="h-[420px] w-full" referrerPolicy="no-referrer-when-downgrade" />
        </Reveal>
      </section>
    </>
  );
}
