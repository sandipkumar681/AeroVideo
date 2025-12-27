"use client";

import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/constant";
import { useAppSelector } from "@/redux-toolkit/hooks";
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
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  ArrowLeft,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

type ResetStep = "EMAIL" | "OTP" | "SUCCESS";

export default function ResetPasswordForm() {
  const [step, setStep] = useState<ResetStep>("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAppSelector(
    (state: any) => state.logInReducer
  );

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isLoading, router]);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Check if user exists
      const checkResponse = await fetch(`${BACKEND_URL}/users/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const checkResult = await checkResponse.json();

      if (!checkResponse.ok) {
        throw new Error(checkResult.message || "Email not found");
      }

      // 2. Send OTP
      const mailResponse = await fetch(`${BACKEND_URL}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ToCreateProfile: false }),
      });
      const mailResult = await mailResponse.json();

      if (!mailResponse.ok) {
        throw new Error(mailResult.message || "Failed to send OTP");
      }

      setStep("OTP");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Reset failed");
      }

      setStep("SUCCESS");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (step === "SUCCESS") {
    return (
      <Card className="w-full max-w-md border-none shadow-2xl bg-card/40 backdrop-blur-xl animate-in zoom-in-95 duration-500">
        <CardContent className="pt-10 pb-10 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/20 text-primary">
              <CheckCircle2 className="h-12 w-12" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Password Reset!</h2>
            <p className="text-muted-foreground">
              Your password has been successfully updated. You can now log in
              with your new credentials.
            </p>
          </div>
          <Button className="w-full" asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-none shadow-2xl bg-card/40 backdrop-blur-xl transition-all duration-500">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        </div>
        <CardDescription>
          {step === "EMAIL"
            ? "Enter your email to receive a password reset OTP."
            : `Enter the code sent to ${email} and your new password.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {step === "EMAIL" ? (
          <form onSubmit={handleCheckEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 bg-background/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="otp"
                  placeholder="Enter 6-digit code"
                  className="pl-10 bg-background/50"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-background/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
            <Button
              variant="ghost"
              type="button"
              className="w-full text-xs text-muted-foreground"
              onClick={() => setStep("EMAIL")}
            >
              Wrong email? Change it here
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="justify-center border-t border-border/50 pt-4 mt-2">
        <p className="text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Log In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
