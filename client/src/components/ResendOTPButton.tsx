"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import authClient from "@/lib/authClient";
import { Text } from "./ui/typography";

const { emailOtp } = authClient;

interface ResendOTPButtonProps {
  email: string;
  type: "email-verification" | "forget-password" | "sign-in";
}

export default function ResendOTPButton({ email, type }: ResendOTPButtonProps) {
  const [cooldown, setCooldown] = useState(0);

  const { mutate: resendOTP, isPending: isSending, error, isSuccess } = useMutation({
    mutationKey: ["resend-otp", email, type],
    mutationFn: async () => {
      const { data } = await emailOtp.sendVerificationOtp({
        email,
        type
      });

      return data
    },
    onSuccess: () => {
      toast.success("New code sent!", {
        description: "Check your email for the new code.",
        duration: 5000,
        position: "top-right",
      });
    },
    onMutate: () => {
      setCooldown(10);
    },
    onError: (error) => {
      toast.error("Failed to send new code", {
        description: "Please try again later",
        duration: 5000,
        position: "top-right",
      });
      console.error(error);
    }
  });

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => resendOTP()}
        disabled={cooldown > 0 || isSending}
        className="flex items-center gap-2"
      >
        {isSending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        {cooldown > 0
          ? `Resend code in ${cooldown}s`
          : isSending
            ? "Sending..."
            : "Resend code"}
      </Button>

      {error && (
        <Text className="text-xs">{error.message}</Text>
      )}

      {isSuccess && (
        <Text variant="success" className="text-xs">New code sent!</Text>
      )}
    </div>
  )
}
