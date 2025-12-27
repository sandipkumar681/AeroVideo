"use client";

import React, { useEffect, useState } from "react";
import { getChannelProfile } from "@/lib/api/userApi";
import { VideoCard } from "@/components/ui/VideoCard";
import { Loader2, Users, Play, Video, Eye, Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/redux-toolkit/hooks";
import { toggleSubscription } from "@/lib/api/subscriptionApi";

interface ChannelContentProps {
  userName: string;
}

export default function ChannelContent({ userName }: ChannelContentProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { isLoggedIn, userDetails } = useAppSelector(
    (state) => state.logInReducer
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getChannelProfile(userName);
        setProfile(result.data);
      } catch (error: any) {
        console.error("Failed to fetch channel profile:", error);
        toast.error(error.message || "Failed to load channel profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userName]);

  const handleToggleSubscription = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to subscribe");
      return;
    }

    setIsSubscribing(true);
    try {
      const result = await toggleSubscription(profile._id);
      setProfile((prev: any) => ({
        ...prev,
        isSubscribed: result.data.subscribed,
        totalSubscribers: result.data.subscribed
          ? prev.totalSubscribers + 1
          : prev.totalSubscribers - 1,
      }));
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle subscription");
    } finally {
      setIsSubscribing(false);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-2">Channel Not Found</h2>
        <p className="text-muted-foreground">
          The channel you are looking for doesn't exist.
        </p>
      </div>
    );
  }

  const isOwner = userDetails?._id === profile._id;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Channel Header */}
      <div className="relative w-full overflow-hidden">
        {/* Banner */}
        <div className="h-48 md:h-64 lg:h-80 w-full bg-linear-to-r from-primary/10 via-secondary/10 to-primary/10">
          {profile.coverImage ? (
            <img
              src={profile.coverImage}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-primary/20 via-primary/5 to-primary/20 backdrop-blur-3xl" />
          )}
        </div>

        {/* Profile Info Overlay */}
        <div className="container mx-auto max-w-7xl px-4 relative -mt-16 md:-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar */}
              <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-3xl border-[6px] border-background bg-muted overflow-hidden shadow-2xl shrink-0">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.userName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-4xl">
                    {profile.userName?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="text-center md:text-left pb-2">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
                  {profile.fullName || profile.userName}
                </h1>
                <div className="mt-2 flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-2 text-muted-foreground text-sm md:text-base">
                  <span className="font-semibold text-primary">
                    @{profile.userName}
                  </span>
                  <span className="hidden md:inline text-border">•</span>
                  <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1 rounded-full">
                    <Users className="h-4 w-4 text-primary/70" />
                    <span className="font-medium text-foreground">
                      {formatCount(profile.totalSubscribers)} subscribers
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pb-2">
              {!isOwner && (
                <Button
                  onClick={handleToggleSubscription}
                  disabled={isSubscribing}
                  size="lg"
                  variant={profile.isSubscribed ? "secondary" : "default"}
                  className={cn(
                    "rounded-full px-8 font-bold h-12 shadow-md transition-all",
                    !profile.isSubscribed &&
                      "bg-foreground text-background hover:bg-foreground/90"
                  )}
                >
                  {isSubscribing ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : profile.isSubscribed ? (
                    <BellOff className="h-5 w-5 mr-2" />
                  ) : (
                    <Bell className="h-5 w-5 mr-2" />
                  )}
                  {profile.isSubscribed ? "Unsubscribe" : "Subscribe"}
                </Button>
              )}
              {isOwner && (
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 font-bold h-12 bg-primary/10 text-primary hover:bg-primary/20 border-none"
                >
                  <a href="/studio">Manage Channel</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Channel Stats Overview */}
      <div className="container mx-auto max-w-7xl px-4 mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-muted/20 backdrop-blur-sm border border-border/50">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Views
            </p>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <p className="text-xl font-bold">
                {formatCount(profile.channelInfo?.totalViews || 0)}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Videos
            </p>
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-primary" />
              <p className="text-xl font-bold">
                {formatCount(profile.channelInfo?.totalVideos || 0)}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Subscribers
            </p>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <p className="text-xl font-bold">
                {formatCount(profile.totalSubscribers)}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Joined
            </p>
            <p className="text-xl font-bold">Recently</p>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <div className="container mx-auto max-w-7xl px-4 mt-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Play className="h-6 w-6 text-primary fill-current" />
            <h2 className="text-3xl font-bold">Videos</h2>
          </div>
          <p className="text-muted-foreground font-medium">
            {profile.videos?.length || 0} uploads
          </p>
        </div>

        {!profile.videos || profile.videos.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-muted/10 p-12 text-center">
            <Video className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground">
              No videos uploaded yet
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {profile.videos.map((video: any) => (
              <div
                key={video._id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
