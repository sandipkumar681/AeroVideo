"use client";

import React, { useEffect, useState } from "react";
import {
  getSubscribedChannels,
  toggleSubscription,
  SubscribedChannel,
} from "@/lib/api/subscriptionApi";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, UserMinus, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SubscriptionsContent() {
  const [subscriptions, setSubscriptions] = useState<SubscribedChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [unsubscribingId, setUnsubscribingId] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      const data = await getSubscribedChannels();
      setSubscriptions(data || []);
    } catch (error: any) {
      console.error("Failed to fetch subscriptions:", error);
      toast.error(error.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleToggleSubscription = async (channelId: string) => {
    setUnsubscribingId(channelId);
    try {
      await toggleSubscription(channelId);
      toast.success("Unsubscribed successfully");
      setSubscriptions((prev) =>
        prev.filter((sub) => sub.channel._id !== channelId)
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to unsubscribe");
    } finally {
      setUnsubscribingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage the {subscriptions.length} channel
            {subscriptions.length !== 1 ? "s" : ""} you follow
          </p>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <div className="flex h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-12 text-center">
          <div className="bg-primary/10 mb-4 rounded-full p-4">
            <Users className="text-primary h-12 w-12" />
          </div>
          <h2 className="text-2xl font-semibold">No subscriptions yet</h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-sm">
            Discover some amazing creators and follow them to see their latest
            videos here!
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Explore Channels</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {subscriptions.map((sub) => (
            <Card
              key={sub._id}
              className="overflow-hidden bg-card/50 transition-all hover:bg-card hover:shadow-md"
            >
              <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row">
                <Link
                  href={`/profile/${sub.channel.userName}`}
                  className="shrink-0"
                >
                  <Avatar className="h-20 w-20 ring-2 ring-primary/10 ring-offset-2 transition-transform hover:scale-105">
                    <AvatarImage
                      src={sub.channel.avatar}
                      alt={sub.channel.userName}
                    />
                    <AvatarFallback>
                      {sub.channel.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div className="flex flex-1 flex-col text-center sm:text-left">
                  <Link href={`/profile/${sub.channel.userName}`}>
                    <h3 className="text-xl font-bold transition-colors hover:text-primary leading-tight">
                      {sub.channel.fullName}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground mt-0.5 font-medium">
                    @{sub.channel.userName}
                  </p>

                  <div className="mt-3 flex items-center justify-center gap-4 text-sm font-medium text-muted-foreground sm:justify-start">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>{sub.channel.subscriberCount} subscribers</span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center">
                  <Button
                    variant="secondary"
                    className="group"
                    onClick={() => handleToggleSubscription(sub.channel._id)}
                    disabled={unsubscribingId === sub.channel._id}
                  >
                    {unsubscribingId === sub.channel._id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserMinus className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    )}
                    Unsubscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
