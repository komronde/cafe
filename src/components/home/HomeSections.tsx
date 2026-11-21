import Link from "next/link";
import { Armchair, ArrowRight, Award, Coffee, Croissant, MapPin, Navigation, Phone, Quote, Star } from "lucide-react";
import { HoursList } from "@/components/HoursList";
import { InstagramIcon } from "@/components/icons";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { ParallaxImage } from "@/components/home/ParallaxImage";
import { IMG, INSTAGRAM_IMAGES } from "@/lib/images";
import { instagramHref } from "@/lib/format";
import type { Settings } from "@/lib/types";

export function About({ name }: { name: string }) {
  return (
    <section className="relative overflow-hidden bg-cream-dark py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        <Reveal className="relative">
          <ParallaxImage src={IMG.interior1} alt="Warm cafe interior" className="aspect-[4/5] rounded-[2.5rem]" />
          <div className="absolute -bottom-10 -right-4 hidden w-48 rotate-3 overflow-hidden rounded-3xl border-4 border-cream-dark shadow-2xl sm:block md:-right-10 md:w-60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG.barista} alt="Barista serving a latte" loading="lazy" className="aspect-square w-full object-cover" />
          </div>
        </Reveal>
        <div>
          <Reveal>
            <p className="eyebrow">Our story</p>
            <h2 className="mt-3 text-5xl leading-[1.02] md:text-6xl">
              A quiet corner for <em className="text-caramel">slow mornings</em> and golden evenings.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-7 space-y-5 text-lg leading-relaxed text-mocha/80">
            <p>
              {name} was born from a simple belief: coffee deserves the same devotion as fine dining. We source
              single-origin beans from farms we know by name, roast in small batches, and pull every shot to order.
            </p>
            <p>
              Our pastry kitchen starts at 4 a.m. Croissants are laminated by hand, cakes are baked in-house, and every
              plate leaves the kitchen looking as good as it tastes.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="mt-10 grid grid-cols-3 gap-6 border-t border-sand pt-8">
            {[
              ["12+", "Single origins"],
              ["40+", "Daily bakes"],
              ["4.9", "Guest rating"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-5xl font-semibold text-caramel">{n}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-mocha/60">{l}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function WhyUs() {
  const items = [
    { icon: Coffee, title: "Single-origin craft", text: "Ethically sourced beans, roasted in small batches and dialled in every morning by our baristas." },
    { icon: Croissant, title: "Baked at dawn", text: "Croissants, cakes and desserts made from scratch daily, with real butter and no shortcuts." },
    { icon: Award, title: "Award-level service", text: "Trained, attentive hosts who remember your order and make every visit feel personal." },
    { icon: Armchair, title: "Designed to linger", text: "Warm light, soft textures and quiet corners: perfect for work, dates or catching up." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <SectionHeading eyebrow="Why choose us" title={<>The little details <em className="text-caramel">make it</em></>} />
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 0.08}>
            <div className="card-lift h-full rounded-[2rem] border border-white/70 bg-white/60 p-8 backdrop-blur">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-espresso text-gold-light">
                <Icon size={24} strokeWidth={1.5} />
              </span>
              <h3 className="mt-6 text-3xl font-semibold leading-tight">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mocha/70">{text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Offers() {
  const offers = [
    { tag: "08:00 – 11:00", title: "Morning Ritual", text: "Any hot coffee with a butter croissant for just 45 000 UZS.", cta: "Order breakfast" },
    { tag: "All day", title: "Sweet Pair", text: "Choose any cake and any latte together and save 15% on your order.", cta: "Build your pair" },
    { tag: "Sat & Sun", title: "Weekend Brunch", text: "Enjoy a complimentary pot of tea with every breakfast plate.", cta: "See brunch menu" },
  ];
  return (
    <section className="relative overflow-hidden bg-espresso py-28 text-cream">
      <div className="pointer-events-none absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full bg-caramel/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-gold/15 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeading light eyebrow="Special offers" title={<>Treats worth <em className="text-gold-light">coming back for</em></>} />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {offers.map((o, i) => (
            <Reveal key={o.title} delay={i * 0.1}>
              <div className="card-lift group flex h-full flex-col rounded-[2rem] glass-dark p-8">
                <span className="w-fit rounded-full bg-gold/15 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-light">
                  {o.tag}
                </span>
                <h3 className="mt-6 text-4xl font-semibold">{o.title}</h3>
                <p className="mt-3 flex-1 text-cream/70">{o.text}</p>
                <Link href="/menu" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-gold-light">
                  {o.cta} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const t = [
    { name: "Dilnoza K.", role: "Regular guest", text: "The best flat white in Tashkent, and the cheesecake is unreal. The atmosphere makes it my favourite place to work from." },
    { name: "Jasur M.", role: "Food blogger", text: "Everything is plated beautifully and tastes even better. Breakfast here is a proper ritual: the avocado toast is perfection." },
    { name: "Madina A.", role: "Birthday host", text: "We booked a table for a family celebration. The team was warm, attentive and the dessert board was a showstopper." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <SectionHeading eyebrow="Kind words" title={<>Loved by our <em className="text-caramel">community</em></>} />
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {t.map((x, i) => (
          <Reveal key={x.name} delay={i * 0.1}>
            <figure className="glass card-lift relative h-full rounded-[2rem] p-8">
              <Quote className="absolute right-7 top-7 text-gold/50" size={36} />
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} size={16} fill="currentColor" />
                ))}
              </div>
              <blockquote className="mt-5 font-display text-2xl leading-snug">“{x.text}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-espresso font-display text-lg text-gold-light">
                  {x.name[0]}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{x.name}</span>
                  <span className="block text-xs text-mocha/60">{x.role}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function InstagramGallery({ handle }: { handle: string }) {
  return (
    <section className="bg-cream-dark py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Follow along"
          title={<>@{handle.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "")}</>}
          text="Moments from our counter, kitchen and tables."
        />
        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-6">
          {INSTAGRAM_IMAGES.map((src, i) => (
            <Reveal key={src} delay={i * 0.06}>
              <a
                href={instagramHref(handle)}
                target="_blank"
                rel="noreferrer"
                aria-label="Open our Instagram"
                className="group relative block aspect-square overflow-hidden rounded-3xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Instagram photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute inset-0 grid place-items-center bg-espresso/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <InstagramIcon size={28} className="text-cream" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Location({ s }: { s: Settings }) {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(s.mapQuery || s.address)}&output=embed`;
  const dir = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.mapQuery || s.address)}`;
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <SectionHeading eyebrow="Visit us" title={<>Find your <em className="text-caramel">table</em></>} />
      <div className="mt-16 grid gap-8 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <div className="glass h-full rounded-[2rem] p-8">
            <div className="flex gap-4">
              <MapPin className="mt-1 flex-none text-caramel" />
              <div>
                <p className="eyebrow">Address</p>
                <p className="mt-1 text-lg">{s.address}</p>
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <Phone className="mt-1 flex-none text-caramel" />
              <div>
                <p className="eyebrow">Call</p>
                <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="mt-1 block text-lg hover:text-caramel">{s.phone}</a>
              </div>
            </div>
            <div className="gold-line my-7" />
            <p className="eyebrow">Opening hours</p>
            <div className="mt-2"><HoursList hours={s.hours} /></div>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={dir} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm"><Navigation size={14} /> Get directions</a>
              <Link href="/contact" className="btn btn-ghost btn-sm">Contact us</Link>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-3">
          <div className="h-full min-h-[380px] overflow-hidden rounded-[2rem] border border-white/70 shadow-xl">
            <iframe title="Map" src={mapSrc} loading="lazy" className="h-full min-h-[380px] w-full grayscale-[0.3] sepia-[0.15]" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
