'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, X, Upload, Zap, Scissors, Download } from 'lucide-react'
import { FadeIn } from '@/components/ui/animations'

const STEPS = [
  { icon: Upload, num: '01', title: 'Upload Your Video', desc: 'Drop any video up to 4 hours — podcasts, interviews, lectures, news, vlogs.' },
  { icon: Zap, num: '02', title: 'AI Analyzes Instantly', desc: 'Our AI detects viral moments, emotional peaks, trending hooks, and scores each segment.' },
  { icon: Scissors, num: '03', title: 'Auto-Creates Shorts', desc: 'Smart reframing to 9:16, face tracking, animated captions, and audio enhancement applied.' },
  { icon: Download, num: '04', title: 'One-Click Export', desc: 'Export HD Shorts directly to YouTube, TikTok, Instagram, and Facebook in seconds.' },
]

export default function DemoSection() {
  const [playing, setPlaying] = useState(false)

  return (
    <section id="demo" className="py-28 relative overflow-hidden">
      {/* Subtle glow bg */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <div className="section-tag mb-6 mx-auto">
            <Play className="w-3.5 h-3.5" />
            See It In Action
          </div>
          <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">
            From Upload to Viral{' '}
            <span className="gradient-text">in 60 Seconds</span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Watch how ShortsAI Studio transforms a 1-hour podcast into 12 viral-ready shorts automatically.
          </p>
        </FadeIn>

        {/* Process Steps */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <FadeIn key={step.num} delay={i * 0.1}>
                <div className="glass-card-hover p-5 text-center space-y-3 relative">
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="absolute top-1/2 -right-2 w-4 h-px bg-gradient-to-r from-brand-red/50 to-transparent hidden lg:block" />
                  )}
                  <div className="relative inline-flex">
                    <div className="w-12 h-12 rounded-2xl bg-brand-red/15 border border-brand-red/25 flex items-center justify-center mx-auto">
                      <Icon className="w-5 h-5 text-brand-red" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-red text-white text-[10px] font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-white mb-1.5">{step.title}</h3>
                    <p className="text-xs text-white/45 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>

        {/* Video Player */}
        <FadeIn>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-brand-red/10 blur-3xl rounded-3xl scale-95 pointer-events-none" />
            <div className="relative glass-card overflow-hidden rounded-3xl border-dark-300/40" style={{ aspectRatio: '16/9' }}>
              {!playing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-dark-700 to-dark-900">
                  {/* Fake video bg pattern */}
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <div className="absolute inset-0 bg-gradient-to-br from-dark-800/80 via-transparent to-brand-red/5" />

                  {/* Waveform decoration */}
                  <div className="flex items-end gap-1 mb-8 h-12 opacity-30">
                    {[4,8,12,7,16,10,6,14,9,5,12,8,16,11,7,13,8,5,10,14,7,9,12,6].map((h, i) => (
                      <div key={i} className="wave-bar" style={{ height: `${h}px`, animationDelay: `${i * 0.08}s` }} />
                    ))}
                  </div>

                  <motion.button
                    onClick={() => setPlaying(true)}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 rounded-full bg-brand-red/30 animate-ping scale-150" />
                    <div className="relative w-20 h-20 rounded-full bg-brand-red shadow-red-glow flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-current ml-1" />
                    </div>
                  </motion.button>

                  <p className="mt-6 text-sm text-white/40 relative z-10">Click to watch the demo</p>

                  {/* Duration badge */}
                  <div className="absolute bottom-4 right-4 badge badge-red text-xs">2:35 min demo</div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 spinner mx-auto" style={{ width: 48, height: 48 }} />
                    <p className="text-white/50 text-sm">Loading demo video…</p>
                    <button onClick={() => setPlaying(false)} className="btn-ghost text-xs flex items-center gap-1 mx-auto">
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
