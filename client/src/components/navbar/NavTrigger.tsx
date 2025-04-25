import { useMediaQuery } from "@/hooks/useMediaQuery";
import DesktopTrigger from "./DesktopTrigger";
import type { HonoUser } from "@server/types";
import { MobileDrawer } from "./MobileDrawer";
import authClient from "@/lib/authClient";
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
            queryClient.invalidateQueries({ queryKey: ["getSession"] });
            navigate({ to: "/login", search: { showToast: true, toastReason: "Logout" } });
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
  else if (pathname === "/verify")
    return null;
  else if (isMobile)
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