'use client'
import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Sparkles, Menu, X, Zap } from 'lucide-react'
import AuthModal from '@/components/ui/AuthModal'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Demo', href: '#demo' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login'|'signup'>('login')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const openAuth = (tab: 'login'|'signup') => { setAuthTab(tab); setAuthOpen(true) }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.21,0.47,0.32,0.98] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'backdrop-blur-xl bg-dark-900/80 border-b border-glass-border' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-9 h-9 rounded-xl bg-brand-red flex items-center justify-center shadow-red-glow-sm"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <span className="font-display font-bold text-lg">
                <span className="text-white">ShortsAI</span>
                <span className="text-brand-red"> Studio</span>
              </span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <a key={link.label} href={link.href}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-glass transition-all duration-200">
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => openAuth('login')} className="btn-ghost text-sm">Sign In</button>
              <motion.button
                onClick={() => openAuth('signup')}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="btn-primary text-sm py-2"
              >
                <Zap className="w-4 h-4" />
                Start Free
              </motion.button>
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden btn-ghost p-2">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass-card m-3 mt-0 rounded-2xl p-4 space-y-2"
          >
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm text-white/70 hover:text-white rounded-xl hover:bg-glass transition-all">
                {link.label}
              </a>
            ))}
            <div className="divider my-2" />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => openAuth('login')} className="btn-secondary text-sm py-2.5 justify-center">Sign In</button>
              <button onClick={() => openAuth('signup')} className="btn-primary text-sm py-2.5 justify-center">Start Free</button>
            </div>
          </motion.div>
        )}
      </motion.nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
    </>
  )
}
