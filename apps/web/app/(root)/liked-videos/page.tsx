import { Metadata } from "next";
import LikedVideosContent from "./LikedVideosContent";

export const metadata: Metadata = {
  title: "Liked Videos",
  description:
    "Revisit all the videos you've liked on AeroVideo. Your personalized collection of favorite content.",
  keywords: ["liked videos", "favorites", "video collection", "AeroVideo"],
  openGraph: {
    title: "Liked Videos | AeroVideo",
    description: "Revisit all the videos you've liked on AeroVideo.",
    type: "website",
  },
};

export default function LikedVideosPage() {
  return <LikedVideosContent />;
}
