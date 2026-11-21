import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cafeSettings, categories, products, profiles, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { px } from "@/lib/images";

const CATEGORIES = [
  { slug: "hot-coffee", name: "Hot Coffee", description: "Single-origin espresso, silky milk." },
  { slug: "cold-coffee", name: "Cold Coffee", description: "Chilled, bright and refreshing." },
  { slug: "tea", name: "Tea", description: "Loose-leaf teas, brewed to order." },
  { slug: "desserts", name: "Desserts", description: "Plated sweets from our pastry kitchen." },
  { slug: "cakes", name: "Cakes", description: "Baked fresh every morning." },
  { slug: "breakfast", name: "Breakfast", description: "Served until 12:00, croissants all day." },
  { slug: "main-dishes", name: "Main Dishes", description: "Comforting plates for lunch & dinner." },
  { slug: "snacks", name: "Snacks", description: "Little bites to share." },
];

type Seed = [string, string, string, number, number, boolean?, boolean?]; // cat, name, desc, price, imgId, featured, soldOut

const PRODUCTS: Seed[] = [
  ["hot-coffee", "Signature Aurum Latte", "Double ristretto, steamed milk and a whisper of caramelised honey, finished with hand-poured latte art.", 32000, 4913342, true],
  ["hot-coffee", "Classic Cappuccino", "Equal parts espresso, velvety milk and airy foam. Rich, balanced, timeless.", 28000, 6747870, true],
  ["hot-coffee", "Double Espresso", "A concentrated double shot of our house blend with notes of cocoa and toasted hazelnut.", 18000, 18604200],
  ["hot-coffee", "Flat White", "Micro-foam poured over a double ristretto for a smooth, intense cup.", 30000, 11385490, true],
  ["hot-coffee", "Cardamom Rose Latte", "Espresso with warm cardamom syrup, steamed milk and a dusting of dried rose.", 34000, 31139336],
  ["cold-coffee", "Iced Caramel Latte", "Chilled espresso, cold milk and house salted caramel over crystal-clear ice.", 34000, 38426418, true],
  ["cold-coffee", "Cold Brew Tonic", "18-hour cold brew over sparkling tonic and a twist of orange peel.", 32000, 17497892],
  ["cold-coffee", "Iced Americano", "Two shots of espresso over ice and cold filtered water. Clean and crisp.", 24000, 4869290],
  ["cold-coffee", "Vanilla Cream Frappé", "Blended espresso, Madagascar vanilla and cream, topped with a cloud of foam.", 36000, 9838373],
  ["tea", "Earl Grey Royale", "Bergamot-scented black tea served in a porcelain pot with a slice of lemon.", 22000, 10258207],
  ["tea", "Jasmine Pearl Tea", "Hand-rolled green tea pearls that unfurl into a delicate floral cup.", 24000, 9136977],
  ["tea", "Lemon Ginger Pot", "Fresh ginger, lemon and wild honey steeped in a vintage teapot for two.", 26000, 29912657],
  ["tea", "Moroccan Mint Tea", "Gunpowder green tea with fresh spearmint, sweetened the traditional way.", 25000, 2612342],
  ["desserts", "Berry Cheesecake", "Silky baked cheesecake, buttery biscuit base, fresh berries and fig compote.", 42000, 29653160, true],
  ["desserts", "Cherry Cheesecake", "Classic vanilla cheesecake crowned with glossy cherries and fresh mint.", 40000, 38495630],
  ["desserts", "Dessert Trio Plate", "Chocolate mousse, mini cheesecake and strawberry compote, plated to share.", 58000, 16544183],
  ["desserts", "Chocolate Berry Tart", "Dark chocolate tart with a bright raspberry coulis and crisp pastry shell.", 44000, 970104],
  ["cakes", "Belgian Chocolate Cake", "Layers of moist cocoa sponge and glossy Belgian ganache.", 40000, 35246188, true],
  ["cakes", "Chocolate Berry Cake", "Rich chocolate cake adorned with fresh strawberries and blueberries.", 42000, 37050357],
  ["cakes", "Dark Chocolate Gateau", "Intense 70% cacao gateau with a molten centre. Baked daily in limited quantities.", 38000, 10620462, false, true],
  ["cakes", "Classic Chocolate Slice", "Tender chocolate sponge with whipped cream. Perfect with a flat white.", 36000, 4110008],
  ["cakes", "Cake Selection Board", "A tasting board of our four signature cakes, ideal for sharing.", 65000, 8774179],
  ["breakfast", "Avocado Toast & Poached Egg", "Sourdough, smashed avocado, soft poached egg, rosemary and chilli flakes.", 52000, 7937462, true],
  ["breakfast", "Sunny-Side Toast", "Toasted rustic bread with sunny-side-up eggs, radish and heirloom tomato.", 48000, 7937471],
  ["breakfast", "Soft-Boiled Egg Toast", "Soft-boiled egg, avocado and pomegranate jewels on toasted sourdough.", 46000, 793785],
  ["breakfast", "Aurum Morning Plate", "Fried eggs, avocado, hash browns and toasted bread. The full morning ritual.", 62000, 8525158],
  ["breakfast", "Butter Croissant", "Golden, flaky and baked fresh each morning with French butter.", 22000, 20002837, true],
  ["breakfast", "Croissant & Berry Preserve", "Warm croissant served with house-made berry preserve and whipped butter.", 28000, 12048451],
  ["breakfast", "Parisian Breakfast", "Croissant, jam, butter and a cup of coffee: a classic French start.", 45000, 32802349],
  ["main-dishes", "Creamy Mushroom Spaghetti", "Spaghetti in a cream sauce of wild mushrooms, spinach and parmesan.", 68000, 5531093],
  ["main-dishes", "Chicken & Mushroom Pasta", "Grilled chicken, forest mushrooms and herbs tossed through al dente pasta.", 72000, 17636472],
  ["main-dishes", "Seafood Cream Pasta", "Tiger prawns and mushrooms in a light garlic cream sauce.", 89000, 31235407],
  ["main-dishes", "Aurum Club Sandwich", "Triple-decker with roast chicken, bacon, egg and fresh greens, with fries.", 64000, 12469931],
  ["snacks", "Café Sandwich & Fries", "Toasted brioche sandwich with crispy golden fries and dipping sauces.", 46000, 19674144],
  ["snacks", "Artisan Cookie Box", "Six oven-fresh cookies: chocolate chunk, oatmeal raisin and sea-salt caramel.", 30000, 298217],
  ["snacks", "Pastry Basket", "An assortment of croissants, muffins and Danish pastries.", 44000, 38583473],
  ["snacks", "Golden Croissants (2 pcs)", "Two flaky butter croissants, ideal to share or take away.", 40000, 35095957],
];

export const DEFAULT_HOURS = [
  { day: "Monday", open: "08:00", close: "23:00", closed: false },
  { day: "Tuesday", open: "08:00", close: "23:00", closed: false },
  { day: "Wednesday", open: "08:00", close: "23:00", closed: false },
  { day: "Thursday", open: "08:00", close: "23:00", closed: false },
  { day: "Friday", open: "08:00", close: "00:00", closed: false },
  { day: "Saturday", open: "09:00", close: "00:00", closed: false },
  { day: "Sunday", open: "09:00", close: "22:00", closed: false },
];

let seeding: Promise<void> | null = null;

async function run() {
  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(884412)`);

    const existingSettings = await tx.select({ id: cafeSettings.id }).from(cafeSettings).limit(1);
    if (existingSettings.length === 0) {
      await tx.insert(cafeSettings).values({
        id: 1,
        name: "Aurum Café",
        tagline: "Specialty coffee & fine pastry in the heart of Tashkent",
        phone: "+998 90 123 45 67",
        whatsapp: "998901234567",
        telegram: "aurumcafe",
        instagram: "aurumcafe",
        email: "hello@aurumcafe.uz",
        address: "12 Amir Temur Avenue, Mirzo Ulugbek District, Tashkent, Uzbekistan",
        mapQuery: "Amir Temur Avenue 12, Tashkent, Uzbekistan",
        hours: DEFAULT_HOURS,
      });
    }

    const existingCats = await tx.select({ id: categories.id }).from(categories).limit(1);
    if (existingCats.length === 0) {
      const cats = await tx
        .insert(categories)
        .values(CATEGORIES.map((c, i) => ({ ...c, sortOrder: i })))
        .returning();
      const bySlug = new Map(cats.map((c) => [c.slug, c.id]));
      await tx.insert(products).values(
        PRODUCTS.map(([cat, name, description, price, img, featured, soldOut]) => ({
          categoryId: bySlug.get(cat)!,
          name,
          description,
          priceUzs: price,
          imageUrl: px(img, 900),
          featured: !!featured,
          available: !soldOut,
        })),
      );
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@aurumcafe.uz").toLowerCase();
    const admins = await tx.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
    if (admins.length === 0) {
      const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD || "Admin12345!");
      const [u] = await tx
        .insert(users)
        .values({ email: adminEmail, passwordHash, role: "admin" })
        .onConflictDoUpdate({ target: users.email, set: { role: "admin" } })
        .returning({ id: users.id });
      await tx
        .insert(profiles)
        .values({ id: u.id, fullName: "Cafe Administrator" })
        .onConflictDoNothing();
    }
  });
}

export function ensureSeeded(): Promise<void> {
  if (!seeding) {
    seeding = run().catch((err) => {
      seeding = null;
      throw err;
    });
  }
  return seeding;
}
