"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
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
        <div className="flex min-h-screen flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-4xl font-bold">Something went wrong!</h2>
          <p className="text-muted-foreground">
            A critical error occurred. Please try again.
          </p>
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
