"use client"

import { Link, useRouterState } from "@tanstack/react-router"
import authClient from "@/lib/authClient";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import NavTrigger from "./NavTrigger";
import { matchRoutesType } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ToggleTheme";
import { useMediaQuery } from "@/components/hooks/useMediaQuery";
import UploadVideoButton from "@/components/navbar/UploadVideoButton";

export default function Navbar() {
  const pathname = useRouterState({ select: (state) => state }).location.pathname;
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { data, isLoading } = useQuery({
    queryKey: ["getSession"],
    queryFn: () => authClient.getSession(),
  });

  const session = data?.data?.session;
  const user = data?.data?.user;

  return (
    <header className={cn(
      "sticky top-4 z-50 w-full",
      matchRoutesType(pathname, "Auth") && "fixed"
    )}>
      <div className="container mx-auto px-4 sm:px-0">
        <div className="h-14 rounded-xl border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {!isMobile && !user && <ModeToggle session={session} />}
            <Link to="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                R
              </div>
              <span className="font-bold inline-block">RollUp <span className="text-fuchsia-600">AI</span></span>
            </Link>
            {session && user && (
              <Badge variant="secondary" className="text-xs">
                Pro Tier
              </Badge>
            )}
          </div>

          {/* Profile and subscription or Auth buttons */}
          <div className="flex items-center gap-2 md:gap-4">
            {isMobile && !user && <ModeToggle session={session} />}
            <UploadVideoButton isMobile={isMobile} isAuthenticated={!!user} />
            <NavTrigger
              user={user}
              pathname={pathname}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
