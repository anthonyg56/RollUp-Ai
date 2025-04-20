import { createFileRoute, redirect } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { otpTypeSchema } from "@/lib/schemas/base";
import { z } from "zod";
import VerifyOTPForm from "@/components/forms/VerifyOTPForm";
import authClient from "@server/auth/authClient";
import { api } from "@/lib/utils";

const { getSession, emailOtp } = authClient;

export const Route = createFileRoute('/_auth/_auth/verify')({
  validateSearch: zodValidator(
    z.object({
      email: fallback(z.string(), "").default(""),
      type: fallback(otpTypeSchema, "email-verification")
        .default("email-verification"),
    })
  ),
  beforeLoad: async ({ search }) => {
    const { data } = await getSession();

    if (!data && search.email === "") {
      throw redirect({
        to: "/login",
        search: {
          showToast: true,
          toastReason: "Account Not Found",
        },
      });
    } else if (data && data.user.emailVerified) {
      throw redirect({ to: "/videos" });
    } else if (search.type === "email-verification") {

      try {
        const response = await api.users.email[":email"].$get({
          param: {
            email: search.email,
          },
        });

        if (response.status === 200) {
          const { data: responseData } = await response.json();
          const { user } = responseData;

          if (user.emailVerified) {
            throw redirect({ to: "/videos" });
          }

          await emailOtp.sendVerificationOtp({
            email: search.email,
            type: search.type,
          });
        }

        throw redirect({
          to: "/login",
          search: {
            showToast: true,
            toastReason: "Account Not Found",
          },
        });
      } catch (error) {
        console.error(error);
        throw redirect({
          to: "/login",
          search: { showToast: true, toastReason: "Account Not Found" },
        });
      }
    }
  },
  component: VerifyOTPForm,
});
