import OnboardingSurveryForm from '@/components/forms/OnboardingSurveryForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_auth/survey')({
  component: Survey,
})

function Survey() {
  return <OnboardingSurveryForm />
}
