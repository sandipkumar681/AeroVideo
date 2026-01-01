"use client";

import Link from "next/link";
import { Search, Upload, User, Video, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileSidebar } from "@/components/MobileSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSelector, useAppDispatch } from "@/redux-toolkit/hooks";
import { logout } from "@/features/LoginSlice";
import { toggleSideBar } from "@/features/SideBarSlice";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useAppDispatch();
  const { isLoggedIn, userDetails } = useAppSelector(
    (state) => state.logInReducer
  );

  const handleLogout = async () => {
    await dispatch(logout());
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSideBar());
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center px-4">
        {/* Left: Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          <MobileSidebar />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleSidebar}
            className="hidden lg:flex"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-primary p-1 rounded-md">
              <Video className="text-primary-foreground h-5 w-5" />
            </div>
            <span className="hidden sm:inline-block">AeroVideo</span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 flex justify-center mx-4">
          <form
            onSubmit={handleSearch}
            className="w-full max-w-xl flex items-center"
          >
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 rounded-full bg-secondary border-none focus-visible:ring-1"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full rounded-r-full px-3 hover:bg-transparent"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isLoggedIn ? (
            <>
              <Link href="/upload-video">
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <Upload className="h-5 w-5" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={userDetails?.avatar || ""}
                        alt={userDetails?.userName || "User"}
                      />
                      <AvatarFallback>
                        {userDetails?.userName?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userDetails?.fullName || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userDetails?.email || "user@example.com"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/studio">Studio</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="rounded-full gap-2 text-primary border-border/60 hover:bg-primary/5"
                asChild
              >
                <Link href="/login">
                  <User className="h-4 w-4" />
                  Sign in
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
