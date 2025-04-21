import authClient from "@server/auth/authClient";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import ResetPasswordForm from "@/components/forms/ResetPasswordForm";
import { BASE_HEAD_TITLE } from "@/lib/constants";

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
  head: () => ({
    meta: [
      {
        name: "title",
        content: `${BASE_HEAD_TITLE} Reset Password`,
      },
      {
        name: "description",
        content: "Reset your password on Rollup AI",
      },
    ],
  }),
  component: ResetPasswordForm,
});


