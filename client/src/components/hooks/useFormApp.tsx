"use client";

import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { TextField, ToggleField, CheckboxField, SelectField, TextAreaField } from "@/components/forms/formFields";
import { SubmitButton, ResetButton, CancelButton, OnSubmitErrorInfo } from "@/components/forms/FormComponents";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
    ToggleField,
    SelectField,
    CheckboxField,
    TextAreaField,
  },
  formComponents: {
    SubmitButton,
    ResetButton,
    CancelButton,
    OnSubmitErrorInfo,
  },
  fieldContext,
  formContext,
})