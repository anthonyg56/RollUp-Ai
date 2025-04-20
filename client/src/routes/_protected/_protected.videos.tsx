import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/_protected/videos')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
