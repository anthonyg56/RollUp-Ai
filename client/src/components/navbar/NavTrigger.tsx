import { useMediaQuery } from "@/hooks/useMediaQuery";
import DesktopTrigger from "./DesktopTrigger";
import type { HonoUser } from "@server/types";
import { MobileDrawer } from "./MobileDrawer";
import authClient from "@server/auth/authClient";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { matchRoutesType } from "@/lib/utils";

const { signOut } = authClient;

interface INavTriggerProps {
  user?: HonoUser;
  pathname: string;
  isLoading: boolean;
}

export default function NavTrigger({ isLoading, user, pathname }: INavTriggerProps) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { queryClient } = useRouteContext({ from: "__root__" });

  function handleLogout() {
    if (matchRoutesType(pathname, "Protected")) {
      signOut({
        fetchOptions: {
          onSuccess: () => {
            navigate({ to: "/login", search: { showToast: true, toastReason: "Logout" } });
            queryClient.invalidateQueries({ queryKey: ["getSession"] });
          }
        }
      })
    } else if (!matchRoutesType(pathname, "Auth")) {
      signOut({
        fetchOptions: {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getSession"] });
          }
        }
      })
    }
  };

  console.log(isMobile);

  if (matchRoutesType(pathname, "Auth") && !isMobile)
    return null;
  if (isMobile)
    return (
      <MobileDrawer
        user={user}
        handleLogout={handleLogout}
      />
    )
  else
    return (
      <DesktopTrigger
        user={user}
        isLoading={isLoading}
        handleLogout={handleLogout}
      />
    )
}