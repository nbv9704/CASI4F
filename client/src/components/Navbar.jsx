'use client'

// client/src/components/Navbar.jsx

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ChevronDown,
  Gamepad2,
  Gift,
  Medal,
  LogOut,
  UserCircle2,
  History,
  Package2,
  Settings2,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { useUser } from '../context/UserContext'
import { useLocale } from '../context/LocaleContext'
import NotificationBell from './NotificationBell'
import WalletBadgeIcon from './icons/WalletBadgeIcon'
import { getLevelProgress } from '../utils/level'
import { STATUS_OPTIONS } from '../app/profile/constants'

export default function Navbar() {
  const { user, balance, bank, logout } = useUser()
  const { locale, t } = useLocale()
  const pathname = usePathname()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    if (!menuOpen) return

    const handleClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        closeMenu()
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu()
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen, closeMenu])

  useEffect(() => {
    if (!menuOpen) return

    const focusables = menuRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusables?.[0]?.focus()
  }, [menuOpen])

  const isAdmin = user?.role === 'admin' || user?.role === 'jadmin'

  useEffect(() => {
    closeMenu()
  }, [pathname, closeMenu])

  const fmt = useCallback(
    (value) => (typeof value === 'number' ? value.toLocaleString(locale) : value),
    [locale]
  )

  const levelDisplay = user?.level ?? 1
  const experienceDisplay =
    Number.isFinite(user?.experience) && user?.experience >= 0 ? user.experience : 0
  const progress = user ? getLevelProgress(levelDisplay, experienceDisplay) : null

  const statusState = user?.statusState || 'online'
  const statusMessage = user?.statusMessage || ''
  const statusIndicatorClass =
    STATUS_OPTIONS.find((option) => option.value === statusState)?.indicator ||
    'bg-emerald-500'
  const statusLabel = t(`profile.status.states.${statusState}`)
  const statusDisplayText = statusMessage || statusLabel
  const statusDisplayClass = statusMessage ? 'text-indigo-200' : 'text-gray-300'

  const navLinks = [
    { href: '/game', label: t('navbar.links.game'), icon: Gamepad2 },
    { href: '/rewards', label: t('navbar.links.rewards'), icon: Gift },
    { href: '/rankings', label: t('navbar.links.rankings'), icon: Medal },
  ]

  const menuLinks = [
    { href: '/profile', label: t('navbar.links.profile'), icon: UserCircle2 },
    { href: '/collections', label: t('navbar.links.collections'), icon: Package2 },
    { href: '/friends', label: t('navbar.links.friends'), icon: Users },
    { href: '/history', label: t('navbar.links.history'), icon: History },
    { href: '/settings', label: t('navbar.links.settings'), icon: Settings2 },
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
          <div className='mx-auto flex h-20 w-full max-w-[88rem] items-center justify-between px-4 sm:px-6 md:h-24 lg:px-10'>
            <div className='flex h-full items-center gap-8'>
              <Link
                href='/'
                className='group relative inline-flex items-center gap-4 rounded-[2.25rem] border border-transparent bg-transparent px-2.5 py-2 pr-4 transition duration-300 hover:border-indigo-400/40 hover:bg-white/5 md:gap-5 md:rounded-[2.75rem] md:px-3 md:py-2.5 md:pr-6'
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
                  <span className='text-sm font-semibold uppercase tracking-[0.45em] text-slate-100 transition duration-300 group-hover:text-white md:text-base md:tracking-[0.55em]'>
                    CASI4F
                  </span>
                  <span className='text-[10px] font-medium uppercase tracking-[0.38em] text-slate-300 transition duration-300 group-hover:text-white'>
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
                      <Icon className='h-5 w-5 text-slate-300 transition-colors duration-300 group-hover:text-white' aria-hidden='true' />
                    </span>
                    <span className='relative'>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className='flex h-full items-center gap-3'>
              {user ? (
                <>
                  <NotificationBell className='hidden md:block' />

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

                  <div className='relative'>
                    <button
                      ref={buttonRef}
                      onClick={toggleMenu}
                      className='group flex items-center gap-2 rounded-full border border-white/10 bg-[#0b1432]/80 px-2 py-1.5 text-slate-200 transition duration-300 hover:border-indigo-400/60 hover:bg-[#13224c] md:px-2.5'
                      aria-haspopup='menu'
                      aria-expanded={menuOpen}
                      aria-controls='nav-user-menu'
                      type='button'
                    >
                      <img
                        src={user.avatar || '/default-avatar.png'}
                        alt='Avatar'
                        className='h-8 w-8 rounded-full border border-slate-700 object-cover transition group-hover:border-indigo-400'
                      />
                      <ChevronDown
                        className={`h-4 w-4 text-slate-300 transition duration-300 group-hover:text-white ${menuOpen ? 'rotate-180 text-white' : ''}`}
                        aria-hidden='true'
                      />
                    </button>

                    {menuOpen && (
                      <div
                        id='nav-user-menu'
                        ref={menuRef}
                        role='menu'
                        className='absolute right-0 z-50 mt-2 w-[18rem] origin-top-right rounded-3xl border border-white/10 bg-[#060b1f]/95 p-0.5 text-white shadow-[0_20px_52px_rgba(8,12,35,0.55)] backdrop-blur supports-[backdrop-filter]:bg-[#060b1f]/85'
                      >
                        <div className='rounded-3xl border border-white/10 bg-white/5 p-3'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                              <div>
                                <img
                                  src={user.avatar || '/default-avatar.png'}
                                  alt='Avatar'
                                  className='h-10 w-10 rounded-full border border-slate-700 object-cover ring-1 ring-indigo-500/40'
                                />
                              </div>
                              <div className='flex flex-col'>
                                <span className='text-sm font-semibold text-white'>{user.username}</span>
                                <span className={`mt-0.5 flex items-center gap-1 text-[11px] ${statusDisplayClass}`}>
                                  <span className={`inline-flex h-2 w-2 rounded-full ${statusIndicatorClass}`} />
                                  <span>{statusDisplayText}</span>
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={closeMenu}
                              aria-label='Close menu'
                              type='button'
                              className='rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white'
                            >
                              <X className='h-4 w-4' aria-hidden='true' />
                            </button>
                          </div>
                          <div className='mt-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-2.5'>
                            <div className='flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-amber-200'>
                              <span>
                                {t('navbar.level.label')} {levelDisplay}
                              </span>
                              <span>
                                {progress?.nextLevelExp
                                  ? `${experienceDisplay} / ${progress.nextLevelExp} EXP`
                                  : t('navbar.level.maxShort')}
                              </span>
                            </div>
                            <div className='mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-amber-200/20'>
                              <div
                                className='h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-white transition-all duration-300'
                                style={{ width: `${progress ? progress.percent : 0}%` }}
                              />
                            </div>
                            {!progress?.nextLevelExp && (
                              <p className='mt-1 text-[10px] text-amber-100/90'>
                                {t('navbar.level.maxMessage')}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className='max-h-[60vh] overflow-y-auto px-1.5 pb-2 pt-2.5'>
                          <div className='mb-2.5 space-y-1 md:hidden'>
                            {navLinks.map(({ href, label, icon: Icon }) => (
                              <Link
                                key={href}
                                href={href}
                                className='group flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-white'
                                onClick={closeMenu}
                                role='menuitem'
                              >
                                <Icon className='h-5 w-5 text-indigo-300' aria-hidden='true' />
                                <span className='text-sm font-medium'>{label}</span>
                              </Link>
                            ))}
                          </div>

                          <div className='space-y-1'>
                            {menuLinks.map(({ href, label, icon: Icon }) => (
                              <Link
                                key={href}
                                href={href}
                                className='group flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300 transition duration-300 hover:bg-white/10 hover:text-white'
                                onClick={closeMenu}
                                role='menuitem'
                              >
                                <span className='flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0c1432]/80 text-slate-200 shadow-[0_8px_20px_rgba(8,12,35,0.45)] transition duration-300 group-hover:bg-[#152450]'>
                                  <Icon className='h-4 w-4 text-slate-300 transition-colors duration-300 group-hover:text-white' aria-hidden='true' />
                                </span>
                                <span className='text-[11px] font-semibold uppercase tracking-[0.24em]'>
                                  {label}
                                </span>
                              </Link>
                            ))}
                          </div>

                          {isAdmin && (
                            <div className='mt-3'>
                              <Link
                                href='/admin'
                                className='group flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-purple-100 transition duration-300 hover:bg-purple-500/25'
                                onClick={closeMenu}
                                role='menuitem'
                              >
                                <span className='flex h-8 w-8 items-center justify-center rounded-2xl bg-purple-600/30 text-purple-100 shadow-[0_8px_20px_rgba(99,102,241,0.3)] transition duration-300 group-hover:bg-purple-500'>
                                  <ShieldCheck className='h-4 w-4 text-purple-200 transition-colors duration-300 group-hover:text-white' aria-hidden='true' />
                                </span>
                                <span className='text-[11px] font-semibold uppercase tracking-[0.24em]'>
                                  {t('navbar.menu.adminHealth')}
                                </span>
                              </Link>
                            </div>
                          )}
                        </div>

                        <div className='border-t border-white/10 p-2.5'>
                          <button
                            onClick={() => {
                              logout()
                              closeMenu()
                            }}
                            className='group flex w-full items-center justify-center gap-2 rounded-2xl border border-transparent bg-gradient-to-r from-[#C72D63] via-[#C72D63] to-[#C72D63] px-3 py-2 text-sm font-medium text-slate-200 shadow-[0_8px_20px_rgba(199,45,99,0.25)] transition duration-200 hover:from-[#d63b72] hover:via-[#d63b72] hover:to-[#d63b72] hover:text-white hover:shadow-[0_12px_26px_rgba(199,45,99,0.35)]'
                            type='button'
                          >
                            <LogOut className='h-4 w-4 text-current opacity-80 transition duration-200 group-hover:opacity-100' aria-hidden='true' />
                            <span className='transition duration-200'>{t('navbar.menu.logout')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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
    </>
  )
}
