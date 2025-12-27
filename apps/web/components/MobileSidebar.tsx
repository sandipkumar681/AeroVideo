"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Video } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex flex-col w-72">
        <div className="flex items-center gap-4 px-4 h-16 border-b shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl"
            onClick={() => setOpen(false)}
          >
            <div className="bg-primary p-1 rounded-md">
              <Video className="text-primary-foreground h-5 w-5" />
            </div>
            <span>AeroVideo</span>
          </Link>
        </div>
        <Sidebar
          className="flex-1 border-r-0"
          onLinkClick={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
