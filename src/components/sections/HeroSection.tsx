'use client'
import { useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Zap, Play, Star, Users, TrendingUp, ArrowRight, Sparkles, ChevronDown } from 'lucide-react'
import { FadeIn, FloatAnimation, GlowPulse } from '@/components/ui/animations'
import AuthModal from '@/components/ui/AuthModal'

const ROTATING_WORDS = ['YouTube Shorts', 'Instagram Reels', 'TikTok Videos', 'Facebook Reels', 'Viral Content']

const STATS = [
  { icon: Users, value: '180K+', label: 'Creators' },
  { icon: TrendingUp, value: '4.2M+', label: 'Shorts Created' },
  { icon: Star, value: '4.9/5', label: 'Rating' },
]

export default function HeroSection() {
  const [authOpen, setAuthOpen] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)
  const [demoPlaying, setDemoPlaying] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setWordIndex(i => (i + 1) % ROTATING_WORDS.length), 2500)
    return () => clearInterval(t)
  }, [])

  return (
    <>
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 hero-gradient" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(229,25,42,0.25), transparent)' }} />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-red/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-brand-red/60"
            style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 20}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <FadeIn delay={0.1}>
            <motion.div
              className="inline-flex items-center gap-2.5 mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <div className="section-tag">
                <Zap className="w-3.5 h-3.5" />
                AI-Powered Video Studio
              </div>
              <div className="flex items-center gap-1.5 bg-dark-600/80 border border-glass-border rounded-full px-3 py-1.5 text-xs text-white/60">
                <span className="glow-dot animate-pulse" />
                Live · 180K creators
              </div>
            </motion.div>
          </FadeIn>

          {/* Headline */}
          <FadeIn delay={0.2}>
            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-none tracking-tight mb-6">
              <span className="block text-white">Turn Long Videos</span>
              <span className="block text-white">into Viral</span>
              <motion.span
                key={wordIndex}
                initial={{ opacity: 0, y: 20, rotateX: -30 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.21,0.47,0.32,0.98] }}
                className="block gradient-text text-glow"
              >
                {ROTATING_WORDS[wordIndex]}
              </motion.span>
            </h1>
          </FadeIn>

          {/* Subheading */}
          <FadeIn delay={0.3}>
            <p className="text-lg sm:text-xl text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload any video up to 4 hours. Our AI detects viral moments, auto-reframes to 9:16, generates captions in Hindi &amp; English, and exports HD Shorts in one click.
            </p>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <motion.button
                onClick={() => setAuthOpen(true)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="btn-primary text-base px-8 py-4 rounded-2xl"
              >
                <Sparkles className="w-5 h-5" />
                Start Creating Free
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => setDemoPlaying(true)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="btn-secondary text-base px-8 py-4 rounded-2xl group"
              >
                <div className="w-8 h-8 rounded-full bg-brand-red/20 border border-brand-red/40 flex items-center justify-center group-hover:bg-brand-red/30 transition-colors">
                  <Play className="w-3.5 h-3.5 text-brand-red fill-current ml-0.5" />
                </div>
                Watch Demo
              </motion.button>
            </div>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.5}>
            <div className="flex items-center justify-center gap-8 sm:gap-16 mb-20">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-display font-black text-white mb-1">{value}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* App Preview */}
          <FadeIn delay={0.6}>
            <div className="relative">
              {/* Glow behind preview */}
              <div className="absolute inset-0 bg-brand-red/10 blur-3xl rounded-3xl scale-90 pointer-events-none" />
              <GlowPulse>
                <div className="relative glass-card border-dark-300/50 overflow-hidden rounded-3xl p-2">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-glass-border mb-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/70" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                      <div className="w-3 h-3 rounded-full bg-green-500/70" />
                    </div>
                    <div className="flex-1 bg-dark-600 rounded-md h-5 mx-4 flex items-center px-3">
                      <span className="text-[10px] text-white/20">app.shortsai.studio/dashboard</span>
                    </div>
                  </div>

                  {/* Dashboard Preview */}
                  <DashboardPreview />
                </div>
              </GlowPulse>

              {/* Floating short previews */}
              <FloatAnimation className="absolute -right-8 top-8 hidden xl:block">
                <div className="glass-card p-3 rounded-2xl w-28 border-brand-red/20">
                  <div className="bg-dark-400 rounded-lg mb-2" style={{ aspectRatio: '9/16', maxHeight: 80 }} />
                  <div className="badge-red text-[10px] w-full justify-center">Viral 94%</div>
                </div>
              </FloatAnimation>

              <FloatAnimation className="absolute -left-8 bottom-12 hidden xl:block">
                <div className="glass-card p-3 rounded-2xl w-32 border-green-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-white/60">Processing…</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill w-3/4" /></div>
                  <span className="text-[10px] text-white/40">Auto-captioning</span>
                </div>
              </FloatAnimation>
            </div>
          </FadeIn>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/20"
            animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </section>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab="signup" />
    </>
  )
}

function DashboardPreview() {
  return (
    <div className="grid grid-cols-12 gap-2 p-2 bg-dark-800/50 rounded-2xl min-h-[300px] sm:min-h-[380px]">
      {/* Sidebar */}
      <div className="col-span-2 space-y-1.5 hidden sm:block">
        {['🏠','📹','✂️','💬','🖼️','📊'].map((icon, i) => (
          <div key={i} className={`h-8 rounded-lg flex items-center justify-center text-sm ${i === 1 ? 'bg-brand-red/20 border border-brand-red/30' : 'hover:bg-glass'}`}>
            {icon}
          </div>
        ))}
      </div>

      {/* Main area */}
      <div className="col-span-12 sm:col-span-7 space-y-2">
        {/* Upload zone placeholder */}
        <div className="h-40 sm:h-48 rounded-xl border-2 border-dashed border-glass-border flex flex-col items-center justify-center gap-2 bg-dark-700/30">
          <div className="w-10 h-10 rounded-xl bg-brand-red/20 border border-brand-red/30 flex items-center justify-center">
            <Play className="w-5 h-5 text-brand-red" />
          </div>
          <span className="text-xs text-white/40">Drop your video here</span>
          <div className="badge-red text-[10px]">Up to 4 hours · HD quality</div>
        </div>

        {/* Processing clips row */}
        <div className="grid grid-cols-3 gap-2">
          {[94, 87, 91].map((score, i) => (
            <div key={i} className="glass-card p-2 space-y-1.5 rounded-xl">
              <div className="bg-dark-400 rounded-lg" style={{ aspectRatio: '9/16', maxHeight: 60 }} />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40">Short {i+1}</span>
                <span className="text-[10px] font-bold text-brand-red">{score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="col-span-3 space-y-2 hidden sm:block">
        <div className="glass-card p-3 rounded-xl space-y-2">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">AI Analysis</span>
          {[['Viral Score','94%'],['Hook Quality','A+'],['Retention','87%']].map(([k,v]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="text-[10px] text-white/50">{k}</span>
              <span className="text-[10px] font-bold text-brand-red">{v}</span>
            </div>
          ))}
        </div>
        <div className="glass-card p-3 rounded-xl space-y-1.5">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Export To</span>
          {['YouTube Shorts','Instagram Reels','TikTok'].map(p => (
            <div key={p} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-red" />
              <span className="text-[10px] text-white/60">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
