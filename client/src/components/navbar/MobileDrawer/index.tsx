"use client"

import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet"
import { useRouterState } from "@tanstack/react-router"
import { PROTECTED_ROUTES, ProtectedRoute } from "@/lib/constants"
import { useTheme } from "@/hooks/useTheme"
import { capitalizeFirstLetter, cn } from "@/lib/utils"
import AuthenticatedDrawerContent from "./AuthenticatedContent"
import DrawerUnAuthenticatedContent from "./UnauthenticatedContent"
import MobileDrawerTrigger from "./DrawerTrigger"
import type { HonoUser } from "@server/types"
import { Separator } from "@/components/ui/separator"

interface MobileDrawerProps {
  user?: HonoUser;
  handleLogout: () => void;
}

export function MobileDrawer({ user, handleLogout }: MobileDrawerProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isProtectedRoute = PROTECTED_ROUTES.includes(pathname as ProtectedRoute);

  function handleThemeToggle() {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const capitalizedName = capitalizeFirstLetter(user?.name || "")
  const capitalizedEmail = capitalizeFirstLetter(user?.email || "")

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <MobileDrawerTrigger user={user} setOpen={setOpen} />
      </SheetTrigger>
      <SheetContent side="bottom" className={cn(["h-[55vh] rounded-t-xl px-0 gap-y-0", {
        "h-[30vh]": !user,
        "h-[45vh]": user,
      }])}>
        <SheetHeader className="px-4 pb-0">
          {user ? (
            <div className="flex items-center space-x-4 py-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image || ""} alt={capitalizedName} />
                <AvatarFallback>{capitalizedName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium">{capitalizedName}</p>
                <p className="text-xs text-muted-foreground">{capitalizedEmail}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">Navigation Menu</h2>
              <p className="text-sm text-muted-foreground">Explore all the features of RollUp Ai</p>
            </div>
          )}
        </SheetHeader>

        <Separator className="my-2" />

        <div className="px-2">
          {user ? (
            <AuthenticatedDrawerContent
              theme={theme}
              setOpen={setOpen}
              handleLogout={handleLogout}
              toggleTheme={handleThemeToggle}
              isProtectedRoute={isProtectedRoute}
            />
          ) : (
            <DrawerUnAuthenticatedContent setOpen={setOpen} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}