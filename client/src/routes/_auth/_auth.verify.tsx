import { createFileRoute, redirect } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { otpTypeSchema } from "@/lib/schemas/base";
import { z } from "zod";
import VerifyOTPForm from "@/components/forms/VerifyOTPForm";
import authClient from "@/lib/authClient";
import { api } from "@/lib/utils";
import { BASE_HEAD_TITLE } from "@/lib/constants";

const { getSession, emailOtp } = authClient;

export const Route = createFileRoute('/_auth/_auth/verify')({
  validateSearch: zodValidator(
    z.object({
      isLogin: fallback(z.boolean(), false).default(false),
      email: fallback(z.string(), "").default(""),
      type: fallback(otpTypeSchema, "email-verification")
        .default("email-verification"),
    })
  ),
  beforeLoad: async ({ search }) => {
    const { data } = await getSession();

    const isInvalid = !data && search.email === "";
    const isVerifiedUser = data && data.user.emailVerified === true && search.type === "email-verification";

    if (isInvalid)
      throw redirect({
        to: "/login",
        search: {
          showToast: true,
          toastReason: "Account Not Found",
        },
      });

    if (isVerifiedUser)
      throw redirect({ to: "/videos" });

    if (search.type === "email-verification") {
      const response = await api.users.verify[":email"].$get({
        param: {
          email: search.email,
        },
      })
        .catch(err => {
          console.log(err);
          throw redirect({
            to: "/login",
            search: {
              showToast: true,
              toastReason: "Account Not Found",
            },
          });
        });

      const { data: responseData } = await response.json();
      const { user } = responseData;

      if (user.emailVerified === true) {
        throw redirect({ to: "/videos" });
      };

      const isLogin = search.isLogin;

      if (isLogin) {
        await emailOtp.sendVerificationOtp({
          email: search.email,
          type: search.type,
        });
      }

      return
    }

    return
  },
  head: () => ({
    meta: [
      {
        name: "title",
        content: `${BASE_HEAD_TITLE} Verify Email`,
      },
      {
        name: "description",
        content: "Verify your email address on Rollup AI",
      },
    ],
  }),
  component: VerifyOTPForm,
});
