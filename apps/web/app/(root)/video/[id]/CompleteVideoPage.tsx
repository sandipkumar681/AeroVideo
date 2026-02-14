"use client";
import React, { useEffect, useState } from "react";
import { IVideo } from "@aerovideo/types";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { VideoInfo } from "@/components/ui/VideoInfo";
import { RelatedVideos } from "@/components/ui/RelatedVideos";
import { CommentSection } from "@/components/ui/CommentSection";
import { getVideoDetails, getRelatedVideos } from "@/lib/api/videoApi";
import { getVideoComments } from "@/lib/api/commentApi";

function CompleteVideoPage({ id }: { id: string }) {
  const [video, setVideo] = useState<{ data: IVideo } | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<IVideo[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getAllDataFromApi = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const videoData = await getVideoDetails(id);
        setVideo(videoData);

        // Fetch secondary data without blocking the main video if they fail
        Promise.all([
          getRelatedVideos(id).catch((err) => {
            console.error("Failed to fetch related videos:", err);
            return { data: [] };
          }),
          getVideoComments(id).catch((err) => {
            console.error("Failed to fetch comments:", err);
            return { data: [] };
          }),
        ]).then(([relatedData, commentsData]) => {
          setRelatedVideos(relatedData?.data || []);
          setComments(commentsData?.data || []);
        });
      } catch (err: any) {
        console.error("Error loading video page:", err);
        setError(err.message || "Failed to load video");
      } finally {
        setIsLoading(false);
      }
    };

    getAllDataFromApi();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video || !video.data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Video Not Found
          </h2>
          <p className="text-muted-foreground">
            {error || "This video could not be found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-6">
        <VideoPlayer
          videoUrl={video.data.videoFile}
          thumbnailUrl={video.data.thumbnail}
        />

        <VideoInfo video={video.data} />

        <CommentSection videoId={id} initialComments={comments} />
      </div>

      {/* Sidebar */}
      <aside className="lg:col-span-4">
        <div className="lg:sticky lg:top-6">
          <RelatedVideos videos={relatedVideos} currentVideoId={id} />
        </div>
      </aside>
    </div>
  );
}

export default CompleteVideoPage;
