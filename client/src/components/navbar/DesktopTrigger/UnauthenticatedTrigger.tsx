import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export default function UnauthenticatedTrigger() {
  return (
    <div className="hidden md:flex items-center gap-4">
      <Button
        asChild
        variant="outline"
        className="hidden md:inline-block"
      >
        <Link to="/login">Login</Link>
      </Button>
      <Button asChild>
        <Link to="/register">Join Now</Link>
      </Button>
    </div>
  )
}
