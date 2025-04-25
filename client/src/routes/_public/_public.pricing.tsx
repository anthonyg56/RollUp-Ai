import PricingPage from '@/pages/public/pricing'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/_public/pricing')({
  component: PricingPage,
})
