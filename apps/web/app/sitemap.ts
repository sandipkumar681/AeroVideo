import { MetadataRoute } from "next";
import { BACKEND_URL } from "@/constant";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://aerovideo.com";

  // Static routes
  const routes = ["", "/search", "/subscriptions", "/login", "/register"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: route === "" ? 1 : 0.8,
    })
  );

  // Dynamic routes (Videos)
  try {
    const res = await fetch(`${BACKEND_URL}/videos/published`);
    const data = await res.json();
    const videos = data.data?.videos || [];

    const videoRoutes = videos.map((video: any) => ({
      url: `${baseUrl}/video/${video._id}`,
      lastModified: new Date(video.updatedAt || video.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...routes, ...videoRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return routes;
  }
}
