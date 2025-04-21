import { Link } from "@tanstack/react-router";
import { LogIn, UserPlus, Home } from "lucide-react";

interface IDrawerUnAuthenticatedContentProps {
  setOpen: (open: boolean) => void;
}

export default function DrawerUnAuthenticatedContent({ setOpen }: IDrawerUnAuthenticatedContentProps) {
  return (
    <div className="flex flex-col">
      <Link
        to="/"
        className="flex items-center gap-3 rounded-md px-4 py-3 text-sm hover:bg-accent"
        onClick={() => setOpen(false)}
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </Link>

      <Link
        to="/login"
        className="flex items-center gap-3 rounded-md px-4 py-3 text-sm hover:bg-accent"
        onClick={() => setOpen(false)}
      >
        <LogIn className="h-4 w-4" />
        <span>Login</span>
      </Link>

      <Link
        to="/register"
        className="flex items-center gap-3 rounded-md px-4 py-3 text-sm hover:bg-accent"
        onClick={() => setOpen(false)}
      >
        <UserPlus className="h-4 w-4" />
        <span>Signup</span>
      </Link>
    </div>
  )
}
