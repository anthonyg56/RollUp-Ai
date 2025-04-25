"use client";

import { useNavigate } from "@tanstack/react-router";
import { Button, ShadcnButtonProps } from "./ui/button";
import { capitalizeFirstLetter } from "@/lib/utils";
import authClient from "@/lib/authClient";
import { BASE_URL } from "@/lib/constants";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import GoogleSVG from "@/components/svg/google";
import GithubSVG from "@/components/svg/github";

const { signIn } = authClient;

export type OAuthProvider = "google" | "github";
export type SignInMethod = "Login" | "Register";

interface OAuthLoginButtonProps extends ShadcnButtonProps {
  method: SignInMethod;
  provider: OAuthProvider;
};

export default function OAuthLoginButton({ method, provider, ...props }: OAuthLoginButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const navigate = useNavigate({ from: method === "Login" ? "/login" : "/register" });

  const icon = provider === "google" ? <GoogleSVG /> : <GithubSVG />;
  const capitalizedProvider = capitalizeFirstLetter(provider);

  async function handleClick() {
    setIsPending(true);

    await signIn.social({
      provider,
      callbackURL: `${BASE_URL}/api/auth/callback`
    }, {
      onSuccess: () => {
        navigate({ to: "/videos", search: { redirect: "Login" } })
        setIsPending(false);
      },
      onError: () => {
        setIsPending(false);
      }
    });
  };

  return (
    <Button
      {...props}
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleClick}
      disabled={isPending}
    >
      {icon}
      {method} with {capitalizedProvider}
      {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
    </Button>
  );
}
