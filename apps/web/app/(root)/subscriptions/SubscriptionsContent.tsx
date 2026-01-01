"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux-toolkit/hooks";
import { useRouter } from "next/navigation";
import {
  getSubscribedChannels,
  SubscribedChannel,
} from "@/lib/api/subscriptionApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function SubscriptionsContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { userDetails, isLoading, isLoggedIn } = useAppSelector(
    (state) => state.logInReducer
  );

  const [channels, setChannels] = useState<SubscribedChannel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLoggedIn && !userDetails) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, userDetails, router]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        if (isLoggedIn) {
          const data = await getSubscribedChannels();
          setChannels(data);
        }
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
        toast.error("Failed to load subscriptions");
      } finally {
        setLoadingChannels(false);
      }
    };

    if (isLoggedIn) {
      fetchChannels();
    } else if (!isLoading) {
      // If not loading and not logged in, stop loading channels (useEffect above handles redirect)
      setLoadingChannels(false);
    }
  }, [isLoggedIn, isLoading]);

  if (isLoading || loadingChannels) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <Users className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">No subscriptions yet</h2>
        <p className="text-muted-foreground max-w-sm">
          Subscribe to your favorite creators to see them here.
        </p>
        <Button asChild>
          <Link href="/">Explore Videos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Subscriptions</h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {channels.map((sub) => (
          <Link
            key={sub._id}
            href={`/channel/${sub.channel.userName}`}
            className="block"
          >
            <Card className="h-full hover:bg-accent/5 transition-colors">
              <CardContent className="flex flex-col items-center p-6 text-center space-y-4">
                <Avatar className="w-24 h-24 border-2 border-border">
                  <AvatarImage
                    src={sub.channel.avatar}
                    alt={sub.channel.userName}
                  />
                  <AvatarFallback className="text-2xl">
                    {sub.channel.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 w-full overflow-hidden">
                  <h3
                    className="font-semibold truncate"
                    title={sub.channel.fullName}
                  >
                    {sub.channel.fullName}
                  </h3>
                  <p
                    className="text-sm text-muted-foreground truncate"
                    title={`@${sub.channel.userName}`}
                  >
                    @{sub.channel.userName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sub.channel.subscriberCount} subscribers
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
