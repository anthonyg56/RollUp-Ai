import type { HonoUser } from "@server/types";
import UnauthenticatedTrigger from "@/components/navbar/DesktopTrigger/UnauthenticatedTrigger";
import AuthenticatedTrigger from "@/components/navbar/DesktopTrigger/AuthenticatedTrigger";
import TriggerSkeleton from "@/components/navbar/DesktopTrigger/TriggerSkeleton";

interface IUnauthenticatedTriggerProps {
  user?: HonoUser;
  isLoading: boolean;
  handleLogout: () => void;
}

export default function DesktopNavbarTrigger({ user, isLoading, handleLogout }: IUnauthenticatedTriggerProps) {
  if (isLoading)
    return <TriggerSkeleton />
  else if (!user)
    return <UnauthenticatedTrigger />
  else
    return (
      <AuthenticatedTrigger
        user={user}
        handleLogout={handleLogout}
      />
    )
}