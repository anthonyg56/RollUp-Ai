import { LogOut } from "lucide-react"

import { Separator } from "@/components/ui/separator"

import { ArrowLeft } from "lucide-react"

import { Link } from "@tanstack/react-router"

import { Sun, Moon, MessageSquare, User } from "lucide-react"
import { Theme } from "@/lib/contexts"

interface UserControlPanelProps {
  theme: Theme;
  toggleTheme: () => void;
  setOpen: (open: boolean) => void;
  handleLogout: () => void;
  isProtectedRoute: boolean;
}

export default function AuthenticatedDrawerContent({
  theme,
  toggleTheme,
  setOpen,
  handleLogout,
  isProtectedRoute
}: UserControlPanelProps) {
  return (
    <div className="flex flex-col">
      <div
        // to="/profile"
        className="flex items-center gap-3 rounded-md px-4 py-3 text-sm hover:bg-accent"
        onClick={() => setOpen(false)}
      >
        <User className="h-4 w-4" />
        <span>View Profile</span>
      </div>

      <div
        // to="/account"
        className="flex items-center gap-3 rounded-md px-4 py-3 text-sm hover:bg-accent"
        onClick={() => setOpen(false)}
      >
        <User className="h-4 w-4" />
        <span>Manage Account</span>
      </div>

      <div
        // to="/feedback"
        className="flex items-center gap-3 rounded-md px-4 py-3 text-sm hover:bg-accent"
        onClick={() => setOpen(false)}
      >
        <MessageSquare className="h-4 w-4" />
        <span>Submit Feedback</span>
      </div>

      <div className="flex items-center justify-start gap-3 rounded-md px-4 py-3 text-sm hover:bg-accent" onClick={toggleTheme}>
        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <span>Switch to {theme === "light" ? "Dark" : "Light"} Mode</span>

      </div>

      <Link
        to={isProtectedRoute ? "/" : "/videos"}
        className="flex items-center gap-3 rounded-md px-4 py-3 text-sm hover:bg-accent"
        onClick={() => setOpen(false)}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to {isProtectedRoute ? "Website" : "App"}</span>
      </Link>

      <Separator className="my-2" />

      <button
        className="flex items-center gap-3 rounded-md px-4 py-3 text-sm text-destructive hover:bg-destructive/10"
        onClick={() => {
          handleLogout()
          setOpen(false)
        }}
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </button>
    </div>
  )
}
