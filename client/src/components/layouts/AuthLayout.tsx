import { Link, useMatchRoute } from "@tanstack/react-router";

import { Outlet } from "@tanstack/react-router";

import { CardContent } from "@/components/ui/card";

import { CardDescription } from "@/components/ui/card";

import { CardTitle } from "@/components/ui/card";

import { CardHeader } from "@/components/ui/card";

import { Card } from "@/components/ui/card";

export default function AuthLayout() {
  const matchRoute = useMatchRoute();

  const content = getContent();

  function getContent() {
    if (matchRoute({ to: '/verify' })) {
      return {
        path: "Verify Email",
        title: "Check Your Email for a Code",
        description: "We sent a 6-digit verification code to your email. Please enter it below to continue."
      }
    } else if (matchRoute({ to: '/forgot' })) {
      return {
        path: "Forgot Password",
        title: "Forgot Your Password?",
        description: "Enter your email address below, and we'll send instructions to help you reset it."
      }
    } else if (matchRoute({ to: '/register' })) {
      return {
        path: "Register",
        title: "Create Your Account",
        description: "Let's get you started. Please fill in your details below."
      }
    } else if (matchRoute({ to: '/login' })) {
      return {
        path: "Login",
        title: "Welcome Back",
        description: "Please sign in with your email and password."
      }
    } else if (matchRoute({ to: '/reset' })) {
      return {
        path: "Reset Password",
        title: "Create Your New Password",
        description: "Please enter and confirm your new password below."
      }
    } else if (matchRoute({ to: '/survey' })) {
      return {
        path: "Survey",
        title: "Please fill out the survey",
        description: "We need to know a little bit about you to help you get the most out of our platform."
      }
    } else {
      return {
        path: "Welcome Back",
        title: "Welcome Back",
        description: "Please sign in with your email and password."
      }
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          {content.path}
        </a>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                {content.title}
              </CardTitle>
              <CardDescription>
                {content.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Outlet />
            </CardContent>
          </Card>

          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
            By clicking continue, you agree to our{" "}
            <Link to="/terms">Terms of Service</Link> and{" "}
            <Link to="/privacy">Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  )
}