"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Play,
  Heart,
  MessageSquare,
  Eye,
  BarChart2,
  Video,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BACKEND_URL } from "@/constant";
import { useAppSelector } from "@/redux-toolkit/hooks";

interface ChannelStats {
  _id: string;
  fullName: string;
  userName: string;
  totalSubscribers: number;
  channelInfo?: {
    totalVideos: number;
    totalLikes: number;
    totalComments: number;
    totalViews: number;
  };
}

interface VideoMetadata {
  _id: string;
  title: string;
  thumbnail: string;
  views: number;
  duration: number;
  isPublished: boolean;
  createdAt: string;
  likes: number;
  comments: number;
}

export default function DashboardContent() {
  const router = useRouter();
  const [stats, setStats] = useState<ChannelStats | null>(null);
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isLoggedIn, isLoading, userDetails } = useAppSelector(
    (state) => state.logInReducer
  );

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, videosRes] = await Promise.all([
          fetch(`${BACKEND_URL}/dashboard/stats`, { credentials: "include" }),
          fetch(`${BACKEND_URL}/dashboard/videos`, { credentials: "include" }),
        ]);

        if (!statsRes.ok || !videosRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const statsData = await statsRes.json();
        const videosData = await videosRes.json();

        setStats(statsData.data);
        setVideos(videosData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleTogglePublish = async (videoId: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/videos/${videoId}/toggle-publish`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle publish status");
      }

      // Update local state
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId ? { ...v, isPublished: !v.isPublished } : v
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle status");
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this video? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/videos/${videoId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete video");
      }

      // Update local state
      setVideos((prev) => prev.filter((v) => v._id !== videoId));

      // Update stats if needed (optional, or just refresh stats)
      // fetchDashboardData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete video");
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count.toString();
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-destructive/10 text-destructive h-[80vh] w-full items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const overviewStats = [
    {
      label: "Total Views",
      value: formatCount(stats?.channelInfo?.totalViews || 0),
      icon: Eye,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Subscribers",
      value: formatCount(stats?.totalSubscribers || 0),
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Total Likes",
      value: formatCount(stats?.channelInfo?.totalLikes || 0),
      icon: Heart,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Videos",
      value: formatCount(stats?.channelInfo?.totalVideos || 0),
      icon: Play,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-primary/20 shadow-sm">
            <AvatarImage
              src={userDetails?.avatar}
              alt={userDetails?.userName}
            />
            <AvatarFallback className="text-xl md:text-2xl">
              {userDetails?.userName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {userDetails?.fullName}
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your channel today.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex">
            <BarChart2 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg"
          >
            <Link href="/upload-video">
              <Video className="h-4 w-4 mr-2" />
              Upload Video
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {overviewStats.map((stat, index) => (
          <Card
            key={index}
            className="border-none shadow-md bg-card/50 backdrop-blur-sm hover:scale-[1.02] transition-transform duration-300"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Videos Section */}
      <Card className="border-none shadow-xl overflow-hidden bg-card/40 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40">
          <div>
            <CardTitle className="text-xl">Your Videos</CardTitle>
            <CardDescription>
              Manage and track the performance of your uploads.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-muted/30">
              <tr className="border-b border-border/40">
                <th className="px-6 py-4 font-semibold text-sm">Video</th>
                <th className="px-6 py-4 font-semibold text-sm">Status</th>
                <th className="px-6 py-4 font-semibold text-sm">Date</th>
                <th className="px-6 py-4 font-semibold text-sm">Views</th>
                <th className="px-6 py-4 font-semibold text-sm">Feedback</th>
                <th className="px-6 py-4 font-semibold text-sm text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {videos.length > 0 ? (
                videos.map((video) => (
                  <tr
                    key={video._id}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-32 aspect-video rounded-lg overflow-hidden shrink-0 shadow-sm border border-border/20">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1 rounded font-medium">
                            {Math.floor(video.duration / 60)}:
                            {String(Math.floor(video.duration % 60)).padStart(
                              2,
                              "0"
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col max-w-[200px] md:max-w-[300px]">
                          <Link
                            href={`/video/${video._id}`}
                            className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors cursor-pointer"
                          >
                            {video.title}
                          </Link>
                          <span className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {video.title}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePublish(video._id)}
                          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left"
                        >
                          <div
                            className={`h-2 w-2 rounded-full ${
                              video.isPublished
                                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {video.isPublished ? "Published" : "Draft"}
                          </span>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(video.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {formatCount(video.views)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
                          <Heart className="h-4 w-4 text-red-500/70" />
                          <span>{formatCount(video.likes)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
                          <MessageSquare className="h-4 w-4 text-blue-500/70" />
                          <span>{formatCount(video.comments)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          asChild
                        >
                          <Link href={`/video/edit/${video._id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteVideo(video._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/video/${video._id}`}>
                                <Eye className="mr-2 h-4 w-4" /> View Video
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/video/edit/${video._id}`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteVideo(video._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Video
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Video className="w-12 h-12 opacity-20" />
                      <p className="text-lg">No videos uploaded yet</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Upload your first video
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Quick Tips or Analytics Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg bg-linear-to-br from-indigo-500/5 to-purple-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Creator Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Consistent uploading helps you grow faster. Try to maintain a
              schedule that works for you and your audience.
            </p>
            <Button variant="link" className="p-0 h-auto mt-4 text-primary">
              Learn more about growth
            </Button>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-linear-to-br from-emerald-500/5 to-teal-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            {videos.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="w-20 aspect-video rounded-md overflow-hidden shrink-0">
                  <img
                    src={videos[0].thumbnail}
                    alt="Top"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm line-clamp-1">
                    {videos[0].title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCount(videos[0].views)} views in{" "}
                    {formatCount(videos[0].comments)} comments
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Upload videos to see your top performing content here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
