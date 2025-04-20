import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/_public')({
  component: PublicRoutesLayout,
})

function PublicRoutesLayout() {
  return <Outlet />
}
