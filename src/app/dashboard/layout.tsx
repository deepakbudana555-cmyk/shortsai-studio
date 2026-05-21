'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, LayoutDashboard, Video, Scissors, MessageSquare, Image, BarChart3,
  Settings, HelpCircle, LogOut, ChevronLeft, ChevronRight, Bell, Search, Plus, Crown, Wand2
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Video, label: 'My Videos', href: '/dashboard/videos' },
  { icon: Scissors, label: 'Studio', href: '/dashboard/studio' },
  { icon: Wand2, label: 'Text to Video', href: '/dashboard/text-to-video', badge: 'NEW' },
  { icon: MessageSquare, label: 'Captions', href: '/dashboard/captions' },
  { icon: Image, label: 'Thumbnails', href: '/dashboard/thumbnails' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
]

const BOTTOM_NAV = [
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  { icon: HelpCircle, label: 'Help & Support', href: '/dashboard/help' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: [0.21,0.47,0.32,0.98] }}
        className="flex-shrink-0 h-full border-r border-glass-border bg-dark-800/60 backdrop-blur-xl flex flex-col relative z-20"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-glass-border flex-shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-brand-red flex items-center justify-center flex-shrink-0 shadow-red-glow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="font-display font-bold text-base whitespace-nowrap"
              >
                ShortsAI <span className="text-brand-red">Studio</span>
              </motion.span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={`sidebar-link ${active ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}>
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                  {!collapsed && (item as any).badge && (
                    <span className="text-[9px] font-bold bg-brand-red text-white px-1.5 py-0.5 rounded-full">{(item as any).badge}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Upgrade banner */}
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-3 mb-3">
            <div className="glass-card border-brand-red/25 p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-brand-red" />
                <span className="text-xs font-bold text-white">Upgrade to Creator</span>
              </div>
              <p className="text-[11px] text-white/45 leading-snug">Unlock unlimited shorts, HD export & more.</p>
              <button className="btn-primary w-full justify-center text-xs py-2">Upgrade Now</button>
            </div>
          </motion.div>
        )}

        {/* Bottom */}
        <div className="p-3 border-t border-glass-border space-y-1">
          {BOTTOM_NAV.map(item => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <div className={`sidebar-link ${collapsed ? 'justify-center px-2' : ''}`}>
                  <Icon style={{ width: 18, height: 18 }} className="flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </Link>
            )
          })}
          <div className={`sidebar-link ${collapsed ? 'justify-center px-2' : ''} text-red-400 hover:text-red-300 hover:bg-red-500/10`}>
            <LogOut style={{ width: 18, height: 18 }} className="flex-shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-20 w-7 h-7 rounded-full bg-dark-600 border border-glass-border flex items-center justify-center text-white/50 hover:text-white hover:border-brand-red/40 transition-all duration-200 z-30"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-glass-border bg-dark-800/40 backdrop-blur-xl flex items-center px-6 gap-4 flex-shrink-0">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input className="input-field pl-9 py-2 text-sm" placeholder="Search projects, clips..." />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="btn-primary text-sm py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              New Project
            </motion.button>
            <button className="relative w-9 h-9 rounded-xl glass-card flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-red" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-red to-orange-500 flex items-center justify-center text-sm font-black text-white cursor-pointer">
              R
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
