"use client";

import { IVideo } from "@servicely/types";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import React from "react";
import Link from "next/link";

interface VideoCardProps {
  video: IVideo;
  className?: string;
}

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

export function VideoCard({ video, className }: VideoCardProps) {
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
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={cn(
        "block group cursor-pointer space-y-3 rounded-xl transition-all hover:bg-accent/5",
        className
      )}
    >
      {/* Thumbnail Container */}
      <Link href={`/video/${(video as any)._id}`} className="block">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <Play className="h-12 w-12 opacity-20" />
            </div>
          )}

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(video.duration)}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-12 w-12 fill-white text-white drop-shadow-lg" />
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="space-y-1 px-1">
        <Link href={`/video/${(video as any)._id}`} className="block">
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
            {video.title}
          </h3>
        </Link>

        {/* Owner Info */}
        <div className="flex items-center gap-2 mt-1">
          {isPopulatedOwner(video.owner) ? (
            <>
              <Link
                href={`/channel/${video.owner.userName}`}
                className="h-6 w-6 rounded-full bg-muted overflow-hidden shrink-0 transition-transform hover:scale-110 active:scale-95"
              >
                {video.owner.avatar ? (
                  <img
                    src={video.owner.avatar}
                    alt={video.owner.userName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary text-[10px] font-bold">
                    {video.owner.userName?.[0]?.toUpperCase()}
                  </div>
                )}
              </Link>
              <Link
                href={`/channel/${video.owner.userName}`}
                className="truncate text-xs text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {video.owner.fullName || video.owner.userName}
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-muted" />
              <p className="text-xs text-muted-foreground">User</p>
            </div>
          )}
        </div>

        <Link href={`/video/${(video as any)._id}`} className="block">
          <div className="flex items-center text-xs text-muted-foreground pt-1">
            <span>{formatViews(video.views)} views</span>
            <span className="mx-1">•</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
