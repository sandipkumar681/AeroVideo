"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux-toolkit/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  changeAccountDetailsBody,
  changeCurrentPasswordBody,
} from "@servicely/types";
import {
  updateAvatar,
  updateCoverImage,
  updateAccountDetails,
  changePassword,
} from "@/lib/api/userApi";
import { checkAuth } from "@/features/LoginSlice";
import { useRouter } from "next/navigation";
import {
  changeCurrentPasswordSchema,
  changeAccountDetailsSchema,
} from "@servicely/schemas";

export default function ProfileContent() {
  const dispatch = useAppDispatch();
  const { userDetails, isLoading, isLoggedIn } = useAppSelector(
    (state) => state.logInReducer
  );
  const router = useRouter();

  // Form states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState<changeAccountDetailsBody>({
    fullName: userDetails?.fullName || "",
    userName: userDetails?.userName || "",
  });

  const [passwordData, setPasswordData] = useState<changeCurrentPasswordBody>({
    oldPassword: "",
    newPassword: "",
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [avatarPreview, setAvatarPreview] = useState(userDetails?.avatar || "");
  const [coverPreview, setCoverPreview] = useState(
    userDetails?.coverImage || ""
  );

  useEffect(() => {
    if (!isLoading && !isLoggedIn && !userDetails) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, userDetails, router]);

  useEffect(() => {
    if (userDetails) {
      setProfileData({
        fullName: userDetails.fullName || "",
        userName: userDetails.userName || "",
      });
      if (userDetails.avatar) {
        setAvatarPreview(userDetails.avatar);
      }
      if (userDetails.coverImage) {
        setCoverPreview(userDetails.coverImage);
      }
    }
  }, [userDetails]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        toast.error("Avatar size should be less than 8MB");
        e.target.value = "";
        return;
      }
      // Auto-upload avatar
      await uploadAvatarLocal(file);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        toast.error("Cover image size should be less than 8MB");
        e.target.value = "";
        return;
      }
      // Auto-upload cover image
      await uploadCoverImageLocal(file);
    }
  };

  const uploadAvatarLocal = async (file: File) => {
    setLoading(true);

    try {
      await updateAvatar(file);
      toast.success("Avatar updated successfully!");
      dispatch(checkAuth());
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update avatar"
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadCoverImageLocal = async (file: File) => {
    setLoading(true);

    try {
      await updateCoverImage(file);
      toast.success("Cover image updated successfully!");
      dispatch(checkAuth());
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update cover image"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    if (!isEditingProfile) {
      return;
    }
    e.preventDefault();
    setLoading(true);

    const { error: validationError } =
      changeAccountDetailsSchema.validate(profileData);
    if (validationError) {
      toast.error(validationError.message);
      setLoading(false);
      return;
    }

    try {
      await updateAccountDetails(profileData);
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
      dispatch(checkAuth()); // Refresh user data
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (passwordData.newPassword !== confirmNewPassword) {
      toast.error("New password and confirm password do not match");
      setLoading(false);
      return;
    }

    const { error: validationError } =
      changeCurrentPasswordSchema.validate(passwordData);
    if (validationError) {
      toast.error(validationError.message);
      setLoading(false);
      return;
    }

    try {
      await changePassword(passwordData);
      toast.success("Password changed successfully!");
      setPasswordData({ oldPassword: "", newPassword: "" });
      setConfirmNewPassword("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      {/* Cover Image Section */}
      <Card className="overflow-hidden">
        <div className="relative h-48 bg-linear-to-r from-primary/20 to-primary/10">
          {coverPreview && (
            <img
              src={coverPreview}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 transition-all">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          )}
          <label
            htmlFor="cover-upload"
            className="absolute bottom-4 right-4 cursor-pointer z-20"
          >
            <Button variant="secondary" size="sm" asChild disabled={loading}>
              <span>
                <Camera className="h-4 w-4 mr-2" />
                Change Cover
              </span>
            </Button>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
              disabled={loading}
            />
          </label>
        </div>

        {/* Avatar Section */}
        <div className="px-6 pb-6">
          <div className="relative -mt-16 mb-4">
            <div className="relative inline-block">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={avatarPreview} alt={userDetails?.userName} />
                <AvatarFallback className="text-4xl">
                  {userDetails?.userName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 cursor-pointer z-20"
            >
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                asChild
                disabled={loading}
              >
                <span>
                  <Camera className="h-4 w-4" />
                </span>
              </Button>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={loading}
              />
            </label>
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              {userDetails?.fullName || "User"}
            </h1>
            <p className="text-muted-foreground">
              @{userDetails?.userName || "username"}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs for Profile and Password */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Details</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account details and personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    disabled={!isEditingProfile || loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userName">Username</Label>
                  <Input
                    id="userName"
                    name="userName"
                    value={profileData.userName}
                    onChange={handleProfileChange}
                    disabled={!isEditingProfile || loading}
                  />
                </div>

                <div className="flex gap-2">
                  {!isEditingProfile ? (
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsEditingProfile(true);
                      }}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileData({
                            fullName: userDetails?.fullName || "",
                            userName: userDetails?.userName || "",
                          });
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="oldPassword"
                      name="oldPassword"
                      type={showOldPassword ? "text" : "password"}
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className="pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      type="text"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="pr-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
