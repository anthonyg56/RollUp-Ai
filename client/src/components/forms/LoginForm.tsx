import { useAppForm } from "@/components/hooks/useFormApp";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/typography";
import OAuthLoginButton from "../OAuthLoginButton";
import authClient from "@/lib/authClient";
import AuthCardFooter from "../AuthCardFooter";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";

const { signIn } = authClient;

const loginFormSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function LoginForm() {
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginFormSchema
    },
    onSubmit: async ({ value }) => await mutateAsync({ email: value.email, password: value.password }),
  });

  const navigate = useNavigate({ from: "/login" });
  const { queryClient } = useRouteContext({ from: "/_auth/_auth/login" });

  const { mutateAsync, isPending, isSuccess, isError, failureReason } = useMutation({
    mutationFn: async (data: { email: string, password: string }) => {
      const res = await signIn.email({
        email: data.email,
        password: data.password,
        fetchOptions: {
          onError: async ({ error }) => {
            console.log(error);

            if (
              error.code === "INVALID_EMAIL_OR_PASSWORD" ||
              error.code === "PASSWORD_TOO_LONG" ||
              error.code === "PASSWORD_TOO_SHORT"
            ) {
              throw new Error('Invalid email or password');
            } else if (error?.code === "EMAIL_NOT_VERIFIED") {
              navigate({
                to: "/verify",
                search: {
                  type: "email-verification",
                  email: data.email,
                  isLogin: true,
                },
              });
            } else {
              throw error;
            }
          },
          credentials: "include",
        },
      });

      return {
        ...res,
        email: data.email,
      };
    },
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (response) => {
      if (response.error && response.error?.code === "EMAIL_NOT_VERIFIED") {
        navigate({
          to: "/verify",
          search: {
            type: "email-verification",
            email: response.email,
            isLogin: true,
          },
        });
      } else if (response.error || !response.data) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["getSession"] });
      navigate({
        to: "/videos",
        search: {
          redirect: "Login",
        }
      });
    }
  });

  const emailMeta = form.getFieldMeta("email");
  const passwordMeta = form.getFieldMeta("password");
  const disableForm = isPending || isSuccess && !isError;

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={e => {
        e.preventDefault();
        form.handleSubmit();
      }}
      aria-disabled={disableForm}
    >
      <div className="grid gap-3">
        <div className="grid gap-3">
          {isError && failureReason && (
            <div className="text-red-500">
              <Text variant="error" size="small" className="text-center">{failureReason.message}</Text>
            </div>
          )}
          <form.AppField
            name="email"
            children={field => (
              <field.TextField
                id="email"
                name="email"
                type="email"
                label="Email"
                singleError={true}
                disabled={disableForm}
              />
            )}
          />
          <form.AppField
            name="password"
            children={field => (
              <field.TextField
                id="password"
                name="password"
                type="password"
                label="Password"
                forgotPassword
                disabled={disableForm}
                disableError={emailMeta !== undefined && emailMeta.errors.length > 0 || passwordMeta !== undefined && passwordMeta.errors.length > 0 ? false : true}
              />
            )}
          />
        </div>

        <form.AppForm>
          <form.SubmitButton label="Login" submittingLabel="Logging in..." />
        </form.AppForm>

        <div className="flex flex-row justify-between items-center gap-2">
          <Separator className="shrink-1 text-white" />
          <Text variant="muted" className="w-fit !mt-0">
            Or
          </Text>
          <Separator className="shrink-1 text-white" />
        </div>

        <div className="flex flex-col gap-4">
          <OAuthLoginButton method="Login" provider="google" />
        </div>
      </div>

      <AuthCardFooter />
    </form>
  );
};
