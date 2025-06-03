"use client";

import { DialogStoreContext } from "@/lib/contexts";
import { DashboardDialogStore } from "@/lib/stores/dialog-store";
import { useContext } from "react";
import { useStore } from "zustand";

// Zustand stores, must be seperated from the providers file for fast refresh
export function useDialogStore<T,>(selector: (store: DashboardDialogStore) => T) {
  const storeContext = useContext(DialogStoreContext);

  if (!storeContext) {
    throw new Error("useDialogStore must be used within a DialogStoreProvider");
  }

  return useStore(storeContext, selector);
}