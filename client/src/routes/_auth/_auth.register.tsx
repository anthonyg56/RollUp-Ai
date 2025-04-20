import RegisterForm from "@/components/forms/RegisterForm";
import { handleSessionRedirect } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/_auth/_auth/register')({
  beforeLoad: async () => await handleSessionRedirect(),
  component: RegisterForm,
})