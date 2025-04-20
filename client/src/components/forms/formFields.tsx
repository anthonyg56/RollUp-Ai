"use client";

import { useState, ComponentProps, ComponentPropsWithoutRef } from "react";

import { useFieldContext } from "@/hooks/useFormApp";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import InfoTooltip from "@/components/InfoTooltip";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useStore } from "@tanstack/react-form";

interface BaseFieldProps {
  label: string;
  tooltip?: string | string[];
  optional?: boolean;
  forgotPassword?: boolean;
  disableError?: boolean;
  singleError?: boolean;
};

export function TextField({ label, type = "text", disableError = false, singleError = false, ...props }: BaseFieldProps & ComponentPropsWithoutRef<"input">) {
  const field = useFieldContext<string>();
  const fieldErrors = useStore(field.store, state => state.meta.errors);

  function getPlaceholder() {
    switch (type) {
      case "email":
        return "youremail@example.com";
      case "password":
        return "••••••••";
      default:
        return "";
    };
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={field.name} className={cn(
        "flex justify-between",
        {
          "text-red-500": disableError ? false : fieldErrors.length > 0,
        }
      )}>
        {label}
        <OptionalInfo optional={props.optional} tooltip={props.tooltip} forgotPassword={props.forgotPassword} />
      </Label>
      <Input
        {...props}
        type={type}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={getPlaceholder()}
        className={cn(
          {
            "border-red-500": disableError ? false : fieldErrors.length > 0,
          }
        )}
      />
      {!disableError && <FieldErrorInfo singleError={singleError} />}
    </div>
  );
};

export function TextAreaField({ label, disableError = false, ...props }: BaseFieldProps & ComponentPropsWithoutRef<"textarea">) {
  const field = useFieldContext<string>();
  const fieldErrors = useStore(field.store, state => state.meta.errors);
  return (
    <div className="grid gap-2">
      <Label htmlFor={field.name} className={cn({
        "text-red-500": disableError ? false : fieldErrors.length > 0,
      })}>
        {label}
        <OptionalInfo optional={props.optional} tooltip={props.tooltip} forgotPassword={props.forgotPassword} />
      </Label>
      <Textarea
        {...props}
        onChange={(e) => field.handleChange(e.target.value)}
        className={cn(
          {
            "border-red-500": disableError ? false : fieldErrors.length > 0,
          }
        )}
      />
      {!disableError && <FieldErrorInfo />}
    </div>
  )
};

interface SelectFieldProps extends BaseFieldProps, ComponentPropsWithoutRef<"select"> {
  items: {
    label: string;
    value: string | boolean;
  }[];
};

export function SelectField({ label, items, disableError = false }: SelectFieldProps) {
  const [open, setOpen] = useState<boolean>(false);

  const field = useFieldContext<string | boolean>();
  const fieldErrors = useStore(field.store, state => state.meta.errors);

  function handleChange(value: string) {
    if (value === "Yes") {
      field.handleChange(true);
    } else if (value === "No") {
      field.handleChange(false);
    } else {
      field.handleChange(value);
    }
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={field.name} className={cn({
        "text-red-500": disableError ? false : fieldErrors.length > 0,
      })}>{label}</Label>
      <Select onValueChange={handleChange} open={open} onOpenChange={setOpen}>
        <SelectTrigger className={cn({
          "w-full": true,
          "border-red-500": disableError ? false : fieldErrors.length > 0,
        })}>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => {
            if (typeof item.value === "boolean") {
              const value = item.value === true ? "Yes" : "No";
              return (
                <SelectItem key={item.label} value={value}>
                  {item.label}
                </SelectItem>
              )
            };

            return (
              <SelectItem key={item.label} value={item.value}>
                {item.label}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {!disableError && <FieldErrorInfo />}
    </div>
  );
};

interface ToggleFieldProps extends BaseFieldProps, ComponentProps<typeof SwitchPrimitive.Root> {
  checked?: boolean;
  description?: string;
}

export function ToggleField({ label, description, checked = false, disableError = false, ...props }: ToggleFieldProps) {
  const field = useFieldContext<boolean>();
  const fieldValue = useStore(field.store, state => state.value);
  const fieldErrors = useStore(field.store, state => state.meta.errors);

  return (
    <div className="flex flex-row justify-between items-center gap-8">
      <div className="flex flex-col justify-between flex-1">
        <div className="space-y-0.5 flex flex-row justify-between">
          <Label htmlFor={field.name} className={cn({
            "text-red-500": disableError ? false : fieldErrors.length > 0,
          })}>
            {label}
          </Label>
          <OptionalInfo optional={props.optional} tooltip={props.tooltip} forgotPassword={props.forgotPassword} />
        </div>
        <div className="text-sm text-muted-foreground">
          {description}
        </div>
      </div>

      <Switch
        {...props}
        checked={fieldValue}
        defaultChecked={checked}
        onCheckedChange={(checked) => field.handleChange(checked as boolean)}
        className={cn(props.className, {
          "data-[state=unchecked]:bg-red-200": disableError ? false : fieldErrors.length > 0,
        })}
      />
      {!disableError && <FieldErrorInfo />}
    </div>
  )
}

interface CheckboxFieldProps extends BaseFieldProps {
  checked?: boolean;
  subLabel?: string;
}

export function CheckboxField({ label, checked = false, subLabel, disableError = false, ...props }: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();
  const fieldErrors = useStore(field.store, state => state.meta.errors);

  return (
    <div className="items-top flex space-x-2">
      <Checkbox
        checked={checked}
        onCheckedChange={(checked) => field.handleChange(checked as boolean)}
        className={cn({
          "border-red-500 data-[state=unchecked]:bg-red-100": disableError ? false : fieldErrors.length > 0,
        })}
      />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor={field.name} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", {
          "text-red-500": disableError ? false : fieldErrors.length > 0,
        })}>
          {label}
          <OptionalInfo optional={props.optional} tooltip={props.tooltip} forgotPassword={props.forgotPassword} />
        </Label>
        {subLabel && <p className="text-sm text-muted-foreground">{subLabel}</p>}
      </div>
      {!disableError && <FieldErrorInfo />}
    </div>
  );
};

interface FieldErrorInfoProps {
  singleError?: boolean;
}

export function FieldErrorInfo({ singleError }: FieldErrorInfoProps) {
  const field = useFieldContext();

  const isTouched = useStore(field.store, state => state.meta.isTouched);
  const fieldErrors = useStore(field.store, state => state.meta.errors);

  if (!isTouched || fieldErrors.length === 0)
    return null;

  return (
    <div className="text-red-500 text-sm mt-1">
      {singleError ? fieldErrors[0].message : fieldErrors.map((error, index) => (
        <div key={index}>{error.message}</div>
      ))}
    </div>
  )
}

interface OptionalInfoProps {
  optional?: boolean;
  tooltip?: string | string[];
  forgotPassword?: boolean;
}

function OptionalInfo({ optional, tooltip, forgotPassword }: OptionalInfoProps) {
  return (
    <div className="flex flex-row gap-1">
      {optional && <span className="text-muted-foreground">(Optional)</span>}
      {tooltip && <InfoTooltip content={tooltip} />}
      {forgotPassword && (
        <Link to="/forgot" className="text-muted-foreground hover:underline hover:text-primary transition-colors text-sm">
          Forgot Password?
        </Link>
      )}
    </div>
  )
}