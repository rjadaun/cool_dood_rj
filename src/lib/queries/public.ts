import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { TAGS } from "@/lib/cache-tags";

const PUBLISHED = "PUBLISHED" as const;

export const getHeroSlides = unstable_cache(
  () =>
    prisma.heroSlide.findMany({
      where: { status: PUBLISHED },
      orderBy: { sortOrder: "asc" },
      include: { image: true },
    }),
  ["hero-slides"],
  { tags: [TAGS.hero], revalidate: 3600 }
);

export const getHomeSections = unstable_cache(
  () => prisma.homeSection.findMany({ orderBy: { sortOrder: "asc" } }),
  ["home-sections"],
  { tags: [TAGS.home], revalidate: 3600 }
);

export const getStats = unstable_cache(
  () => prisma.stat.findMany({ where: { status: PUBLISHED }, orderBy: { sortOrder: "asc" } }),
  ["stats"],
  { tags: [TAGS.stats], revalidate: 3600 }
);

export const getCategories = unstable_cache(
  () =>
    prisma.category.findMany({
      where: { status: PUBLISHED },
      orderBy: { sortOrder: "asc" },
      include: { cover: true, _count: { select: { projects: { where: { status: PUBLISHED } } } } },
    }),
  ["categories-public"],
  { tags: [TAGS.categories, TAGS.portfolio], revalidate: 3600 }
);

export const getFeaturedProjects = unstable_cache(
  () =>
    prisma.portfolioProject.findMany({
      where: { status: PUBLISHED, featured: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
      include: { cover: true, category: true },
    }),
  ["featured-projects"],
  { tags: [TAGS.portfolio], revalidate: 3600 }
);

export const getSelectedProjects = unstable_cache(
  () =>
    prisma.portfolioProject.findMany({
      where: { status: PUBLISHED },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
      take: 4,
      include: { cover: true, category: true },
    }),
  ["selected-projects"],
  { tags: [TAGS.portfolio], revalidate: 3600 }
);

export const getServices = unstable_cache(
  () =>
    prisma.service.findMany({
      where: { status: PUBLISHED },
      orderBy: { sortOrder: "asc" },
      include: { image: true, features: { orderBy: { sortOrder: "asc" } } },
    }),
  ["services-public"],
  { tags: [TAGS.services], revalidate: 3600 }
);

export const getClients = unstable_cache(
  () =>
    prisma.client.findMany({
      where: { status: PUBLISHED },
      orderBy: { sortOrder: "asc" },
      include: { logo: true, logoDark: true },
    }),
  ["clients-public"],
  { tags: [TAGS.clients], revalidate: 3600 }
);

export const getTestimonials = unstable_cache(
  () =>
    prisma.testimonial.findMany({
      where: { status: PUBLISHED },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
      include: { image: true },
    }),
  ["testimonials-public"],
  { tags: [TAGS.testimonials], revalidate: 3600 }
);

export const getAwards = unstable_cache(
  () => prisma.award.findMany({ where: { status: PUBLISHED }, orderBy: { sortOrder: "asc" }, include: { logo: true } }),
  ["awards-public"],
  { tags: [TAGS.awards], revalidate: 3600 }
);

export const getPackages = unstable_cache(
  () =>
    prisma.package.findMany({
      where: { status: PUBLISHED },
      orderBy: { sortOrder: "asc" },
      include: { features: { orderBy: { sortOrder: "asc" } } },
    }),
  ["packages-public"],
  { tags: [TAGS.packages], revalidate: 3600 }
);

export const getSocialLinks = unstable_cache(
  () => prisma.socialLink.findMany({ where: { visible: true }, orderBy: { sortOrder: "asc" } }),
  ["social-public"],
  { tags: [TAGS.social], revalidate: 3600 }
);

export const getPublishedPosts = unstable_cache(
  () =>
    prisma.blogPost.findMany({
      where: { status: PUBLISHED },
      orderBy: { publishedAt: "desc" },
      include: { cover: true },
    }),
  ["posts-public"],
  { tags: [TAGS.blog], revalidate: 3600 }
);

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, status: PUBLISHED },
    include: { cover: true },
  });
}

export async function getPageBySlug(slug: string) {
  return prisma.page.findFirst({
    where: { slug, visible: true },
    include: {
      image: true,
      sections: { where: { visible: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}

// ── Portfolio listing (filterable, paginated) ──
export interface PortfolioQuery {
  category?: string;
  page?: number;
  perPage?: number;
}

export async function getPortfolioProjects({ category, page = 1, perPage = 9 }: PortfolioQuery) {
  const where = {
    status: PUBLISHED,
    ...(category && category !== "all" ? { category: { slug: category } } : {}),
  };
  const [projects, total] = await Promise.all([
    prisma.portfolioProject.findMany({
      where,
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { publishedAt: "desc" }],
      include: { cover: true, category: true },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.portfolioProject.count({ where }),
  ]);
  return { projects, total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getProjectBySlug(slug: string) {
  return prisma.portfolioProject.findFirst({
    where: { slug, status: PUBLISHED },
    include: {
      cover: true,
      category: true,
      client: { include: { logo: true } },
      ogImage: true,
      images: {
        where: { visible: true },
        orderBy: { sortOrder: "asc" },
        include: { media: true },
      },
    },
  });
}

export async function getRelatedProjects(projectId: string, categoryId: string | null) {
  return prisma.portfolioProject.findMany({
    where: {
      status: PUBLISHED,
      id: { not: projectId },
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: { sortOrder: "asc" },
    take: 3,
    include: { cover: true, category: true },
  });
}
