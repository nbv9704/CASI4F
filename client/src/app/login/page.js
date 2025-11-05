import { Suspense } from 'react'
import LoginClient from './LoginClient'

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <span className="text-sm text-white/70">Loading login...</span>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  )
}
