// client/src/components/Footer.jsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  Bird,
  Camera,
  MessageCircle,
  Radio,
  ThumbsUp,
  Youtube,
} from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import { useLocale } from '../context/LocaleContext'

const SOCIAL_LINKS = [
  { href: 'https://discord.gg/33K3jkY5NX', icon: MessageCircle, label: 'Discord' },
  { href: 'https://twitter.com/casi4f', icon: Bird, label: 'Twitter' },
  { href: 'https://www.instagram.com/', icon: Camera, label: 'Instagram' },
  { href: 'https://www.facebook.com/', icon: ThumbsUp, label: 'Facebook' },
]

export default function Footer() {
  const { t } = useLocale()
  const year = new Date().getFullYear()

  const sections = [
    {
      key: 'games',
      title: t('footer.sections.games.title'),
      links: [
        { href: '/game', label: t('footer.sections.games.links.catalog') },
        { href: '/game/solo', label: t('footer.sections.games.links.solo') },
        { href: '/game/battle', label: t('footer.sections.games.links.battle') },
        { href: '/rewards', label: t('footer.sections.games.links.rewards') },
        { href: '/rankings', label: t('footer.sections.games.links.rankings') },
      ],
    },
    {
      key: 'info',
      title: t('footer.sections.info.title'),
      links: [
        { href: '/history', label: t('footer.sections.info.links.history') },
        { href: '/notifications', label: t('footer.sections.info.links.notifications') },
        { href: '/profile', label: t('footer.sections.info.links.profile') },
        { href: '/settings', label: t('footer.sections.info.links.settings') },
        { href: '/wallet', label: t('footer.sections.info.links.wallet') },
      ],
    },
    {
      key: 'support',
      title: t('footer.sections.support.title'),
      links: [
        { href: '/legal/terms', label: t('footer.sections.support.links.terms') },
        { href: '/support/fair', label: t('footer.sections.support.links.provablyFair') },
        { href: '/legal/privacy', label: t('footer.sections.support.links.security') },
      ],
    },
  ]

  return (
    <footer className='relative mt-24 overflow-hidden border-t border-white/5 bg-[#070b1f] text-slate-200'>
      <div className='absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-[#070b1f] to-slate-900/60' aria-hidden='true' />
      <div className='absolute -left-40 top-0 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl' aria-hidden='true' />
      <div className='absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl' aria-hidden='true' />

  <div className='relative mx-auto flex w-full max-w-[88rem] flex-col gap-12 px-6 py-16 lg:px-10'>
        <div className='grid gap-10 lg:grid-cols-[minmax(0,2.25fr)_minmax(0,3fr)]'>
          <div className='space-y-6'>
            <div className='flex items-center gap-4'>
              <div className='relative flex h-16 w-16 items-center justify-center'>
                <Image
                  src='/logo/logo.png'
                  alt='CASI4F'
                  width={64}
                  height={64}
                  className='h-16 w-16 rounded-[1.75rem] object-contain drop-shadow-[0_18px_45px_rgba(15,23,42,0.45)]'
                />
              </div>
              <div>
                <p className='text-xl font-semibold uppercase tracking-[0.4em] text-white'>
                  CASI4F
                </p>
                <p className='text-sm uppercase tracking-[0.3em] text-slate-300'>
                  {t('footer.brand.tagline')}
                </p>
              </div>
            </div>
            <p className='max-w-xl text-sm text-slate-300/80'>
              {t('footer.brand.description')}
            </p>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
              <LanguageSwitcher compact className='bg-white/10 text-white' />
              <p className='text-xs text-slate-400'>
                {t('footer.brand.contact', { email: 'support@casi4f.com' })}
              </p>
            </div>
          </div>

          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {sections.map((section) => (
              <div key={section.key} className='space-y-3'>
                <p className='text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200'>
                  {section.title}
                </p>
                <ul className='space-y-2 text-sm text-slate-300'>
                  {section.links.map((link) => (
                    <li key={`${section.key}-${link.label}`}>
                      <Link
                        href={link.href}
                        className='transition hover:text-white'
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className='flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 px-6 py-5 shadow-[0_24px_60px_rgba(8,12,35,0.45)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm font-medium text-white/80'>
            {t('footer.social.heading')}
          </p>
          <div className='flex flex-wrap items-center gap-3'>
            {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
              <Link
                key={label}
                href={href}
                target='_blank'
                rel='noreferrer'
                className='flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white/80 transition hover:border-indigo-400/50 hover:bg-indigo-500/20 hover:text-white'
                aria-label={label}
              >
                <Icon className='h-5 w-5' aria-hidden='true' />
              </Link>
            ))}
          </div>
        </div>

        <div className='flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between'>
          <p>{t('footer.legal.copyright', { year })}</p>
        </div>
      </div>
    </footer>
  )
}
