import { Metadata } from "next";
import ProfileContent from "./ProfileContent";

export const metadata: Metadata = {
  title: "Profile - AeroVideo",
  description: "Manage your AeroVideo profile and settings",
};

export default function ProfilePage() {
  return <ProfileContent />;
}
