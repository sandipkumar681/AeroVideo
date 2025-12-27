"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { loginUser } from "@/lib/api/userApi";
import { LoginBody } from "@servicely/types";
import { loginSchema } from "@servicely/schemas";
import { useAppSelector } from "@/redux-toolkit/hooks";

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginBody>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [navigateToHome, setNavigateToHome] = useState(false);
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
    if (navigateToHome) {
      router.push("/");
    }
  }, [navigateToHome, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error: validationError } = loginSchema.validate(formData);
    if (validationError) {
      toast.error(validationError.message);
      setLoading(false);
      return;
    }

    try {
      const result = await loginUser(formData);
      toast.success(result.message);
      setNavigateToHome(true);
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
        <CardTitle className="text-3xl font-bold text-center">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex justify-end">
            <Link
              href="/reset-password"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm opacity-70">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold hover:underline">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
