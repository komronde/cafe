import type { Metadata } from "next";
import { Clock, Heart, Users } from "lucide-react";
import { HoursList } from "@/components/HoursList";
import { ReservationForm } from "@/components/ReservationForm";
import { Reveal } from "@/components/Reveal";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { IMG } from "@/lib/images";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Book a Table",
  description: "Reserve your table at Aurum Café for brunch, coffee dates, celebrations and more.",
};

export default async function ReservationsPage() {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  return (
    <>
      <section className="relative flex min-h-[48vh] items-end overflow-hidden bg-espresso pb-16 pt-40 text-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.interior2} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/50 to-espresso/30" />
        <div className="relative mx-auto w-full max-w-7xl px-6">
          <p className="eyebrow !text-gold-light">Reservations</p>
          <h1 className="mt-3 text-6xl leading-[0.95] md:text-8xl">
            Save your <em className="text-gold-light">seat</em>
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <ReservationForm user={user} />
        </Reveal>
        <Reveal delay={0.1} className="space-y-6 lg:col-span-2">
          <div className="rounded-[2rem] bg-espresso p-8 text-cream">
            <p className="eyebrow !text-gold-light">Good to know</p>
            <ul className="mt-5 space-y-5 text-sm text-cream/80">
              <li className="flex gap-4"><Clock className="flex-none text-gold" size={20} /> Tables are held for 15 minutes after your reservation time.</li>
              <li className="flex gap-4"><Users className="flex-none text-gold" size={20} /> For groups of more than 20 guests, please call us directly at {settings.phone}.</li>
              <li className="flex gap-4"><Heart className="flex-none text-gold" size={20} /> Celebrating? Tell us in the message and we&apos;ll prepare a surprise.</li>
            </ul>
          </div>
          <div className="glass rounded-[2rem] p-8">
            <p className="eyebrow">Opening hours</p>
            <div className="mt-2"><HoursList hours={settings.hours} /></div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
