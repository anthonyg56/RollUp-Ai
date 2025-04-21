import OnboardingSurveryForm from '@/components/forms/OnboardingSurveryForm'
import { BASE_HEAD_TITLE } from '@/lib/constants'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_auth/survey')({
  head: () => ({
    meta: [
      {
        name: "title",
        content: `${BASE_HEAD_TITLE} Survey`,
      },
      {
        name: "description",
        content: "Survey for Rollup AI",
      },
    ],
  }),
  component: Survey,
})

function Survey() {
  return <OnboardingSurveryForm />
}
