"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MessageCircle, Moon, Sun, User } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { ArrowLeftToLine, ChevronsUpDown, ExternalLink } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useDialogStore } from "@/hooks/useStores";
import authClient from "@server/auth/authClient";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const { signOut } = authClient;

interface NavbarAvatarDropdownProps {
  name: string;
  email: string;
  avatarUrl: string;
}

export default function NavbarAvatarDropdown({ name, email, avatarUrl }: NavbarAvatarDropdownProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const openDialog = useDialogStore(state => state.open);

  const capitalizedEmail = capitalizeFirstLetter(email);
  const capitalizedName = capitalizeFirstLetter(name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex flex-row items-center gap-2 hover:cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium">{capitalizedName}</span>
            <Badge variant="secondary" className="text-xs">
              Pro Tier
            </Badge>
          </div>
          <Avatar>
            <AvatarImage src={avatarUrl} alt="User avatar" />
            <AvatarFallback>{capitalizedName.charAt(0)}</AvatarFallback>
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
              name={name}
              avatarUrl={avatarUrl}
              email={capitalizedEmail}
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{name}</span>
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
          <DropdownMenuItem onClick={() => navigate({ to: "/" })}>
            <ExternalLink className="size-4 mr-2" />
            <span>Back to Website</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => signOut({
            fetchOptions: {
              onSuccess: () => {
                navigate({ to: "/login", search: { showToast: true, toastReason: "Logout" } });
              }
            }
          })}>
            <ArrowLeftToLine className="size-4 mr-2" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
