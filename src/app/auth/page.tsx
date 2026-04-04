import { redirect } from 'next/navigation'

// Auth removed — redirect to catalog
export default function AuthPage() {
  redirect('/catalog')
}
