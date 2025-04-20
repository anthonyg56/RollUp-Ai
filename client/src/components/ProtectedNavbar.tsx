"use client"

import { Link, useMatchRoute } from "@tanstack/react-router"
import NavbarAvatarDropdown from "./NavbarAvatarDropdown"
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useDialogStore } from "@/hooks/useStores";
import authClient from "@server/auth/authClient";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton"

export default function ProtectedNavbar() {
  const matchRoute = useMatchRoute()
  const openDialog = useDialogStore(state => state.open);

  const { data, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });

  const isAuthRoute =
    matchRoute({ to: "/login" })
    || matchRoute({ to: "/register" })
    || matchRoute({ to: "/forgot" })
    || matchRoute({ to: "/reset" })
    || matchRoute({ to: "/verify" })
    || matchRoute({ to: "/survey" });

  if (isAuthRoute) return null

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    openDialog("Upload New Video")
  };

  console.log(data)

  const session = data?.data?.session;
  const user = data?.data?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              R
            </div>
            <span className="hidden font-bold sm:inline-block">RollUp AI</span>
          </Link>
        </div>

        {/* Profile and subscription or Auth buttons */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-[110px]" /> {/* For "New Video" button */}
              <Skeleton className="h-8 w-8 rounded-full" /> {/* For avatar */}
            </>
          ) : session && user ? (
            <>
              <Button variant="outline" onClick={handleClick}>
                <Plus />
                New Video
              </Button>

              <NavbarAvatarDropdown
                name={user.name}
                email={user.email}
                avatarUrl={user.image ?? ""}
              />
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
