import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";
import { BASE_HEAD_TITLE } from "@/lib/constants";
import { handleSessionRedirect } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/_auth/_auth/forgot')({
  beforeLoad: async () => await handleSessionRedirect(),
  head: () => ({
    meta: [
      {
        name: "title",
        content: `${BASE_HEAD_TITLE} Forgot Password`,
      },
      {
        name: "description",
        content: "Forgot your password on Rollup AI",
      },
    ],
  }),
  component: ForgotPasswordForm,
})
