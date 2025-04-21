import RegisterForm from "@/components/forms/RegisterForm";
import { BASE_HEAD_TITLE } from "@/lib/constants";
import { handleSessionRedirect } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/_auth/_auth/register')({
  beforeLoad: async () => await handleSessionRedirect(),
  head: () => ({
    meta: [
      {
        name: "title",
        content: `${BASE_HEAD_TITLE} Register`,
      },
      {
        name: "description",
        content: "Register for an account on Rollup AI",
      },
    ],
  }),
  component: RegisterForm,
})