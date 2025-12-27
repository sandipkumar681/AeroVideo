import React from "react";
import CompleteVideoPage from "./CompleteVideoPage";
import { getVideoDetails } from "@/lib/api/videoApi";

// export const dynamic = "force-dynamic";
interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const { id } = await params;
    const response = await getVideoDetails(id);
    const video = response.data;

    return {
      title: video.title || "Video",
      description: video.description || "Watch this video on AeroVideo",
      keywords: video.tag || [],
      openGraph: {
        title: video.title,
        description: video.description,
        type: "video.other",
        images: [
          {
            url: video.thumbnail,
            width: 1280,
            height: 720,
            alt: video.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: video.title,
        description: video.description,
        images: [video.thumbnail],
      },
    };
  } catch {
    return {
      title: "Video Not Found",
      description: "This video could not be found",
    };
  }
}

export default async function VideoPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="container mx-auto min-h-screen px-4 py-6">
      <CompleteVideoPage id={id} />
    </main>
  );
}
