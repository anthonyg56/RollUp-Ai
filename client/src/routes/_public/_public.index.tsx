import { BASE_HEAD_TITLE } from '@/lib/constants'
import { createFileRoute } from '@tanstack/react-router'
import HomePage from "@/pages/public/home"

export const Route = createFileRoute('/_public/_public/')({
  head: () => ({
    meta: [
      {
        name: "title",
        content: `${BASE_HEAD_TITLE} Home`,
      },
      {
        name: "description",
        content: "Rollup AI - AI-powered video editing",
      },
    ],
  }),
  component: HomePage,
});