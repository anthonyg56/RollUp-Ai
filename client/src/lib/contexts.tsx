"use client";

import { DashboardDialogStoreApi } from "@/components/providers/DialogProvider";
import { createContext } from "react";

export type Theme = "dark" | "light" | "system"

export type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
export const DialogStoreContext = createContext<DashboardDialogStoreApi | undefined>(undefined);