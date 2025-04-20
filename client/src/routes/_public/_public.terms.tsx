import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/_public/terms')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_public/_public/terms"!</div>
}
