// client/src/app/register/page.js
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Loader2, Lock, Mail, ShieldCheck, Sparkles, UserPlus } from 'lucide-react'
import useApi from '../../hooks/useApi'
import { useLocale } from '../../context/LocaleContext'
import { toast } from 'react-hot-toast'

export default function RegisterPage() {
  const { post } = useApi()
  const { t } = useLocale()
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await post('/auth/register', { username, email, password })
      toast.success(t('auth.register.successToast'))
    } catch (err) {
      toast.error(err?.message || t('auth.register.error'))
    } finally {
      setLoading(false)
    }
  }

  const heroBulletsRaw = t('auth.register.heroBullets')
  const heroBullets = Array.isArray(heroBulletsRaw) ? heroBulletsRaw : []

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.3),_transparent_55%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-10 lg:grid-cols-[1fr_1.1fr]">
          <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-purple-500/20 backdrop-blur">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-200">
                {t('auth.register.headerAccent')}
              </p>
              <h1 className="text-3xl font-semibold text-white md:text-4xl">
                {t('auth.register.title')}
              </h1>
              <p className="text-sm text-white/70 md:text-base">
                {t('auth.register.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-white/60">
                  {t('auth.common.username')}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
                    <UserPlus className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-sm text-white placeholder:text-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/40 focus:outline-none"
                    required
                    placeholder={t('auth.common.username')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-white/60">
                  {t('auth.common.email')}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-sm text-white placeholder:text-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/40 focus:outline-none"
                    required
                    placeholder={t('auth.common.email')}
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
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-sm text-white placeholder:text-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/40 focus:outline-none"
                    required
                    placeholder={t('auth.common.password')}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:from-purple-400 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('auth.register.processing')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>{t('auth.register.button')}</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-sm text-white/60">
              {t('auth.common.haveAccount')}{' '}
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-semibold text-purple-200 transition hover:text-purple-100"
              >
                {t('auth.common.loginLink')}
              </Link>
            </p>
          </section>

          <section className="flex flex-col justify-between gap-8 rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-300/40 bg-purple-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-purple-200">
                <Sparkles className="h-4 w-4" />
                {t('auth.register.headerAccent')}
              </span>
              <div className="space-y-3">
                <h2 className="text-4xl font-bold md:text-5xl">{t('auth.register.heroTitle')}</h2>
                <p className="max-w-lg text-sm text-purple-100/80 md:text-base">
                  {t('auth.register.heroSubtitle')}
                </p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-white/75">
              {heroBullets.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-4 w-4 text-purple-200" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}