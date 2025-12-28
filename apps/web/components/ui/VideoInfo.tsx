import React, { useState, useEffect } from "react";
import { IVideo } from "@servicely/types";
import {
  Calendar,
  Eye,
  ChevronDown,
  ChevronUp,
  Bell,
  BellOff,
  Loader2,
  Heart,
  User,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toggleSubscription } from "@/lib/api/subscriptionApi";
import { toggleLike } from "@/lib/api/likeApi";
import { toast } from "sonner";
import { useAppSelector } from "@/redux-toolkit/hooks";

interface VideoInfoProps {
  video: IVideo;
}

export function VideoInfo({ video }: VideoInfoProps) {
  const { isLoggedIn, userDetails } = useAppSelector(
    (state) => state.logInReducer
  );
  const [isSubscribed, setIsSubscribed] = useState(video.isSubscribed || false);
  const [subscriberCount, setSubscriberCount] = useState(
    video.subscriberCount || 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLiked, setIsLiked] = useState((video as any).isLiked || false);
  const [likesCount, setLikesCount] = useState((video as any).likesCount || 0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    setIsSubscribed(video.isSubscribed || false);
    setSubscriberCount(video.subscriberCount || 0);
    setIsLiked((video as any).isLiked || false);
    setLikesCount((video as any).likesCount || 0);
  }, [video]);

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

  const handleToggleSubscription = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to subscribe");
      return;
    }

    if (!isPopulatedOwner(video.owner)) return;

    setIsSubmitting(true);
    try {
      const result = await toggleSubscription(video.owner._id);
      setIsSubscribed(result.data.subscribed);
      setSubscriberCount((prev: number) =>
        result.data.subscribed ? prev + 1 : prev - 1
      );
      toast.success(result.message);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle subscription"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatLikes = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleToggleLike = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to like");
      return;
    }

    setIsLiking(true);
    try {
      const result = await toggleLike((video as any)._id);
      setIsLiked(result.data.liked);
      setLikesCount((prev: number) =>
        result.data.liked ? prev + 1 : prev - 1
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatSubscribers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
        {video.title}
      </h1>

      {/* Stats Row */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Eye className="h-4 w-4" />
          <span>{formatViews(video.views)} views</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(video.createdAt)}</span>
        </div>
      </div>

      {/* Owner Info and Subscription Button */}
      {isPopulatedOwner(video.owner) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-y border-border">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Avatar */}
            <Link
              href={`/channel/${video.owner.userName}`}
              className="relative h-12 w-12 rounded-full bg-muted overflow-hidden shrink-0 transition-transform hover:scale-105 active:scale-95"
            >
              {video.owner.avatar ? (
                <img
                  src={video.owner.avatar}
                  alt={video.owner.userName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
                  {video.owner.userName?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </Link>

            {/* Name and Subscriber Count */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/channel/${video.owner.userName}`}
                className="block hover:text-primary transition-colors"
              >
                <p className="font-bold text-foreground text-lg leading-tight truncate">
                  {video.owner.fullName || video.owner.userName}
                </p>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatSubscribers(subscriberCount)} subscribers</span>
              </div>
            </div>

            {/* Subscribe Button (Visible here on all screens to keep grouping logic consistent with "under owner details") */}
            <Button
              variant={isSubscribed ? "secondary" : "default"}
              className={cn(
                "rounded-full px-4 sm:px-6 font-semibold transition-all shrink-0 cursor-pointer ml-auto md:ml-0",
                !isSubscribed &&
                  "bg-foreground text-background hover:bg-foreground/90"
              )}
              onClick={handleToggleSubscription}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : isSubscribed ? (
                <BellOff className="h-4 w-4 mr-2" />
              ) : (
                <Bell className="h-4 w-4 mr-2" />
              )}
              {isSubscribed ? "Unsubscribe" : "Subscribe"}
            </Button>
          </div>

          {/* Action Buttons (Like, Share) */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
            <Button
              variant="secondary"
              className={cn(
                "rounded-full px-5 font-semibold transition-all shrink-0 flex items-center gap-2 cursor-pointer flex-1 md:flex-none justify-center md:justify-start",
                isLiked &&
                  "text-primary bg-primary/10 border-primary/20 hover:bg-primary/20"
              )}
              onClick={handleToggleLike}
              disabled={isLiking}
            >
              {isLiking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              )}
              <span className="min-w-[1ch]">{formatLikes(likesCount)}</span>
            </Button>

            <Button
              variant="secondary"
              className="rounded-full px-5 font-semibold transition-all shrink-0 flex items-center gap-2 cursor-pointer flex-1 md:flex-none justify-center md:justify-start"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="bg-muted/50 rounded-xl p-4">
        <div
          className={cn(
            "text-sm text-foreground whitespace-pre-wrap",
            !isDescriptionExpanded && "line-clamp-3"
          )}
        >
          {video.description}
        </div>

        {(video.description.length > 100 ||
          (video.tag && video.tag.length > 0)) && (
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="flex items-center gap-1 mt-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {isDescriptionExpanded ? (
              <>
                <span>Read less</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Read more</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        )}

        {/* Tags */}
        {isDescriptionExpanded && video.tag && video.tag.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {video.tag.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
