'use client'

// client/src/components/Layout.jsx
import Navbar from './Navbar'
import Footer from './Footer'
import HelpWidget from './HelpWidget'

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">{children}</main>
      <Footer />
      <HelpWidget />
    </>
  )
}
