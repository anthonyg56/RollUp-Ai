import LoginForm from "@/components/forms/LoginForm";
import { createFileRoute } from "@tanstack/react-router";
import { handleSessionRedirect } from "@/lib/utils";
import { z } from "zod";
import { fallback } from "@tanstack/zod-adapter";
import { zodValidator } from "@tanstack/zod-adapter";
import { toast } from "sonner";
import { useEffect } from "react";
import { BASE_HEAD_TITLE } from "@/lib/constants";

export const Route = createFileRoute('/_auth/_auth/login')({
  validateSearch: zodValidator(
    z.object({
      showToast: fallback(z.boolean(), false).default(false),
      toastReason: fallback(z.string(), "").default(""),
    })
  ),
  beforeLoad: async () => await handleSessionRedirect(),
  head: () => ({
    meta: [
      {
        name: "title",
        content: `${BASE_HEAD_TITLE} Login`,
      },
      {
        name: "description",
        content: "Login to your account on Rollup AI",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const { showToast, toastReason } = Route.useSearch();

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    function displayToast() {
      switch (toastReason) {
        case "Account Not Found":
          timerId = setTimeout(() => {
            toast.error(toastReason, {
              duration: 5000,
              description: "Please login with a valid account to continue.",
            });
          });
          break;
        case "Logout":
          timerId = setTimeout(() => {
            toast.success("Logged Out", {
              duration: 5000,
              description: "You've successfully been logged out.",
            });
          });
          break;
        default:
          break;
      }
    }
    if (showToast === true && toastReason !== "") {
      displayToast();
    }

    return () => clearTimeout(timerId);
  }, [showToast, toastReason]);

  return <LoginForm />
}