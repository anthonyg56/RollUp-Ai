"use client";

import { DashboardDialogStoreApi } from "@/components/providers/DialogProvider";
import { createContext } from "react";

export const DialogStoreContext = createContext<DashboardDialogStoreApi | undefined>(undefined);