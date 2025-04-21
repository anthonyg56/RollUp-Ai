import { createRootRouteWithContext, Outlet, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { DialogStoreProvider } from '@/components/providers/DialogProvider'
import Navbar from '@/components/navbar'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { HeadContent } from '@tanstack/react-router'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => (
    <>
      <HeadContent />
      <ThemeProvider>
        <DialogStoreProvider>
          <Navbar />
          <Outlet />
          <Toaster />
        </DialogStoreProvider>
      </ThemeProvider>
      <Scripts />
      <TanStackRouterDevtools />
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </>
  ),
})