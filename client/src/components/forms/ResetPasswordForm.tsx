import { useAppForm } from "@/hooks/useFormApp";
import { PASSWORD_REQUIREMENTS } from "@/lib/constants";
import { z } from "zod";
import { Route as ResetPasswordRoute } from "@/routes/_auth/_auth.reset";
import { useMutation } from "@tanstack/react-query";
import authClient from "@/lib/authClient";

const { emailOtp } = authClient;

const resetPasswordFormSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
})
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export default function ResetPasswordForm() {
  const { email } = ResetPasswordRoute.useLoaderData();
  const { otp } = ResetPasswordRoute.useSearch();

  const form = useAppForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: resetPasswordFormSchema,
    },
    onSubmit: async ({ value }) => await mutateAsync({ password: value.password, confirmPassword: value.confirmPassword }),
  });

  const { mutateAsync, isPending, isSuccess, isError, failureReason } = useMutation({
    mutationFn: async (data: { password: string, confirmPassword: string }) => {
      if (otp === "invalid_otp") {
        throw new Error('Invalid OTP. Please try again.');
      } else if (otp === "invalid_token") {
        throw new Error('Invalid token. Please try again.');
      };

      const res = await emailOtp.resetPassword({
        email,
        otp,
        password: data.password,
      });

      if (res.data?.success !== true) {
        throw new Error('Failed to reset password. Please try again.');
      };

      return res.data;
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
      <div className="flex flex-col gap-3">
        {isError && failureReason && (
          <div className="text-red-500">
            {failureReason.message}
          </div>
        )}
        <div className="grid gap-2">
          <form.AppField
            name="password"
            children={field => (
              <field.TextField
                id="password"
                name="password"
                type="password"
                label="Password"
                disabled={disableForm}
                tooltip={PASSWORD_REQUIREMENTS}
              />
            )}
          />

          <form.AppField
            name="confirmPassword"
            children={field => (
              <field.TextField
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                disabled={disableForm}
              />
            )}
          />
        </div>

        <form.AppForm>
          <form.SubmitButton label="Reset Password" submittingLabel="Resetting Password..." />
        </form.AppForm>
      </div>

    </form>
  )
};
