"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { RegisterBody } from "@aerovideo/types";
import { registerSchema } from "@aerovideo/schemas";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { registerUser, sendOtp } from "@/lib/api/userApi";
import { useAppSelector } from "@/redux-toolkit/hooks";

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterBody>({
    fullName: "",
    userName: "",
    email: "",
    password: "",
    otp: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [navigateToLogin, setNavigateToLogin] = useState(false);
  const router = useRouter();

  const { isLoggedIn, isLoading } = useAppSelector(
    (state) => state.logInReducer
  );
  const redirectTo = "/";

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.push(redirectTo);
    }
  }, [isLoggedIn, isLoading, router, redirectTo]);

  useEffect(() => {
    if (navigateToLogin) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [navigateToLogin, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 8 * 1024 * 1024) {
        toast.error("File size should be less than 8MB");
        e.target.value = "";
        return;
      }
      setFile(file);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error("Email is required to send OTP");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setOtpLoading(true);

    try {
      const result = await sendOtp(formData.email);
      setOtpSent(true);
      toast.success(result.message);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to send OTP");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    const { error: validationError } = registerSchema.validate(formData);
    if (validationError) {
      toast.error(validationError.message);
      setLoading(false);
      return;
    }

    if (!avatar) {
      toast.error("Avatar is required");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (avatar) data.append("avatar", avatar);
      if (coverImage) data.append("coverImage", coverImage);

      const result = await registerUser(data);

      toast.success(result.message);
      setNavigateToLogin(true);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">
          Create Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userName">Username</Label>
            <Input
              id="userName"
              name="userName"
              type="text"
              placeholder="Username"
              value={formData.userName}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full mt-2 cursor-pointer"
              onClick={handleSendOtp}
              disabled={otpLoading || otpSent || !formData.email}
            >
              {otpLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : otpSent ? (
                "OTP Sent"
              ) : (
                "Send OTP"
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              name="otp"
              type="text"
              placeholder="OTP"
              value={formData.otp}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar</Label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setAvatar)}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image (Optional)</Label>
            <Input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setCoverImage)}
              className="cursor-pointer"
            />
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm opacity-70">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold hover:underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
