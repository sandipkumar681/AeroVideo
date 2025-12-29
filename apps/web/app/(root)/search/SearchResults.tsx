"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { IVideo } from "@aerovideo/types";
import { VideoCard } from "@/components/ui/VideoCard";
import { searchVideos } from "@/lib/api/videoApi";

function SearchResultsInner() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setVideos([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await searchVideos(query);
        setVideos(response.data || []);
      } catch (err: any) {
        console.error("Error searching videos:", err);
        setError(err.message || "Failed to fetch search results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Searching for videos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <p className="text-lg font-medium text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">
        {query ? `Search results for "${query}"` : "Search"}
      </h1>

      {videos.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No videos found
          </p>
          <p className="text-sm text-muted-foreground">
            Try searching for something else
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            //@ts-ignore
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchResults() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] flex-col items-center justify-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <SearchResultsInner />
    </Suspense>
  );
}
