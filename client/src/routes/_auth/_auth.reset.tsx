import authClient from "@server/auth/authClient";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import ResetPasswordForm from "@/components/forms/ResetPasswordForm";

const { getSession } = authClient

export const Route = createFileRoute('/_auth/_auth/reset')({
  validateSearch: zodValidator(z.object({
    otp: fallback(z.string(), "invalid_otp").default("invalid_otp"),
  })),
  beforeLoad: async () => {
    const session = await getSession()

    if (!session.data || (!session.data.user || !session.data.session)) {
      throw redirect({ to: '/login' });
    };

    return {
      email: session.data.user.email,
    }
  },
  loader: async ({ context }) => {
    return {
      email: context.email,
    }
  },
  component: ResetPasswordForm,
});


