"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Compass,
  Library,
  History,
  PlaySquare,
  ThumbsUp,
  Settings,
  HelpCircle,
  Flag,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onLinkClick?: () => void;
}

export function Sidebar({ className, onLinkClick }: SidebarProps) {
  const pathname = usePathname();

  const mainLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Subscriptions", href: "/subscriptions", icon: PlaySquare },
  ];

  const libraryLinks = [
    { name: "History", href: "/history", icon: History },
    { name: "Your Videos", href: "/studio", icon: PlaySquare },
    { name: "Liked Videos", href: "/liked-videos", icon: ThumbsUp },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div
      className={cn(
        "pb-12 h-full border-r bg-background text-foreground",
        className
      )}
    >
      <ScrollArea className="h-full py-4">
        {/* Main Section */}
        <div className="px-3 py-2">
          <div className="space-y-1">
            {mainLinks.map((link) => (
              <Button
                key={link.href}
                variant={pathname === link.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === link.href && "font-semibold"
                )}
                asChild
              >
                <Link href={link.href} onClick={onLinkClick}>
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-2" />

        {/* Library Section */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            You
          </h2>
          <div className="space-y-1">
            {libraryLinks.map((link) => (
              <Button
                key={link.href}
                variant={pathname === link.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={link.href} onClick={onLinkClick}>
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4 px-7 text-xs text-muted-foreground">
          <p>© 2025 AeroVideo</p>
        </div>
      </ScrollArea>
    </div>
  );
}
