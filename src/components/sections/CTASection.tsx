'use client'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Zap } from 'lucide-react'
import { useState } from 'react'
import { FadeIn } from '@/components/ui/animations'
import AuthModal from '@/components/ui/AuthModal'

export default function CTASection() {
  const [authOpen, setAuthOpen] = useState(false)
  return (
    <>
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-red/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <FadeIn>
            <motion.div
              animate={{ boxShadow: ['0 0 40px rgba(229,25,42,0.15)', '0 0 80px rgba(229,25,42,0.3)', '0 0 40px rgba(229,25,42,0.15)'] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="glass-card border-brand-red/20 p-14 rounded-3xl relative overflow-hidden"
            >
              <div className="absolute -top-px left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-brand-red to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-red/40 to-transparent" />

              <div className="section-tag mb-8 mx-auto">
                <Sparkles className="w-3.5 h-3.5" />
                Start Today — Free
              </div>

              <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-tight">
                Ready to Create Your{' '}
                <span className="gradient-text">Next Viral Short?</span>
              </h2>
              <p className="text-lg text-white/50 max-w-xl mx-auto mb-10">
                Join 180,000+ creators already using ShortsAI Studio. No credit card needed. Start free and upgrade when you're ready to scale.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => setAuthOpen(true)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  className="btn-primary text-lg px-10 py-4 rounded-2xl"
                >
                  <Zap className="w-5 h-5" />
                  Create My First Short — Free
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <button className="btn-secondary text-base px-8 py-4 rounded-2xl">
                  View Pricing →
                </button>
              </div>

              <p className="text-xs text-white/25 mt-8">
                ✓ No credit card &nbsp;·&nbsp; ✓ 5 free exports &nbsp;·&nbsp; ✓ Cancel anytime
              </p>
            </motion.div>
          </FadeIn>
        </div>
      </section>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab="signup" />
    </>
  )
}
