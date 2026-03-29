import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://inhumans.io";
  const lastModified = new Date();

  const staticRoutes = [
    "",
    "/explore",
    "/auth/sign-in",
    "/auth/sign-up",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // In a real app, you would fetch profile handles from Supabase here
  // and add them to the sitemap. For now, we seed with static.
  
  return staticRoutes;
}
