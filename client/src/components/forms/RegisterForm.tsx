"use client";

import { useAppForm } from "@/components/hooks/useFormApp";
import { emailSchema, passwordSchema } from "@/lib/schemas/base";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/typography";
import OAuthLoginButton from "@/components/OAuthLoginButton";
import AuthCardFooter from "@/components/AuthCardFooter";
import { PASSWORD_REQUIREMENTS } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import authClient from "@/lib/authClient";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

const { signUp } = authClient;

const registerFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, { message: "Confirm password is required" }),
})
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  );

export default function RegisterForm() {
  const navigate = useNavigate({ from: "/register" });

  const appForm = useAppForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: registerFormSchema,
    },
    onSubmit: async ({ value }) => await mutateAsync({ email: value.email, password: value.password }),
  });

  const { mutateAsync, isPending, isSuccess, isError, failureReason } = useMutation({
    mutationFn: async (data: { email: string, password: string }) => {
      const { data: response, error } = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.email.split("@")[0],
      });

      if (error) {
        throw new Error('Failed to register. Please try again.');
      }

      return response;
    },
    onSuccess: ({ user }) => {
      navigate({
        to: "/verify",
        search: {
          type: "email-verification",
          email: user.email,
        }
      });
    },
    onError: () => {
      toast.error("Failed to register. Please try again.");
    }
  });

  const disableForm = isPending || isSuccess;

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        appForm.handleSubmit();
      }}
      aria-disabled={disableForm}
    >
      <div className="grid gap-3">
        {isError && failureReason && (
          <div className="text-red-500">
            {failureReason.message}
          </div>
        )}
        <div className="grid gap-3">
          <appForm.AppField
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
          <appForm.AppField
            name="password"
            children={field => (
              <field.TextField
                id="password"
                name="password"
                type="password"
                label="Password"
                tooltip={PASSWORD_REQUIREMENTS}
                disabled={disableForm}
              />
            )}
          />
          <appForm.AppField
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

          <appForm.AppForm>
            <appForm.SubmitButton label="Create an Account" />
          </appForm.AppForm>

          <div className="flex flex-row justify-between items-center gap-2">
            <Separator className="shrink-1 text-white" />
            <Text variant="muted" className="w-fit !mt-0">
              Or
            </Text>
            <Separator className="shrink-1 text-white" />
          </div>

          <div className="flex flex-col gap-4">
            <OAuthLoginButton method="Register" provider="google" />
          </div>
        </div>

        <AuthCardFooter />
      </div>
    </form>
  )
}

