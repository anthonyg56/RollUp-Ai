import authClient from '@/lib/authClient'
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
    const { data, error } = await getSession();

    if (data === null || error) {
      throw redirect({
        to: '/login',
        search: {
          showToast: true,
          toastReason: 'You must be logged in to access this page.'
        }
      });
    };

    const { user, session } = data;

    if (user.emailVerified === false) {
      throw redirect({ to: '/verify' });
    } else if (user.showOnboardingSurvey === true) {
      throw redirect({ to: '/survey' })
    }

    return {
      user: user,
      session: session,
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
