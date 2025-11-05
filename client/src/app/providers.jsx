// client/src/app/providers.jsx
'use client'

import { ThemeProvider } from 'next-themes'
import { UserProvider } from '../context/UserContext'
import { LocaleProvider } from '../context/LocaleContext'

export default function ClientProviders({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <LocaleProvider>
        <UserProvider>{children}</UserProvider>
      </LocaleProvider>
    </ThemeProvider>
  )
}
