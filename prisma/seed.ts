/**
 * Seed script — realistic, tasteful, fully replaceable sample content.
 * Images use deterministic Lorem Picsum seeds (licensed under Unsplash),
 * so the site renders immediately. Replace everything from the admin panel.
 *
 *   npm run db:seed
 */
import { PrismaClient, type Prisma, type Category } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@lumiere.studio";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "ChangeMe!2026";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Studio Admin";

const NEUTRAL_BLUR =
  "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAAAwAgCdASoQAAsABUB8JZQCdAEO5g2gAP7+9p8AAP7+/eAAA";

/** Create a Media row backed by a deterministic Picsum image. */
async function media(seed: string, w: number, h: number, alt: string) {
  const url = `https://picsum.photos/seed/${seed}/${w}/${h}`;
  return prisma.media.create({
    data: {
      url,
      key: `seed/${seed}-${w}x${h}`,
      filename: `${seed}.jpg`,
      mimeType: "image/jpeg",
      size: Math.round(w * h * 0.12),
      width: w,
      height: h,
      blurDataUrl: NEUTRAL_BLUR,
      altText: alt,
      folder: "seed",
    },
  });
}

async function main() {
  console.info("🌱 Seeding Rjadaun…");

  // ── Clean (idempotent reseed) ──
  await prisma.$transaction([
    prisma.portfolioImage.deleteMany(),
    prisma.serviceFeature.deleteMany(),
    prisma.packageFeature.deleteMany(),
    prisma.pageSection.deleteMany(),
    prisma.heroSlide.deleteMany(),
    prisma.portfolioProject.deleteMany(),
    prisma.service.deleteMany(),
    prisma.testimonial.deleteMany(),
    prisma.award.deleteMany(),
    prisma.package.deleteMany(),
    prisma.client.deleteMany(),
    prisma.category.deleteMany(),
    prisma.socialLink.deleteMany(),
    prisma.newsletterSubscriber.deleteMany(),
    prisma.inquiry.deleteMany(),
    prisma.blogPost.deleteMany(),
    prisma.stat.deleteMany(),
    prisma.page.deleteMany(),
    prisma.homeSection.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.media.deleteMany(),
  ]);

  // ── Super admin ──
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL.toLowerCase() },
    update: { passwordHash, name: ADMIN_NAME, role: "SUPER_ADMIN", status: "ACTIVE" },
    create: {
      email: ADMIN_EMAIL.toLowerCase(),
      name: ADMIN_NAME,
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  // ── Site settings ──
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Rjadaun",
      tagline: "Editorial & commercial photography",
      email: "hello@rjadaun.com",
      phone: "+1 (212) 555-0148",
      address: "Studio 4B, 210 Lafayette St, New York, NY",
      defaultSeoTitle: "Rjadaun · Editorial & Commercial Photography",
      defaultSeoDesc:
        "A creative studio crafting fashion, beauty and commercial photography for brands and people who value detail.",
      contactEmail: "hello@rjadaun.com",
      copyright: "Rjadaun",
      showPricingPublic: true,
      newsletterEnabled: true,
    },
  });

  // ── Home section ordering ──
  const homeSections: { key: Prisma.HomeSectionCreateManyInput["key"]; label: string }[] = [
    { key: "HERO", label: "Hero Slider" },
    { key: "ABOUT", label: "Introduction" },
    { key: "STATS", label: "Statistics" },
    { key: "CATEGORIES", label: "Categories" },
    { key: "FEATURED_WORK", label: "Featured Work" },
    { key: "PROCESS", label: "Process" },
    { key: "SERVICES", label: "Services" },
    { key: "SELECTED_WORK", label: "Selected Work" },
    { key: "CLIENTS", label: "Clients" },
    { key: "TESTIMONIALS", label: "Testimonials" },
    { key: "AWARDS", label: "Awards" },
    { key: "PACKAGES", label: "Packages" },
    { key: "SOCIAL", label: "Social" },
    { key: "NEWSLETTER", label: "Newsletter" },
    { key: "CTA", label: "Contact CTA" },
  ];
  await prisma.homeSection.createMany({
    data: homeSections.map((s, i) => ({ key: s.key, label: s.label, sortOrder: i, visible: true })),
  });

  // ── Hero slides ──
  const heroImgs = await Promise.all([
    media("hero-fashion", 2400, 1500, "Fashion editorial photography"),
    media("hero-beauty", 2400, 1500, "Beauty close-up photography"),
    media("hero-campaign", 2400, 1500, "Commercial campaign photography"),
  ]);
  await prisma.heroSlide.createMany({
    data: [
      {
        label: "Fashion / Editorial",
        title: "Visual stories with a refined perspective.",
        description: "Photography crafted for fashion, brands and people who value detail.",
        ctaText: "View Portfolio",
        ctaUrl: "/portfolio",
        ctaSecondary: "Work With Me",
        ctaSecondaryUrl: "/contact",
        imageId: heroImgs[0].id,
        transition: "KEN_BURNS",
        overlay: 45,
        sortOrder: 0,
      },
      {
        label: "Beauty",
        title: "Light, texture and the quiet power of detail.",
        description: "Beauty and portrait work that lingers long after the first glance.",
        ctaText: "View Portfolio",
        ctaUrl: "/portfolio",
        ctaSecondary: "Work With Me",
        ctaSecondaryUrl: "/contact",
        imageId: heroImgs[1].id,
        transition: "SLOW_ZOOM",
        overlay: 40,
        sortOrder: 1,
      },
      {
        label: "Commercial",
        title: "Campaigns that carry a brand's whole intention.",
        description: "Art-directed commercial imagery, from concept to final frame.",
        ctaText: "View Portfolio",
        ctaUrl: "/portfolio",
        ctaSecondary: "Work With Me",
        ctaSecondaryUrl: "/contact",
        imageId: heroImgs[2].id,
        transition: "CROSSFADE",
        overlay: 50,
        sortOrder: 2,
      },
    ],
  });

  // ── Categories ──
  const categoryDefs = [
    ["Fashion", "Editorial and runway-adjacent fashion stories."],
    ["Commercial", "Brand campaigns and advertising imagery."],
    ["Beauty", "Skin, texture and cosmetic photography."],
    ["Portrait", "Character-driven portraits in studio and location."],
    ["Product", "Considered still life and product photography."],
    ["Lifestyle", "Natural, narrative lifestyle imagery."],
  ];
  const categories: Category[] = [];
  for (let i = 0; i < categoryDefs.length; i++) {
    const [name, description] = categoryDefs[i]!;
    const cover = await media(`cat-${name!.toLowerCase()}`, 1200, 1500, `${name} category`);
    categories.push(
      await prisma.category.create({
        data: {
          name: name!,
          slug: name!.toLowerCase(),
          description,
          coverId: cover.id,
          sortOrder: i,
        },
      })
    );
  }
  const catBy = (name: string) => categories.find((c) => c.name === name)!;

  // ── Clients ──
  const clientNames = ["AURELIA", "MONOLITH", "Studio Noir", "Verdant", "ATELIER 9", "Northbound", "Maison Clé", "OBJEKT"];
  const clients = [];
  for (let i = 0; i < clientNames.length; i++) {
    const logo = await media(`client-${i}`, 400, 200, `${clientNames[i]} logo`);
    clients.push(
      await prisma.client.create({
        data: { name: clientNames[i]!, website: "https://example.com", logoId: logo.id, sortOrder: i },
      })
    );
  }

  // ── Portfolio projects ──
  const projectDefs: {
    title: string;
    category: string;
    client: string;
    location: string;
    year: number;
    featured: boolean;
    description: string;
    imgSeeds: [string, number, number][];
  }[] = [
    {
      title: "Nocturne",
      category: "Fashion",
      client: "AURELIA",
      location: "Paris",
      year: 2025,
      featured: true,
      description: "An after-dark editorial exploring silhouette and restraint across the streets of the Marais.",
      imgSeeds: [["nocturne-1", 1600, 2000], ["nocturne-2", 2000, 1400], ["nocturne-3", 1400, 1800], ["nocturne-4", 1600, 2000]],
    },
    {
      title: "Golden Hour",
      category: "Beauty",
      client: "Maison Clé",
      location: "New York",
      year: 2025,
      featured: true,
      description: "A beauty story built entirely on natural window light and warm, unhurried moments.",
      imgSeeds: [["golden-1", 1400, 1800], ["golden-2", 1600, 2000], ["golden-3", 2000, 1400]],
    },
    {
      title: "Concrete Bloom",
      category: "Commercial",
      client: "MONOLITH",
      location: "Berlin",
      year: 2024,
      featured: true,
      description: "A commercial campaign contrasting brutalist architecture with organic form.",
      imgSeeds: [["concrete-1", 2000, 1400], ["concrete-2", 1600, 2000], ["concrete-3", 1600, 2000], ["concrete-4", 2000, 1400]],
    },
    {
      title: "Still Objects",
      category: "Product",
      client: "OBJEKT",
      location: "Studio",
      year: 2024,
      featured: false,
      description: "Product still life reduced to essential shape, shadow and material.",
      imgSeeds: [["still-1", 1600, 1600], ["still-2", 1600, 1600], ["still-3", 1600, 2000]],
    },
    {
      title: "The Quiet Coast",
      category: "Lifestyle",
      client: "Northbound",
      location: "Big Sur",
      year: 2024,
      featured: false,
      description: "A lifestyle series following light along an unhurried stretch of coastline.",
      imgSeeds: [["coast-1", 2000, 1400], ["coast-2", 1400, 1800], ["coast-3", 2000, 1400]],
    },
    {
      title: "Studio Portraits",
      category: "Portrait",
      client: "ATELIER 9",
      location: "London",
      year: 2023,
      featured: true,
      description: "A collection of character-led studio portraits in high-key monochrome.",
      imgSeeds: [["portrait-1", 1400, 1800], ["portrait-2", 1400, 1800], ["portrait-3", 1600, 2000], ["portrait-4", 2000, 1400]],
    },
  ];

  for (let i = 0; i < projectDefs.length; i++) {
    const def = projectDefs[i]!;
    const cover = await media(`proj-${i}-cover`, 1600, 2000, `${def.title} cover`);
    const project = await prisma.portfolioProject.create({
      data: {
        title: def.title,
        slug: def.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        description: def.description,
        categoryId: catBy(def.category).id,
        clientId: clients.find((c) => c.name === def.client)?.id,
        location: def.location,
        year: def.year,
        coverId: cover.id,
        credits: "Photography · Rjadaun\nStyling · Studio Team\nProduction · Rjadaun",
        services: ["Photography", "Art Direction", "Post-production"],
        tags: [def.category, def.location],
        featured: def.featured,
        status: "PUBLISHED",
        publishedAt: new Date(),
        sortOrder: i,
        galleryLayout: "MIXED",
      },
    });
    for (let j = 0; j < def.imgSeeds.length; j++) {
      const [seed, w, h] = def.imgSeeds[j]!;
      const m = await media(seed, w, h, `${def.title} image ${j + 1}`);
      await prisma.portfolioImage.create({
        data: {
          projectId: project.id,
          mediaId: m.id,
          sortOrder: j,
          altText: `${def.title} frame ${j + 1}`,
          aspect: w > h ? "LANDSCAPE" : "PORTRAIT",
        },
      });
    }
  }

  // ── Services ──
  const serviceDefs: [string, string, string, string[]][] = [
    ["Portrait Photography", "Studio and location portraits with a fine-art sensibility.", "Character-driven portraiture for individuals, founders and talent.", ["Studio or location", "Direction & posing", "Retouched delivery"]],
    ["Fashion Photography", "Editorial and lookbook photography for brands and publications.", "Full fashion stories from concept through to final edit.", ["Editorial & lookbook", "On-set styling support", "Motion add-ons"]],
    ["Product Photography", "Considered still life that elevates the object.", "Clean, art-directed product imagery for e-commerce and campaigns.", ["E-commerce & hero", "Set design", "Consistent presets"]],
    ["Commercial Photography", "Campaign imagery aligned to your brand system.", "Advertising and brand photography built around a single intention.", ["Campaign concepting", "Full production", "Usage licensing"]],
    ["Video & Content", "Short-form motion to sit alongside stills.", "Complementary motion content for social and campaigns.", ["Behind-the-scenes", "Short-form reels", "Sound design"]],
    ["Creative Direction", "Art direction and visual strategy for shoots.", "End-to-end creative direction for a coherent visual language.", ["Moodboards", "Casting & location", "Visual guidelines"]],
  ];
  for (let i = 0; i < serviceDefs.length; i++) {
    const [name, short, long, features] = serviceDefs[i]!;
    const img = await media(`svc-${i}`, 1200, 1500, `${name}`);
    await prisma.service.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        shortDescription: short,
        longDescription: long,
        number: String(i + 1).padStart(2, "0"),
        imageId: img.id,
        sortOrder: i,
        ctaText: "Enquire",
        ctaUrl: "/contact",
        features: { create: features.map((label, k) => ({ label, sortOrder: k })) },
      },
    });
  }

  // ── Stats ──
  await prisma.stat.createMany({
    data: [
      { value: "06+", label: "Years Behind Camera", sortOrder: 0 },
      { value: "120+", label: "Shoots Completed", sortOrder: 1 },
      { value: "80+", label: "Happy Clients", sortOrder: 2 },
      { value: "35+", label: "Brand Campaigns", sortOrder: 3 },
    ],
  });

  // ── Testimonials ──
  const testimonialDefs: [string, string, string, string, number][] = [
    ["Camille Rousseau", "AURELIA", "Creative Director", "Working with the studio felt effortless. The images carried exactly the mood we'd imagined, and then some.", 5],
    ["Daniel Osei", "MONOLITH", "Brand Lead", "A rare combination of technical precision and genuine artistry. Our campaign has never looked stronger.", 5],
    ["Yuki Tanaka", "OBJEKT", "Founder", "Every frame was considered. The product photography completely changed how customers perceive us.", 5],
    ["Sofia Marchetti", "Maison Clé", "Head of Marketing", "Calm, prepared and endlessly creative on set. We've booked three shoots since and will keep coming back.", 5],
  ];
  for (let i = 0; i < testimonialDefs.length; i++) {
    const [name, company, role, quote, rating] = testimonialDefs[i]!;
    const img = await media(`person-${i}`, 400, 400, name);
    await prisma.testimonial.create({
      data: { name, company, role, quote, rating, imageId: img.id, featured: i < 3, sortOrder: i },
    });
  }

  // ── Awards ──
  const awardDefs: [string, number, string][] = [
    ["Featured · Vogue Italia", 2025, "Editorial feature in the September fashion issue."],
    ["Winner · IPA Fashion", 2024, "International Photography Awards, Fashion category."],
    ["Shortlist · British Journal of Photography", 2024, "Portrait of Humanity, third edition."],
    ["Feature · It's Nice That", 2023, "Studio profile and interview."],
  ];
  for (let i = 0; i < awardDefs.length; i++) {
    const [name, year, description] = awardDefs[i]!;
    await prisma.award.create({ data: { name, year, description, sortOrder: i } });
  }

  // ── Packages ──
  const packageDefs: { name: string; price: string; suffix: string; description: string; featured: boolean; features: string[] }[] = [
    { name: "Portrait Session", price: "$650", suffix: "per session", description: "A focused portrait session for individuals and talent.", featured: false, features: ["Up to 2 hours", "1 location", "10 retouched images", "Online gallery"] },
    { name: "Fashion / Editorial", price: "$2,400", suffix: "per day", description: "A full editorial day rate for fashion stories.", featured: true, features: ["Full shooting day", "Multiple looks", "30 retouched images", "Styling support", "Usage license"] },
    { name: "Commercial / Brand", price: "From $4,500", suffix: "per project", description: "End-to-end production for brand campaigns.", featured: false, features: ["Full production", "Creative direction", "Unlimited setups", "Broad usage rights", "Motion add-on"] },
    { name: "Custom Quote", price: "Let's talk", suffix: "", description: "Bespoke scope for larger or ongoing work.", featured: false, features: ["Tailored scope", "Retainer options", "Priority scheduling"] },
  ];
  for (let i = 0; i < packageDefs.length; i++) {
    const p = packageDefs[i]!;
    await prisma.package.create({
      data: {
        name: p.name,
        price: p.price,
        priceSuffix: p.suffix,
        description: p.description,
        featured: p.featured,
        ctaText: "Enquire",
        ctaUrl: "/contact",
        sortOrder: i,
        features: { create: p.features.map((label, k) => ({ label, sortOrder: k })) },
      },
    });
  }

  // ── Social ──
  await prisma.socialLink.createMany({
    data: [
      { platform: "INSTAGRAM", url: "https://instagram.com", username: "@lumiere.studio", sortOrder: 0 },
      { platform: "YOUTUBE", url: "https://youtube.com", username: "Rjadaun", sortOrder: 1 },
      { platform: "BEHANCE", url: "https://behance.net", username: "lumierestudio", sortOrder: 2 },
      { platform: "PINTEREST", url: "https://pinterest.com", username: "lumierestudio", sortOrder: 3 },
    ],
  });

  // ── Blog ──
  const blogDefs: [string, string, string][] = [
    ["Lighting for Editorial Fashion", "A short field guide to shaping light on set for fashion stories.", "Editorial"],
    ["Building a Shoot From a Single Reference", "How one image can seed an entire campaign's visual direction.", "Process"],
    ["The Case for Restraint in Beauty", "Why less retouching often reads as more premium.", "Beauty"],
  ];
  for (let i = 0; i < blogDefs.length; i++) {
    const [title, excerpt, category] = blogDefs[i]!;
    const cover = await media(`blog-${i}`, 1600, 1000, title);
    await prisma.blogPost.create({
      data: {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        excerpt,
        content: `<p>${excerpt}</p><p>This is sample journal content, replace it from the admin panel. It supports headings, emphasis, lists and quotes.</p><h2>A considered approach</h2><p>Every project begins with a reference and a question: what feeling should the final image carry?</p>`,
        category,
        author: "Rjadaun",
        coverId: cover.id,
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - i * 86400000 * 7),
        tags: [category],
      },
    });
  }

  // ── Editable pages ──
  const pageDefs: [string, string, string, string][] = [
    ["about", "About", "Photography with a refined eye.", "A creative studio working across fashion, beauty and commercial photography."],
    ["services", "Services", "What we do.", "Full-service creative photography, from concept to final frame."],
    ["contact", "Contact", "Let's create something worth remembering.", "Tell us about your project and we'll be in touch within two business days."],
    ["privacy-policy", "Privacy Policy", "Privacy Policy", "How we handle your information."],
    ["terms", "Terms", "Terms of Service", "The terms that govern the use of this website."],
  ];
  const aboutImage = await media("about-photographer", 1200, 1500, "The photographer");
  for (const [slug, title, heading, subheading] of pageDefs) {
    await prisma.page.create({
      data: {
        slug: slug!,
        title: title!,
        heading,
        subheading,
        imageId: slug === "about" ? aboutImage.id : undefined,
        content:
          slug === "privacy-policy" || slug === "terms"
            ? "<h2>Overview</h2><p>This is sample legal content. Replace it with your own policy from the admin panel.</p>"
            : slug === "about"
              ? "<p>Rjadaun is a creative practice working across fashion, beauty and commercial photography.</p><h2>A considered approach</h2><p>Every project begins with a reference and a question: what feeling should the final image carry? Replace this content from the admin panel.</p>"
              : "<p>Replace this content from the admin panel.</p>",
      },
    });
  }

  // ── Home page (intro + process + CTA content, editable via Pages admin) ──
  const photographer = await media("photographer-portrait", 1200, 1500, "The photographer");
  const home = await prisma.page.create({
    data: {
      slug: "home",
      title: "Home",
      heading: "Photography with a refined eye.",
      subheading: "About the Photographer",
      imageId: photographer.id,
      content:
        "<p>Rjadaun is a creative practice working across fashion, beauty and commercial photography. We build images with intention, considering light, texture and restraint, for brands and people who value detail.</p>",
    },
  });
  const processSteps: [string, string][] = [
    ["01 · Discover", "We begin with your goals, references and audience to define a clear visual direction."],
    ["02 · Plan", "Casting, location, styling and a shot list, every detail agreed before the shoot day."],
    ["03 · Create", "A calm, well-prepared set where the images come to life exactly as imagined."],
    ["04 · Deliver & Grow", "Carefully edited, retouched and delivered, ready to elevate your brand."],
  ];
  await prisma.pageSection.createMany({
    data: [
      ...processSteps.map(([heading, body], i) => ({
        pageId: home.id,
        key: "process",
        heading,
        body,
        sortOrder: i,
      })),
      {
        pageId: home.id,
        key: "cta",
        heading: "Let's create something worth remembering.",
        body: "Have a project in mind? Tell us about it, we'd love to help bring it to life.",
        ctaText: "Get in Touch",
        ctaUrl: "/contact",
        sortOrder: 10,
      },
    ],
  });

  // ── Newsletter sample ──
  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: "hello@example.com" },
      { email: "studio@example.com" },
    ],
  });

  console.info("✅ Seed complete.");
  console.info(`   Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
