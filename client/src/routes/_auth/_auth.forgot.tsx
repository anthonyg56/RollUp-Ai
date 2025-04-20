import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";
import { handleSessionRedirect } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/_auth/_auth/forgot')({
  beforeLoad: async () => await handleSessionRedirect(),
  component: ForgotPasswordForm,
})
