import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Hero } from "@/components/home/Hero";
import { About, InstagramGallery, Location, Offers, Testimonials, WhyUs } from "@/components/home/HomeSections";
import { getProducts, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, products] = await Promise.all([getSettings(), getProducts()]);
  const featured = products.filter((p) => p.featured).slice(0, 8);
  return (
    <>
      <Hero tagline={settings.tagline} />
      <FeaturedProducts products={featured.length ? featured : products.slice(0, 4)} />
      <About name={settings.name} />
      <WhyUs />
      <Offers />
      <Testimonials />
      <InstagramGallery handle={settings.instagram} />
      <Location s={settings} />
    </>
  );
}
