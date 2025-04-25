// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// import { capitalizeFirstLetter } from "@/lib/utils";
import { Menu } from "lucide-react";
import type { HonoUser } from "@server/types";

interface IMobileDrawerTriggerProps {
  user?: HonoUser;
  setOpen: (open: boolean) => void;
}

export default function MobileDrawerTrigger({ setOpen }: IMobileDrawerTriggerProps) {
  // if (!user)
  return (
    <Button variant="ghost" size="icon" onClick={() => setOpen(true)} >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open menu</span>
    </Button>
  );

  // const capitalizedName = capitalizeFirstLetter(user?.name || "")

  // return (
  //   <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
  //     <Avatar className="h-9 w-9 rounded-md">
  //       <AvatarImage src={user.image || ""} alt={capitalizedName} className="rounded-md " />
  //       <AvatarFallback className="rounded-md bg-secondary-foreground text-primary-foreground">{capitalizedName.charAt(0)}</AvatarFallback>
  //     </Avatar>
  //   </Button>
  // )
}
