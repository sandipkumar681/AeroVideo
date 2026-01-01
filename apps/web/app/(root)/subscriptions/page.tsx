import { Metadata } from "next";
import SubscriptionsContent from "./SubscriptionsContent";

export const metadata: Metadata = {
  title: "Subscriptions",
  description:
    "Manage and view all the channels you are subscribed to on AeroVideo.",
  keywords: ["subscriptions", "channels", "AeroVideo"],
  openGraph: {
    title: "Subscriptions | AeroVideo",
    description:
      "Manage and view all the channels you are subscribed to on AeroVideo.",
    type: "website",
  },
};

export default function SubscriptionsPage() {
  return <SubscriptionsContent />;
}
