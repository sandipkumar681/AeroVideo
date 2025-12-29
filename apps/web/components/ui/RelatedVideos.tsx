"use client";

import React from "react";
import { IVideo } from "@aerovideo/types";
import { Play } from "lucide-react";
import Link from "next/link";

interface RelatedVideosProps {
  videos: IVideo[];
  currentVideoId: string;
}

export function RelatedVideos({ videos, currentVideoId }: RelatedVideosProps) {
  const isPopulatedOwner = (
    owner: any
  ): owner is {
    _id: string;
    userName: string;
    avatar?: string;
    fullName?: string;
  } => {
    return owner && typeof owner === "object" && "userName" in owner;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (date: Date | string) => {
    const now = new Date();
    const videoDate = new Date(date);
    const seconds = Math.floor((now.getTime() - videoDate.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  };

  // Filter out current video
  const relatedVideos = videos.filter((v: any) => v._id !== currentVideoId);

  if (relatedVideos.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No related videos found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold px-2">Related Videos</h2>

      <div className="space-y-3">
        {relatedVideos.map((video: any) => (
          <Link
            key={video._id}
            href={`/video/${video._id}`}
            className="flex gap-2 p-2 rounded-xl hover:bg-accent/50 transition-colors group"
          >
            {/* Thumbnail */}
            <div className="relative w-40 md:w-44 aspect-video shrink-0 bg-muted rounded-lg overflow-hidden">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-secondary">
                  <Play className="h-8 w-8 opacity-20" />
                </div>
              )}

              {/* Duration Badge */}
              <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
                {formatDuration(video.duration)}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                <Play className="h-8 w-8 fill-white text-white drop-shadow-lg" />
              </div>
            </div>

            {/* Video Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                {video.title}
              </h3>
              <p className="line-clamp-1 text-[11px] text-muted-foreground font-medium">
                {isPopulatedOwner(video.owner)
                  ? video.owner.fullName || video.owner.userName
                  : "User"}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span>{formatViews(video.views)} views</span>
                <span className="opacity-50">•</span>
                <span>{formatDate(video.createdAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
