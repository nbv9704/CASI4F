// client/src/components/LanguageSwitcher.jsx
'use client'

import { useMemo } from 'react'
import { useLocale } from '../context/LocaleContext'

export default function LanguageSwitcher({ compact = false, className = '' }) {
  const { language, setLanguage, t } = useLocale()

  const options = useMemo(
    () => ([
      { value: 'en', label: 'EN', title: t('navbar.language.english') },
      { value: 'vi', label: 'VI', title: t('navbar.language.vietnamese') },
    ]),
    [t]
  )

  return (
    <div
      className={`flex items-center rounded-lg border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase text-white/70 shadow-sm transition ${
        compact ? 'gap-1' : 'gap-1.5'
      } ${className}`.trim()}
      role="group"
      aria-label={t('navbar.language.label')}
    >
      {options.map((option) => {
        const active = option.value === language
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLanguage(option.value)}
            className={`rounded-md px-2 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
              active
                ? 'bg-white/90 text-slate-900 shadow'
                : 'text-white/70 hover:bg-white/10'
            }`}
            title={option.title}
            aria-pressed={active}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
