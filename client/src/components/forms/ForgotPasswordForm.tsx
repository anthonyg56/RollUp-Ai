import { useAppForm } from "@/hooks/useFormApp";
import { emailSchema } from "@/lib/schemas/base";

import { z } from "zod";
import AuthCardFooter from "../AuthCardFooter";
import { useMutation } from "@tanstack/react-query";
import authClient from "@/lib/authClient";
import { useNavigate } from "@tanstack/react-router";

const { emailOtp } = authClient
const forgotPasswordFormSchema = z.object({
  email: emailSchema,
});

export default function ForgotPasswordForm() {
  const navigate = useNavigate({ from: "/forgot" });

  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: forgotPasswordFormSchema,
    },
    onSubmit: async ({ value }) => await mutateAsync({ email: value.email }),
  });

  const { mutateAsync, isPending, isSuccess, isError, failureReason } = useMutation({
    mutationFn: async (data: { email: string }) => {
      const { data: response, error } = await emailOtp.sendVerificationOtp({
        email: data.email,
        type: "forget-password",
      });

      if (error) {
        throw new Error('Failed to reset password. Please try again.');
      } else if (response.success === false) {
        throw new Error('Failed to reset password. Please try again.');
      }

      return response;
    },
    onSuccess: (data) => {
      if (data.success === true) {
        navigate({
          to: "/verify",
          search: {
            type: "forget-password",
          }
        });
      } else {
        throw new Error('Failed to reset password. Please try again.');
      }
    },
  });

  const disableForm = isPending || isSuccess

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        form.handleSubmit();
      }}
      aria-disabled={disableForm}
    >
      {isError && failureReason && (
        <div className="text-red-500">
          {failureReason.message}
        </div>
      )}
      <div className="grid gap-6">
        <form.AppField
          name="email"
          children={field => (
            <field.TextField
              id="email"
              name="email"
              type="email"
              label="Email Address"
              disabled={disableForm}
              singleError={true}
            />
          )}
        />

        <form.AppForm>
          <form.SubmitButton label="Reset Password" />
        </form.AppForm>

        <AuthCardFooter />
      </div>
    </form>
  )
}
