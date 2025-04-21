import { BASE_HEAD_TITLE } from '@/lib/constants'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/_public/privacy')({
  head: () => ({
    meta: [
      {
        name: "title",
        content: `${BASE_HEAD_TITLE} Privacy Policy`,
      },
      {
        name: "description",
        content: "Privacy Policy for Rollup AI",
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_public/_public/privacy"!</div>
}
