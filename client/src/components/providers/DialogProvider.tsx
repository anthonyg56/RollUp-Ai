"use client";
import { ComponentPropsWithoutRef, useRef } from "react";
import { createDashboardDialogStore, DashboardDialogState } from "@/lib/stores/dialog-store";
import { DialogStoreContext } from "@/lib/contexts";
import { useDialogStore } from "@/components/hooks/useStores";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import UploadNewVideoDialog from "@/components/dialogs/UploadNewVideoDialog";

export type DashboardDialogStoreApi = ReturnType<typeof createDashboardDialogStore>;

export interface DialogStoreProviderProps {
  children: React.ReactNode;
  initialOptions?: DashboardDialogState;
}

export function DialogStoreProvider({ children, initialOptions }: DialogStoreProviderProps) {
  const storeRef = useRef<DashboardDialogStoreApi>(null);

  if (!storeRef.current) {
    storeRef.current = createDashboardDialogStore(initialOptions);
  }

  return (
    <DialogStoreContext.Provider value={storeRef.current}>
      <DialogUIProvider>
        {children}
      </DialogUIProvider>
    </DialogStoreContext.Provider>
  )
}

function DialogUIProvider({ children }: ComponentPropsWithoutRef<"div">) {
  const { open, currentDialog, close } = useDialogStore(state => state);

  return (
    <div>
      {children}
      <Dialog
        open={currentDialog !== null}
        onOpenChange={value => {
          if (value === true && currentDialog) {
            open(currentDialog);
            return;
          } else if (value === false && currentDialog) {
            close();
            return;
          }
        }}

      >
        <DialogContent className="!max-w-fit w-fit" aria-describedby={undefined}>
          {currentDialog === 'Upload New Video' && <UploadNewVideoDialog />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
