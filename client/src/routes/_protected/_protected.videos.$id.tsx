import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/_protected/videos/$id',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/_protected/videos/_protected/videos/$id"!</div>
}
