"use client";

import * as React from "react";

/**
 * VisuallyHidden component for accessibility
 * Hides content visually while keeping it accessible to screen readers
 */
export const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ children, ...props }, ref) => (
  <span
    ref={ref}
    className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
    style={{
      clip: "rect(0, 0, 0, 0)",
      clipPath: "inset(50%)",
    }}
    {...props}
  >
    {children}
  </span>
));

VisuallyHidden.displayName = "VisuallyHidden";
