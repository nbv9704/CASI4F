'use client'

// client/src/components/Layout.jsx
import Navbar from './Navbar'
import Footer from './Footer'
import HelpWidget from './HelpWidget'
import MobileNavBar from './MobileNavBar'

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 pb-32 pt-10 sm:px-6 sm:pb-24 lg:px-8 lg:pb-16">{children}</main>
      <Footer />
      <MobileNavBar />
      <HelpWidget />
    </>
  )
}
