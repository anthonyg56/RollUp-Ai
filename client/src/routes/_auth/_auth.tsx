import AuthLayout from '@/components/layouts/AuthLayout';
import { createFileRoute, } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_auth')({
  component: AuthLayout,
});


