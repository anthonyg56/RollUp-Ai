"use client";

import { Link, useMatchRoute } from "@tanstack/react-router";

export default function AuthCardFooter() {
  const matchRoute = useMatchRoute();

  const isLogin = matchRoute({ to: '/login' });
  const isRegister = matchRoute({ to: '/register' });
  const isForgot = matchRoute({ to: '/forgot' });

  let message: string;
  let link: string;
  let linkText: string;

  if (isLogin) {
    message = "Don't have an account?";
    link = "/register";
    linkText = "Register";
  } else if (isRegister) {
    message = "Already have an account?";
    link = "/login";
    linkText = "Login";
  } else if (isForgot) {
    message = "Remember your password?";
    link = "/login";
    linkText = "Return to sign in";
  } else {
    message = "Need an account?";
    link = "/register";
    linkText = "Create an account";
  };

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">
        {message}
        <br />
        <Link to={link} className="text-primary hover:underline">
          {linkText}
        </Link>
      </p>
    </div>
  )
}
