import { Metadata } from "next";
import SearchResults from "./SearchResults";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for your favorite videos and creators on AeroVideo.",
};

export default function SearchPage() {
  return <SearchResults />;
}
