"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/redux-toolkit/hooks";
import { UploadVideoBody } from "@aerovideo/types";
import { uploadVideoSchema } from "@aerovideo/schemas";
import { BACKEND_URL } from "@/constant";

export default function UploadVideoForm() {
  const [formData, setFormData] = useState<UploadVideoBody>({
    title: "",
    description: "",
    isPublished: true,
    tag: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { isLoggedIn, isLoading } = useAppSelector(
    (state) => state.logInReducer
  );

  // Redirect if not logged in (though middleware/layout might handle this)
  if (!isLoggedIn && !isLoading) {
    router.push("/login");
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isPublished: !prev.isPublished }));
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = uploadVideoSchema.validate(formData);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!videoFile) {
      setError("Video file is required");
      setLoading(false);
      return;
    }

    if (!thumbnail) {
      setError("Thumbnail is required");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("isPublished", String(formData.isPublished));
      data.append("tag", formData.tag || "");
      data.append("videoFile", videoFile);
      data.append("thumbnail", thumbnail);
      const response = await fetch(`${BACKEND_URL}/videos/upload-video`, {
        method: "POST",
        body: data,
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to upload video");
      }

      setSuccess(result.message);
      // Reset form
      setFormData({
        title: "",
        description: "",
        isPublished: true,
        tag: "",
      });
      setVideoFile(null);
      setThumbnail(null);

      // Clear file inputs visually by resetting the form
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || "Failed to upload video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-sm border-primary/10">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Upload Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20 animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-primary/10 text-primary rounded-lg text-sm border border-primary/20 animate-in fade-in slide-in-from-top-1">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="videoFile">Video File</Label>
              <Input
                id="videoFile"
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, setVideoFile)}
                className="cursor-pointer file:text-primary hover:border-primary/50 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setThumbnail)}
                className="cursor-pointer file:text-primary hover:border-primary/50 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Bring your video to life with a catchy title"
                value={formData.title}
                onChange={handleChange}
                required
                className="focus-visible:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Tell your viewers what your video is about"
                value={formData.description}
                onChange={handleChange}
                required
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag">Tags (comma separated)</Label>
              <Input
                id="tag"
                name="tag"
                type="text"
                placeholder="music, gaming, tutorial"
                value={formData.tag}
                onChange={handleChange}
                className="focus-visible:ring-primary/50"
              />
            </div>

            <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-lg border border-primary/5">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished === true}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
              />
              <Label htmlFor="isPublished" className="cursor-pointer">
                Publish immediately
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 transition-all shadow-lg hover:shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading Magic...
                </>
              ) : (
                "Upload Video"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
