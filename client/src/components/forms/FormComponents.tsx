"use client";

import { Button, ShadcnButtonProps } from "@/components/ui/button";
import { useFormContext } from "@/hooks/useFormApp";
import { cn } from "@/lib/utils";
import { useStore } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends ShadcnButtonProps {
  label?: string;
  submittingLabel?: string;
}

export function SubmitButton({ label = "Submit", submittingLabel = "...Submitting" }: SubmitButtonProps) {
  const form = useFormContext();

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className={cn(
        "w-full",
        isSubmitting && "cursor-not-allowed opacity-60"
      )}
    >
      {isSubmitting ? submittingLabel : label}
      {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
    </Button>
  )
};

interface ResetButtonProps extends ShadcnButtonProps {
  label?: string
}

export function ResetButton({
  label = "Reset",
  variant = "outline",
  className
}: ResetButtonProps) {
  const form = useFormContext();
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const handleReset = () => {
    form.reset();
  };

  return (
    <Button
      type="button"
      onClick={handleReset}
      variant={variant}
      className={cn("w-full", className)}
      disabled={isSubmitting}
    >
      {label}
    </Button>
  );
}

interface CancelButtonProps extends ShadcnButtonProps {
  label?: string;
  cb: () => void;
}

export function CancelButton({
  cb,
  label = "Cancel",
  className,
  ...props
}: CancelButtonProps) {
  const form = useFormContext();
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  const handleCancel = () => {
    form.reset();
    cb();
  };

  return (
    <Button
      type="button"
      onClick={handleCancel}
      variant="outline"
      className={cn("w-full", className)}
      disabled={isSubmitting}
      {...props}
    >
      {label}
    </Button>
  )
}

export function OnSubmitErrorInfo() {
  const form = useFormContext();
  const formErrors = useStore(form.store, state => state.errorMap.onServer);

  if (formErrors.onSubmit === 0)
    return null;

  return (
    <em>{formErrors.join(', ')}</em>
  )
}
