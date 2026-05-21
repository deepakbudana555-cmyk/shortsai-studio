'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'login' | 'signup'
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState<'login'|'signup'>(defaultTab)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-md glass-card p-8 z-10"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Glow */}
            <div className="absolute -top-px left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-brand-red to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-lg">ShortsAI Studio</span>
              </div>
              <button onClick={onClose} className="btn-ghost p-2 rounded-xl">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-dark-700 rounded-xl p-1 mb-8">
              {(['login','signup'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
                    tab === t ? 'bg-brand-red text-white shadow-red-glow-sm' : 'text-white/50 hover:text-white'
                  }`}
                >{t === 'login' ? 'Sign In' : 'Create Account'}</button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'signup' && (
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input className="input-field pl-10" type="text" placeholder="Full name" required />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input className="input-field pl-10" type="email" placeholder="Email address" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input className="input-field pl-10 pr-10" type={showPass ? 'text' : 'password'} placeholder="Password" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {tab === 'login' && (
                <div className="text-right">
                  <button type="button" className="text-xs text-brand-red hover:text-brand-red-light transition-colors">Forgot password?</button>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="btn-primary w-full justify-center text-base mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 spinner" />
                ) : (
                  <>
                    {tab === 'login' ? 'Sign In' : 'Start Creating Free'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="divider" />
              <span className="text-xs text-white/30 whitespace-nowrap">or continue with</span>
              <div className="divider" />
            </div>

            {/* OAuth */}
            <div className="grid grid-cols-2 gap-3">
              {['Google','GitHub'].map(p => (
                <button key={p} className="btn-secondary justify-center text-sm py-2.5">
                  {p === 'Google' ? '🇬' : '⚫'} {p}
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-white/30 mt-6">
              By continuing, you agree to our{' '}
              <span className="text-brand-red cursor-pointer">Terms</span> and{' '}
              <span className="text-brand-red cursor-pointer">Privacy Policy</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
