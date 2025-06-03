"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MessageCircle, Moon, Sun, User } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { ArrowLeftToLine, ChevronsUpDown, ExternalLink } from "lucide-react";
import { useTheme } from "@/components/hooks/useTheme";
import { capitalizeFirstLetter, matchRoutesType } from "@/lib/utils";
import { useDialogStore } from "@/components/hooks/useStores";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouterState } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import type { HonoUser } from "@server/types";

interface NavbarAvatarDropdownProps {
  user?: HonoUser;
  handleLogout: () => void;
}

export default function AuthenticatedTrigger({ user, handleLogout }: NavbarAvatarDropdownProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const openDialog = useDialogStore(state => state.open);
  const pathname = useRouterState({ select: (state) => state }).location.pathname;

  const capitalizedEmail = capitalizeFirstLetter(user?.email || "");
  const capitalizedName = capitalizeFirstLetter(user?.name || "");

  const isProtectedRoute = matchRoutesType(pathname, "Protected");
  const isAuthRoute = matchRoutesType(pathname, "Auth");

  function handleBackToPage() {
    if (isProtectedRoute) {
      navigate({ to: "/" });
    } else if (!isAuthRoute) {
      navigate({ to: "/videos" });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex flex-row items-center gap-2 hover:cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium">{capitalizedName}</span>
          </div>
          <Avatar className="h-9 w-9 rounded-md">
            <AvatarImage src={user?.image || undefined} alt="User avatar" className="rounded-md" />
            <AvatarFallback className="bg-secondary-foreground text-primary-foreground rounded-md">{capitalizedName.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        <ChevronsUpDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <UserAvatar
              name={capitalizedName}
              avatarUrl={user?.image || undefined}
              email={capitalizedEmail}
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{capitalizedName}</span>
              <span className="truncate text-xs">{capitalizedEmail}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openDialog("User Settings")}>
            <User className="size-4 mr-2" />
            <span>View Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openDialog("Submit Feedback")}>
            <MessageCircle className="size-4 mr-2" />
            <span>Submit Feedback</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? (
              <Sun className="size-4 mr-2" />
            ) : (
              <Moon className="size-4 mr-2" />
            )}
            <span>Switch to {theme === "dark" ? "Light" : "Dark"} Mode</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleBackToPage}>
            <ExternalLink className="size-4 mr-2" />
            <span>{isProtectedRoute ? "Back to Website" : "Back to Videos"}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleLogout}>
            <ArrowLeftToLine className="size-4 mr-2" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
