import authClient from '@server/auth/authClient'
import { createFileRoute, Outlet, redirect, stripSearchParams } from '@tanstack/react-router'
import { toast } from 'sonner';
import { useEffect } from 'react';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';
import { fallback } from '@tanstack/zod-adapter';

const { getSession } = authClient;

export const Route = createFileRoute('/_protected/_protected')({
  validateSearch: zodValidator(
    z.object({
      redirect: fallback(z.string(), "").default(""),
    })
  ),
  beforeLoad: async () => {
    try {
      const session = await getSession()

      if (session.data && session.data.user) {
        if (session.data.user.emailVerified === false) {
          throw redirect({ to: '/verify' })
        } else if (session.data.user.showOnboardingSurvey === true) {
          throw redirect({ to: '/survey' })
        }
      }

      return {
        user: session.data?.user,
        session: session.data?.session,
      }
    } catch (error) {
      console.error(error)
    }
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const { redirect } = Route.useSearch();

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    function displayToast() {
      switch (redirect) {
        case "Login":
          timerId = setTimeout(() => {
            toast.success("Welcome Back!", {
              duration: 5000,
              description: "You've been logged in successfully.",
            });
          });
          stripSearchParams({})
          break;
        default:
          break;
      }
    }
    if (redirect !== "") {
      displayToast();
    }

    return () => clearTimeout(timerId);
  }, [redirect]);

  return (
    <div className="">
      <Outlet />
    </div>
  )
}
