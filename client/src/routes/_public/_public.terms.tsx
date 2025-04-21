import { BASE_HEAD_TITLE } from '@/lib/constants'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/_public/terms')({
  head: () => ({
    meta: [
      {
        name: "title",
        content: `${BASE_HEAD_TITLE} Terms of Service`,
      },
      {
        name: "description",
        content: "Terms of Service for Rollup AI",
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_public/_public/terms"!</div>
}
