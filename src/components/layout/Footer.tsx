'use client'
import { motion } from 'framer-motion'
import { Sparkles, Twitter, Youtube, Instagram, Github, ArrowRight } from 'lucide-react'

const FOOTER_LINKS = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap', 'API Docs'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
  Support: ['Help Center', 'Discord Community', 'Status', 'Report a Bug'],
}

export default function Footer() {
  return (
    <footer className="border-t border-glass-border bg-dark-800/50 mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-red flex items-center justify-center shadow-red-glow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg">
                ShortsAI <span className="text-brand-red">Studio</span>
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              The world's most advanced AI video repurposing platform. Turn any long-form video into viral short-form content in minutes.
            </p>
            {/* Newsletter */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Stay Updated</p>
              <div className="flex gap-2">
                <input className="input-field flex-1 text-xs py-2" type="email" placeholder="Enter your email" />
                <button className="btn-primary text-xs py-2 px-3">
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Social */}
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: '#' },
                { icon: Youtube, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Github, href: '#' },
              ].map(({ icon: Icon, href }) => (
                <a key={href} href={href}
                  className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-white/50 hover:text-white hover:border-brand-red/40 transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section} className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">{section}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white/50 hover:text-white transition-colors duration-200">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© 2026 ShortsAI Studio. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-white/30">
              <span className="glow-dot w-1.5 h-1.5" />
              All systems operational
            </span>
            <span className="text-xs text-white/20">|</span>
            <span className="text-xs text-white/30">Made with ❤️ for creators</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
