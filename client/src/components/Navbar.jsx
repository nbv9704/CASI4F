'use client'

// client/src/components/Navbar.jsx

import Link from 'next/link'
import Image from 'next/image'
import { useUser } from '../context/UserContext'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Menu, X, Gamepad2, Gift, Medal, LogOut } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'
import NotificationBell from './NotificationBell'
import WalletBadgeIcon from './icons/WalletBadgeIcon'
import { getLevelProgress } from '../utils/level'

export default function Navbar() {
  const { user, balance, bank, logout } = useUser()
  const { locale, t } = useLocale()

  const [hamburgerOpen, setHamburgerOpen] = useState(false)
  const panelRef = useRef(null)

  const toggleHamburger = useCallback(() => setHamburgerOpen((p) => !p), [])
  const closeHamburger = useCallback(() => setHamburgerOpen(false), [])

  useEffect(() => {
    if (!hamburgerOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [hamburgerOpen])

  useEffect(() => {
    if (!hamburgerOpen) return
    const timer = setTimeout(() => {
      const focusables = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      focusables?.[0]?.focus()
    }, 0)
    return () => clearTimeout(timer)
  }, [hamburgerOpen])

  useEffect(() => {
    if (!hamburgerOpen) return

    const onKeyDown = (event) => {
      if (!hamburgerOpen) return
      if (event.key === 'Escape') {
        event.preventDefault()
        closeHamburger()
      } else if (event.key === 'Tab') {
        const list = panelRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!list || list.length === 0) return
        const first = list[0]
        const last = list[list.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [hamburgerOpen, closeHamburger])

  const isAdmin = user?.role === 'admin' || user?.role === 'jadmin'

  const fmt = useCallback(
    (value) => (typeof value === 'number' ? value.toLocaleString(locale) : value),
    [locale]
  )

  const levelDisplay = user?.level ?? 1
  const experienceDisplay =
    Number.isFinite(user?.experience) && user?.experience >= 0 ? user.experience : 0
  const progress = user ? getLevelProgress(levelDisplay, experienceDisplay) : null

  const navLinks = [
    { href: '/game', label: t('navbar.links.game'), icon: Gamepad2 },
    { href: '/rewards', label: t('navbar.links.rewards'), icon: Gift },
    { href: '/rankings', label: t('navbar.links.rankings'), icon: Medal },
  ]

  return (
    <>
      <nav className='sticky top-0 z-40 border-b border-white/10 bg-[#070b1f]/80 backdrop-blur-xl shadow-[0_32px_120px_-48px_rgba(15,23,42,0.85)] supports-[backdrop-filter]:bg-[#070b1f]/70'>
        <div className='relative isolate overflow-visible'>
          <div
            className='pointer-events-none absolute -left-32 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full bg-rose-500/20 blur-3xl'
            aria-hidden='true'
          />
          <div
            className='pointer-events-none absolute left-1/2 -top-24 h-40 w-40 -translate-x-1/2 rounded-full bg-indigo-500/15 blur-[90px]'
            aria-hidden='true'
          />
          <div
            className='pointer-events-none absolute -right-28 bottom-[-3rem] h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl'
            aria-hidden='true'
          />
          <div className='mx-auto flex h-24 w-full max-w-[88rem] items-center justify-between px-4 sm:px-6 lg:px-10'>
          <div className='flex h-full items-center gap-8'>
            <Link
              href='/'
              className='group relative inline-flex items-center gap-5 rounded-[2.75rem] border border-transparent bg-transparent px-3 py-2.5 pr-6 transition duration-300 hover:border-indigo-400/40 hover:bg-white/5'
            >
              <span className='relative flex h-14 w-14 items-center justify-center transition duration-300 group-hover:scale-[1.03]'>
                <Image
                  src='/logo/logo.png'
                  alt='CASI4F'
                  width={56}
                  height={56}
                  priority
                  className='h-14 w-14 rounded-[1.5rem] object-contain drop-shadow-[0_18px_45px_rgba(15,23,42,0.45)]'
                />
              </span>
              <div className='flex flex-col justify-center'>
                <span className='text-base font-semibold uppercase tracking-[0.55em] text-slate-100 transition duration-300 group-hover:text-white'>
                  CASI4F
                </span>
                <span className='text-[10px] font-medium uppercase tracking-[0.38em] text-slate-500 transition duration-300 group-hover:text-slate-300'>
                  Online Casino
                </span>
              </div>
            </Link>

            <div className='hidden items-center gap-3 md:flex'>
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className='group relative flex h-16 w-28 flex-col items-center justify-center gap-1 rounded-3xl text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-400 transition duration-300 hover:text-white'
                >
                  <span className='relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0c1432] text-slate-200 shadow-[0_14px_35px_rgba(8,12,35,0.65)] transition duration-300 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:via-sky-500 group-hover:to-emerald-400'>
                    <Icon
                      className='h-5 w-5 text-slate-300 transition-colors duration-300 group-hover:text-white'
                      aria-hidden='true'
                    />
                  </span>
                  <span className='relative'>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className='flex h-full items-center gap-3'>
            {user ? (
              <>
                <NotificationBell />

                <div className='hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 shadow-[0_20px_45px_rgba(8,12,35,0.65)] sm:flex'>
                  <Link
                    href='/wallet'
                    className='inline-flex h-11 items-center gap-3 rounded-[1.75rem] bg-[#0b1432]/80 px-4 text-left text-sm text-emerald-200 transition duration-300 hover:bg-[#132250]'
                  >
                    <WalletBadgeIcon className='h-6 w-6' />
                    <div className='flex flex-col text-emerald-200'>
                      <span className='font-semibold' suppressHydrationWarning>
                        {t('navbar.walletButton.label')}: {fmt(balance)}
                      </span>
                      <span className='text-xs text-emerald-200/80' suppressHydrationWarning>
                        {t('navbar.walletButton.bank')}: {fmt(bank)}
                      </span>
                    </div>
                  </Link>
                </div>

                <button
                  onClick={toggleHamburger}
                  className='group relative flex items-center gap-2 rounded-full border border-white/10 bg-[#0b1432]/80 px-2.5 py-1.5 text-slate-200 transition duration-300 hover:border-indigo-400/60 hover:bg-[#13224c]'
                  aria-haspopup='dialog'
                  aria-expanded={hamburgerOpen}
                  aria-controls='nav-hamburger-panel'
                  type='button'
                >
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt='Avatar'
                    className='h-8 w-8 rounded-full border border-slate-700 object-cover transition group-hover:border-indigo-400'
                  />
                  {hamburgerOpen ? (
                    <X className='h-4 w-4 text-slate-300 transition duration-300 group-hover:text-white' />
                  ) : (
                    <Menu className='h-4 w-4 text-slate-300 transition duration-300 group-hover:text-white' />
                  )}
                </button>
              </>
            ) : (
              <>
                <div className='flex items-center gap-2'>
                  <Link
                    href='/login'
                    className='rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition duration-300 hover:border-indigo-400/60 hover:bg-white/10 hover:text-white'
                  >
                    {t('navbar.cta.login')}
                  </Link>
                  <Link
                    href='/register'
                    className='rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(99,102,241,0.45)] transition duration-300 hover:from-indigo-400 hover:via-violet-400 hover:to-fuchsia-400'
                  >
                    {t('navbar.cta.register')}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      </nav>

      {hamburgerOpen && (
        <button
          className='fixed inset-0 z-[50] bg-black/60 backdrop-blur-sm transition-opacity duration-200'
          onClick={closeHamburger}
          aria-label='Close menu overlay'
          type='button'
        />
      )}

      {user && (
        <aside
          id='nav-hamburger-panel'
          ref={panelRef}
          role='dialog'
          aria-modal='true'
          aria-label='User menu'
          className={`fixed top-0 right-0 z-[60] flex h-full w-64 flex-col border-l border-slate-800/60 bg-slate-950/95 text-white shadow-2xl outline-none transition-transform duration-300 ease-out ${
            hamburgerOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
          }`}
        >
          <div className='flex-shrink-0 border-b border-slate-800/60 p-5'>
            <div className='mb-3 flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='relative'>
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt='Avatar'
                    className='h-10 w-10 rounded-full border border-slate-700 object-cover ring-1 ring-indigo-500/40'
                  />
                  <div className='absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-gray-900 bg-green-500' />
                </div>
                <div>
                  <p className='text-sm font-semibold text-white'>{user.username}</p>
                  <p className='text-[11px] text-gray-400'>{user.email || t('navbar.menu.playerFallback')}</p>
                </div>
              </div>
              <button
                onClick={closeHamburger}
                aria-label='Close menu'
                type='button'
                className='rounded-lg p-1.5 transition hover:bg-white/10'
              >
                <X className='h-4 w-4 text-gray-400 transition hover:text-white' />
              </button>
            </div>
            <div className='mt-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-3'>
              <div className='flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-amber-200'>
                <span>
                  {t('navbar.level.label')} {levelDisplay}
                </span>
                <span>
                  {progress?.nextLevelExp
                    ? `${experienceDisplay} / ${progress.nextLevelExp} EXP`
                    : t('navbar.level.maxShort')}
                </span>
              </div>
              <div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-200/20'>
                <div
                  className='h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-white transition-all duration-300'
                  style={{ width: `${progress ? progress.percent : 0}%` }}
                />
              </div>
              {!progress?.nextLevelExp && (
                <p className='mt-1 text-[11px] text-amber-100/90'>{t('navbar.level.maxMessage')}</p>
              )}
            </div>
          </div>

          <div className='flex-1 overflow-y-auto'>
            <div className='space-y-1 p-3'>
              <div className='mb-2 space-y-1 md:hidden'>
                <Link
                  href='/game'
                  className='group flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-white'
                  onClick={closeHamburger}
                >
                  <Gamepad2 className='h-5 w-5 text-indigo-300' aria-hidden='true' />
                  <span className='text-sm font-medium'>{t('navbar.links.game')}</span>
                </Link>
                <Link
                  href='/rewards'
                  className='group flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-amber-300/50 hover:bg-amber-500/10 hover:text-white'
                  onClick={closeHamburger}
                >
                  <Gift className='h-5 w-5 text-amber-300' aria-hidden='true' />
                  <span className='text-sm font-medium'>{t('navbar.links.rewards')}</span>
                </Link>
                <Link
                  href='/rankings'
                  className='group flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-white'
                  onClick={closeHamburger}
                >
                  <Medal className='h-4 w-4 text-indigo-300' aria-hidden='true' />
                  <span className='text-sm font-medium'>{t('navbar.links.rankings')}</span>
                </Link>
                <div className='my-2 h-px bg-slate-800/60' />
              </div>

              <div className='px-3.5 py-1.5 text-xs uppercase tracking-wide text-slate-500'>
                {t('navbar.menu.navigationHeading')}
              </div>

              <Link
                href='/profile'
                className='group flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-indigo-500/10 hover:text-white'
                onClick={closeHamburger}
              >
                <img src='/symbols/profile.png' alt='' className='h-4 w-4 opacity-70 transition group-hover:opacity-100' />
                <span className='text-sm font-medium'>{t('navbar.links.profile')}</span>
              </Link>

              <Link
                href='/history'
                className='group flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white'
                onClick={closeHamburger}
              >
                <img src='/symbols/history.png' alt='' className='h-4 w-4 opacity-70 transition group-hover:opacity-100' />
                <span className='text-sm font-medium'>{t('navbar.links.history')}</span>
              </Link>

              <Link
                href='/settings'
                className='group flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white'
                onClick={closeHamburger}
              >
                <img src='/symbols/settings.png' alt='' className='h-4 w-4 opacity-70 transition group-hover:opacity-100' />
                <span className='text-sm font-medium'>{t('navbar.links.settings')}</span>
              </Link>

              <div className='my-2 h-px bg-slate-800/60' />

              {isAdmin && (
                <Link
                  href='/admin/pvp/health'
                  className='group flex items-center gap-2.5 rounded-2xl border border-purple-500/30 px-3.5 py-2.5 text-sm font-medium text-purple-200 transition hover:bg-purple-500/15'
                  onClick={closeHamburger}
                >
                  <span className='inline-flex h-4 w-4 items-center justify-center rounded bg-purple-600/30 text-[10px] font-bold text-purple-400'>
                    A
                  </span>
                  <span className='text-sm font-medium'>{t('navbar.menu.adminHealth')}</span>
                </Link>
              )}
            </div>
          </div>

          <div className='flex-shrink-0 border-t border-slate-800/60 bg-slate-950/95 p-3.5'>
            <button
              onClick={() => {
                logout()
                closeHamburger()
              }}
              className='group flex w-full items-center justify-center gap-2.5 rounded-2xl border border-transparent bg-gradient-to-r from-[#C72D63] via-[#C72D63] to-[#C72D63] px-3.5 py-2.5 text-sm font-medium text-slate-200 shadow-[0_10px_25px_rgba(199,45,99,0.25)] transition duration-200 hover:from-[#d63b72] hover:via-[#d63b72] hover:to-[#d63b72] hover:text-white hover:shadow-[0_14px_32px_rgba(199,45,99,0.35)]'
              type='button'
            >
              <LogOut className='h-4 w-4 text-current opacity-80 transition duration-200 group-hover:opacity-100' aria-hidden='true' />
              <span className='transition duration-200'>{t('navbar.menu.logout')}</span>
            </button>
          </div>
        </aside>
      )}
    </>
  )
}
