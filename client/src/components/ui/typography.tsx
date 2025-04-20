import { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import React from "react";

export const H1 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h1
      ref={ref}
      className={`scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl ${className || ""}`}
      {...props}
    >
      {children}
    </h1>
  );
});
H1.displayName = "H1";

export const H2 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h2
      ref={ref}
      className={`scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 ${className || ""}`}
      {...props}
    >
      {children}
    </h2>
  );
});
H2.displayName = "H2";

export const H3 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={`scroll-m-20 text-2xl font-semibold tracking-tight ${className || ""}`}
      {...props}
    >
      {children}
    </h3>
  );
});
H3.displayName = "H3";

export const H4 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h4
      ref={ref}
      className={`scroll-m-20 text-xl font-semibold tracking-tight ${className || ""}`}
      {...props}
    >
      {children}
    </h4>
  );
});
H4.displayName = "H4";

const textVariants = cva("", {
  variants: {
    variant: {
      default: "text-primary",
      error: "text-destructive",
      success: "text-green-500",
      warning: "text-yellow-500",
      info: "text-blue-500",
      muted: "text-muted-foreground",
      lead: "text-xl text-muted-foreground",
    },
    size: {
      default: "text-sm leading-7 [&:not(:first-child)]:mt-6",
      xs: "text-xs leading-7 [&:not(:first-child)]:mt-6",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface TextProps
  extends React.ComponentPropsWithRef<"p">,
  VariantProps<typeof textVariants> { }

export const Text: React.FC<TextProps> = ({ className, variant, size, children, ref, ...props }) => {
  return (
    <p
      ref={ref}
      className={textVariants({ variant, size, className })}
      {...props}
    >
      {children}
    </p>
  );
};

Text.displayName = "Text";
