import { Metadata } from "next";
import UploadVideoForm from "./UploadVideoForm";

export const metadata: Metadata = {
  title: "Upload Video",
  description:
    "Share your creativity with the world. Upload your high-quality videos to AeroVideo easily.",
  keywords: [
    "upload video",
    "share video",
    "creator studio",
    "AeroVideo upload",
  ],
  openGraph: {
    title: "Upload Video | AeroVideo",
    description:
      "Share your creativity with the world. Upload your high-quality videos to AeroVideo easily.",
    type: "website",
  },
};

export default function Page() {
  return <UploadVideoForm />;
}
