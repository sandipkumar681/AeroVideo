import { Metadata } from "next";
import HistoryContent from "./HistoryContent";

export const metadata: Metadata = {
  title: "History - AeroVideo",
  description: "View your watch history on AeroVideo.",
};

export default function HistoryPage() {
  return <HistoryContent />;
}
