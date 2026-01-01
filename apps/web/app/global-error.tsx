"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import "./globals.css";
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-background">
          <div className="space-y-6 max-w-md">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full" />
                <AlertTriangle className="relative h-24 w-24 text-destructive animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-linear-to-r from-destructive to-destructive/60 bg-clip-text text-transparent">
                Something went wrong!
              </h1>
              <p className="text-muted-foreground">
                A critical error occurred. This might be due to a network issue
                or an unexpected problem.
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground/60 font-mono">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={() => reset()} size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
