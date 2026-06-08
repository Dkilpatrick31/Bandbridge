import { useEffect } from 'react'
import { useRouter } from 'next/router'

// This page was a stub that was never wired up.
// All signup/onboarding is handled by /signup which has the full form.
export default function OnboardingPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/signup') }, [router])
  return null
}
