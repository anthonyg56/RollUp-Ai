import OnboardingSurveryForm from '@/components/forms/OnboardingSurveryForm'
import { BASE_HEAD_TITLE } from '@/lib/constants'
import { createFileRoute, redirect } from '@tanstack/react-router'
import authClient from '@/lib/authClient'

const { getSession } = authClient

export const Route = createFileRoute('/_auth/_auth/survey')({
  beforeLoad: async () => {
    const { data, error } = await getSession()

    if (!data || error) {
      throw redirect({ to: '/login', search: { showToast: true, toastReason: 'You must be logged in to access this page.' } })
    }

    const { user } = data;

    if (user.showOnboardingSurvey === false) {
      throw redirect({ to: '/videos' })
    }

    return {
      user: user,
    }
  },
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
