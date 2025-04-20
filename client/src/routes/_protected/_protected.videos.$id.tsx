import { uuidSchema } from '@/lib/schemas/base'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/_protected/videos/$id',
)({
  validateSearch: zodValidator(
    z.object({
      videoId: uuidSchema,
    })
  ),
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/_protected/videos/_protected/videos/$id"!</div>
}
