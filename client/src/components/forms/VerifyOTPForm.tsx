import { useAppForm } from "@/hooks/useFormApp";

import { z } from "zod";
import { InputOTPSeparator } from "../ui/input-otp";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { api, cn } from "@/lib/utils";
import { FieldErrorInfo } from "./formFields";
import { Text } from "../ui/typography";
import ResendOTPButton from "../ResendOTPButton";
import { Route as VerifyOTPRoute } from "@/routes/_auth/_auth.verify";
import authClient from "@server/auth/authClient";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Send } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

const { emailOtp, signIn } = authClient;

const verifyOTPFormSchema = z.object({
  otp: z.string().min(6).max(6),
});

// TODO: Rework This
export default function VerifyOTPForm() {
  const navigate = VerifyOTPRoute.useNavigate();
  const { type, email } = VerifyOTPRoute.useSearch();

  const [mutateErrorMsg, setMutateErrorMsg] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      otp: "",
    },
    validators: {
      onSubmit: verifyOTPFormSchema,
    },
    onSubmit: async ({ value }) => await mutateAsync({ otp: value.otp, email }),
  });

  const { mutateAsync, isPending, isSuccess, isError } = useMutation({
    mutationFn: async ({ otp, email }: { otp: string, email: string }) => {
      if (type === "email-verification") {
        const { data } = await emailOtp.verifyEmail({
          email,
          otp,
        });

        if (!data || data.status !== true) {
          throw new Error("Invalid OTP");
        };

        verifySurveySubmission();
      } else if (type === "sign-in") {
        const { data } = await signIn.emailOtp({
          email,
          otp,
        });

        if (!data || data.user === null) {
          throw new Error("Invalid OTP");
        };

        verifySurveySubmission();
      } else {
        throw new Error("Invalid OTP type");
      }
    },
    onError: (error) => {
      console.log(error);
      setMutateErrorMsg(error.message === "Invalid OTP" ? "Invalid OTP"
        : error.message === "Invalid OTP type" ? "Invalid OTP type"
          : "Something went wrong");
    },
    onSuccess: () => {
      toast.success("Email verified successfully");
      navigate({ to: "/videos" });
    }
  });

  async function verifySurveySubmission() {
    const res = await api.onboarding.survey.$get(undefined, {
      init: {
        credentials: "include",
      }
    });

    const { data: surveyData } = await res.json();

    if (surveyData.hasSubmitted) {
      navigate({ to: "/videos" });
    } else {
      navigate({ to: "/survey" });
    };
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        form.handleSubmit();
      }}
      aria-disabled={isPending || isSuccess}
    >
      <div className="flex flex-col gap-6 items-center">
        <form.AppField
          name="otp"
          children={({ state, setValue }) => (
            <>
              <InputOTP
                id="code"
                name="code"
                maxLength={6}
                disabled={isPending || isSuccess}
                className={cn(state.meta.errors.length > 0 && "border-red-500")}
                value={state.value}
                onChange={value => setValue(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className={cn(state.meta.errors.length > 0 && "border-red-500")} />
                  <InputOTPSlot index={1} className={cn(state.meta.errors.length > 0 && "border-red-500")} />
                  <InputOTPSlot index={2} className={cn(state.meta.errors.length > 0 && "border-red-500")} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} className={cn(state.meta.errors.length > 0 && "border-red-500")} />
                  <InputOTPSlot index={4} className={cn(state.meta.errors.length > 0 && "border-red-500")} />
                  <InputOTPSlot index={5} className={cn(state.meta.errors.length > 0 && "border-red-500")} />
                </InputOTPGroup>
              </InputOTP>
              <FieldErrorInfo />
            </>
          )}
        />

        {isError && mutateErrorMsg && (
          <div className="mt-2">
            <Text variant="error">{mutateErrorMsg}</Text>
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <ResendOTPButton
            email={email}
            type={type}
          />
        </div>

        <Button
          type="submit"
          disabled={isPending || isSuccess}
          className={cn([
            "w-full",
            isPending && "cursor-not-allowed",
            isSuccess && "text-green-500 cursor-not-allowed"
          ])}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isSuccess ? (
            <CheckCircle className="w-4 h-4" />
          ) : null}
          {isPending ? "Verifying..." : isSuccess ? "Verified" : "Verify"}
          {!isPending && !isSuccess && <Send className="w-4 h-4" />}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?
            <br />
            <Link to="/login" className="text-primary hover:underline">
              Return to sign in
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}
