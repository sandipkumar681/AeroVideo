"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Save, ArrowLeft, Video as VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BACKEND_URL } from "@/constant";
import Link from "next/link";
import { useAppSelector } from "@/redux-toolkit/hooks";
import { toast } from "sonner";

interface VideoDetails {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  isPublished: boolean;
  owner: string | { _id: string };
}

export default function EditVideoContent() {
  const router = useRouter();
  const { id } = useParams();
  const {
    userDetails,
    isLoading: authLoading,
    isLoggedIn,
  } = useAppSelector((state) => state.logInReducer);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isLoggedIn && !userDetails) {
      router.push("/login");
    }
  }, [authLoading, isLoggedIn, userDetails, router]);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/videos/${id}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch video details");
        const data = await response.json();

        // Check ownership
        const ownerId =
          typeof data.data.owner === "string"
            ? data.data.owner
            : data.data.owner?._id;

        if (ownerId !== userDetails?._id) {
          setError("You don't have permission to edit this video");
          return;
        }

        setVideo(data.data);
        setTitle(data.data.title);
        setDescription(data.data.description);
        setIsPublished(data.data.isPublished);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id && isLoggedIn && userDetails) fetchVideoDetails();
  }, [id, isLoggedIn, userDetails]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/videos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, isPublished }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to update video");

      toast.success("Video updated successfully!");
      router.push("/studio");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update video"
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
        <p className="text-destructive text-lg font-semibold">
          {error || "Video not found"}
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/studio">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Video</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/video/${id}`}>View Video</Link>
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-card/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
              <CardDescription>Update your video information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ente video title"
                    className="bg-background/50"
                    required
                    minLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter video description"
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                    minLength={10}
                  />
                </div>
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/30">
                    <div className="space-y-0.5">
                      <Label htmlFor="visibility" className="text-base">
                        Visibility
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {isPublished
                          ? "Your video is public and searchable."
                          : "Your video is private and only visible to you."}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={isPublished ? "default" : "secondary"}
                      className={`relative w-14 h-7 rounded-full transition-colors duration-300 p-1 ${
                        isPublished ? "bg-primary" : "bg-muted"
                      }`}
                      onClick={() => setIsPublished(!isPublished)}
                    >
                      <div
                        className={`absolute top-1 bottom-1 w-5 bg-white rounded-full transition-all duration-300 shadow-sm ${
                          isPublished ? "left-8" : "left-1"
                        }`}
                      />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="pb-3 text-sm font-medium">
              Video Preview
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-muted group cursor-default">
                <img
                  src={video.thumbnail}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <div className="p-3 rounded-full bg-primary/90 text-primary-foreground shadow-xl scale-90 group-hover:scale-100 transition-transform">
                    <VideoIcon className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <p className="font-semibold line-clamp-2 text-sm">
                  {title || "Untitled Video"}
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isPublished ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {isPublished ? "Published" : "Draft"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-primary/5 border border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2 capitalize">
              <p>• Use a descriptive title to attract more viewers.</p>
              <p>• Add relevant keywords in your description.</p>
              <p>• Keep it engaging and concise.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
