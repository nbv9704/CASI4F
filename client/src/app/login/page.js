// client/src/app/login/page.js
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import useApi from '../../hooks/useApi'
import { useUser } from '../../context/UserContext'
import { useLocale } from '../../context/LocaleContext'
import { toast } from 'react-hot-toast'
import {
  ArrowRight,
  Loader2,
  Lock,
  LogIn,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react'

const REDIRECT_FLAG = 'auth:redirected'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams?.get('next') || '/'
  const { post } = useApi()
  const { fetchUser, user } = useUser()
  const { t } = useLocale()

  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')

  const [authBusy, setAuthBusy] = useState(false)
  const [countingDown, setCountingDown] = useState(false)
  const [countdownSeconds, setCountdownSeconds] = useState(0)

  const redirectingRef = useRef(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    try {
      sessionStorage.removeItem(REDIRECT_FLAG)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (authBusy || countingDown) return

    let token = null
    try {
      token = localStorage.getItem('token')
    } catch {
      token = null
    }
    if (!token) return

    if (user && !redirectingRef.current) {
      redirectingRef.current = true
      router.replace(nextPath)
      return
    }

    if (!user && !redirectingRef.current) {
      ;(async () => {
        try {
          await fetchUser()
          if (
            !authBusy &&
            !countingDown &&
            !redirectingRef.current &&
            localStorage.getItem('token')
          ) {
            redirectingRef.current = true
            router.replace(nextPath)
          }
        } catch {
          /* ignore */
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, nextPath, authBusy, countingDown])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (authBusy || countingDown) return

    setAuthBusy(true)
    try {
      const { token } = await post('/auth/login', { usernameOrEmail, password })
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
      }

      let counter = 3
      setCountdownSeconds(counter)
      setAuthBusy(false)
      setCountingDown(true)

      const toastId = 'login-redirect'
      toast.success(t('auth.login.countdownToast', { seconds: counter }), { id: toastId })

      intervalRef.current = setInterval(async () => {
        counter -= 1
        setCountdownSeconds(Math.max(counter, 0))
        if (counter > 0) {
          toast.success(t('auth.login.countdownToast', { seconds: counter }), { id: toastId })
        } else {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setCountingDown(false)
          setCountdownSeconds(0)
          toast.success(t('auth.login.successToast'), { id: toastId })

          try {
            await fetchUser()
          } catch {
            /* ignore */
          }

          redirectingRef.current = true
          router.replace(nextPath || '/')
        }
      }, 1000)
    } catch (err) {
      toast.error(err?.message || t('auth.login.error'))
      setAuthBusy(false)
      setCountingDown(false)
      setCountdownSeconds(0)
    }
  }

  const heroBulletsRaw = t('auth.login.heroBullets')
  const heroBullets = Array.isArray(heroBulletsRaw) ? heroBulletsRaw : []

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),_transparent_55%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_1fr]">
          <section className="flex flex-col justify-between gap-8 rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-indigo-200">
                <Sparkles className="h-4 w-4" />
                {t('auth.login.headerAccent')}
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold md:text-5xl">{t('auth.login.heroTitle')}</h1>
                <p className="max-w-lg text-sm text-indigo-100/80 md:text-base">
                  {t('auth.login.heroSubtitle')}
                </p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-white/75">
              {heroBullets.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-4 w-4 text-indigo-200" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-indigo-500/20 backdrop-blur">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">
                {t('auth.login.headerAccent')}
              </p>
              <h2 className="text-3xl font-semibold text-white">{t('auth.login.title')}</h2>
              <p className="text-sm text-white/70">{t('auth.login.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-white/60">
                  {t('auth.common.usernameOrEmail')}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-sm text-white placeholder:text-white/40 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40 focus:outline-none"
                    required
                    disabled={countingDown}
                    placeholder={t('auth.common.usernameOrEmail')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-white/60">
                  {t('auth.common.password')}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-sm text-white placeholder:text-white/40 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40 focus:outline-none"
                    required
                    disabled={countingDown}
                    placeholder={t('auth.common.password')}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={authBusy || countingDown}
              >
                {authBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('auth.login.processing')}</span>
                  </>
                ) : countingDown ? (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>{t('auth.login.countdownButton', { seconds: countdownSeconds || 1 })}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>{t('auth.login.button')}</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-sm text-white/60">
              {t('auth.common.noAccount')}{' '}
              <Link
                href="/register"
                className="inline-flex items-center gap-1 font-semibold text-indigo-200 transition hover:text-indigo-100"
              >
                {t('auth.common.registerLink')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
