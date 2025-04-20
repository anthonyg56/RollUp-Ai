import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { DialogStoreProvider } from '@/components/providers/DialogProvider'
import ProtectedNavbar from '@/components/ProtectedNavbar'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => (
    <>
      <ThemeProvider>
        <DialogStoreProvider>
          <ProtectedNavbar />
          <Outlet />
          <Toaster />
        </DialogStoreProvider>
      </ThemeProvider>
      <TanStackRouterDevtools />
      <ReactQueryDevtools buttonPosition="top-right" />
    </>
  ),
})