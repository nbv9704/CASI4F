'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { Gamepad2, Gift, Home, Trophy, UserCircle2 } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'
import NotificationBell from './NotificationBell'

const FALLBACK_LABELS = {
  'navbar.mobile.home': 'Home',
  'navbar.links.game': 'Games',
  'navbar.links.rewards': 'Rewards',
  'navbar.links.rankings': 'Rankings',
  'navbar.links.profile': 'Profile',
  'navbar.links.collections': 'Collections',
}

const navItems = [
  { href: '/', icon: Home, labelKey: 'navbar.mobile.home', exact: true },
  { href: '/game', icon: Gamepad2, labelKey: 'navbar.links.game' },
  { href: '/rewards', icon: Gift, labelKey: 'navbar.links.rewards' },
  { href: '/rankings', icon: Trophy, labelKey: 'navbar.links.rankings' },
  { href: '/profile', icon: UserCircle2, labelKey: 'navbar.links.profile' },
]

function isActivePath(pathname, href, exact = false) {
  if (exact) {
    return pathname === href
  }
  if (pathname === href) return true
  return pathname.startsWith(`${href}/`)
}

export default function MobileNavBar() {
  const pathname = usePathname()
  const { t } = useLocale()

  const items = useMemo(
    () =>
      navItems.map((item) => {
        const value = t(item.labelKey)
        const label = typeof value === 'string' && value !== item.labelKey ? value : FALLBACK_LABELS[item.labelKey] || item.labelKey
        return { ...item, label }
      }),
    [t]
  )

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#070b1f]/90 p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] backdrop-blur-md md:hidden"
      aria-label={t('navbar.mobile.ariaLabel', { defaultValue: 'Main navigation' })}
    >
      <div className="flex items-center justify-around gap-1">
        {items.slice(0, 2).map(({ href, icon: Icon, label, exact }) => {
          const active = isActivePath(pathname, href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-[3.25rem] flex-1 flex-col items-center justify-center rounded-2xl px-2 text-xs font-medium tracking-[0.12em] transition ${
                active ? 'bg-indigo-500/20 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="mt-1 text-[11px]">{label}</span>
            </Link>
          )
        })}

        <NotificationBell
          variant="link"
          className="flex flex-1 justify-center"
          buttonClassName="min-h-[3.25rem] w-full bg-indigo-500/20 hover:bg-indigo-500/30"
        />
      </div>
      <div className="mt-2 flex items-center justify-around gap-1">
        {items.slice(2).map(({ href, icon: Icon, label, exact }) => {
          const active = isActivePath(pathname, href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-[3.25rem] flex-1 flex-col items-center justify-center rounded-2xl px-2 text-xs font-medium tracking-[0.12em] transition ${
                active ? 'bg-indigo-500/20 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="mt-1 text-[11px]">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
