'use client'
import { motion } from 'framer-motion'
import { Brain, Scissors, Captions, Image, Hash, Wand2, Mic, Video, Layers, Zap, Globe, BarChart3 } from 'lucide-react'
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/animations'

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Viral Detection',
    description: 'GPT-4 + Gemini AI analyzes your video to detect viral moments, emotional peaks, high-energy speech, and trending hooks automatically.',
    badge: 'Core AI',
    color: 'from-brand-red/20 to-brand-red/5',
    border: 'border-brand-red/25',
  },
  {
    icon: Scissors,
    title: 'Smart Auto-Clipping',
    description: 'Creates multiple shorts from one long video. AI predicts a viral potential score for each clip before you export.',
    badge: 'Auto',
    color: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/25',
  },
  {
    icon: Video,
    title: '9:16 Smart Reframing',
    description: 'YOLO-powered face tracking and speaker detection. Auto-zoom on the speaker. Cinematic transitions. Export in 1080×1920 Full HD.',
    badge: 'HD Quality',
    color: 'from-blue-500/20 to-blue-500/5',
    border: 'border-blue-500/25',
  },
  {
    icon: Captions,
    title: 'AI Caption System',
    description: 'Auto-generate animated Hindi & English subtitles via Whisper AI. Highlight key words, emoji support, and multiple stylish caption templates.',
    badge: 'Multilingual',
    color: 'from-green-500/20 to-green-500/5',
    border: 'border-green-500/25',
  },
  {
    icon: Image,
    title: 'Thumbnail Generator',
    description: 'AI detects the best facial expression from the clip and auto-adds bold YouTube-style text. Edit colors, fonts, and export in HD.',
    badge: 'High CTR',
    color: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/25',
  },
  {
    icon: Hash,
    title: 'Script & SEO Tools',
    description: 'AI generates viral titles, SEO descriptions, trending hashtags, clickbait hooks, and script suggestions in Hindi & English.',
    badge: 'SEO',
    color: 'from-pink-500/20 to-pink-500/5',
    border: 'border-pink-500/25',
  },
  {
    icon: Layers,
    title: 'Drag & Drop Studio',
    description: 'Full timeline editor. Trim, cut, merge, add watermarks, overlays, stickers, speed control, green screen, and background blur.',
    badge: 'Studio',
    color: 'from-cyan-500/20 to-cyan-500/5',
    border: 'border-cyan-500/25',
  },
  {
    icon: Mic,
    title: 'Voice & Audio AI',
    description: 'Noise reduction, voice enhancement, AI voice cloning, text-to-speech, and auto background music sync for perfect audio.',
    badge: 'Audio AI',
    color: 'from-orange-500/20 to-orange-500/5',
    border: 'border-orange-500/25',
  },
  {
    icon: Zap,
    title: 'One-Click Export',
    description: 'Direct upload to YouTube, Instagram, TikTok and Facebook. GPU-accelerated rendering for ultra-fast processing.',
    badge: 'Instant',
    color: 'from-brand-red/20 to-brand-red/5',
    border: 'border-brand-red/25',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Full Hindi and English support throughout the platform — captions, titles, descriptions, and UI in your language.',
    badge: 'Hindi + EN',
    color: 'from-teal-500/20 to-teal-500/5',
    border: 'border-teal-500/25',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track views, engagement, viral scores, export history, and team collaboration all in one beautiful dashboard.',
    badge: 'Analytics',
    color: 'from-indigo-500/20 to-indigo-500/5',
    border: 'border-indigo-500/25',
  },
  {
    icon: Wand2,
    title: 'B-Roll & Auto Chapters',
    description: 'AI suggests relevant B-roll footage, auto-generates video chapters, and creates content outlines from your long-form video.',
    badge: 'Smart',
    color: 'from-violet-500/20 to-violet-500/5',
    border: 'border-violet-500/25',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 relative">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn className="text-center mb-20">
          <div className="section-tag mb-6 mx-auto">
            <Zap className="w-3.5 h-3.5" />
            Powerful Features
          </div>
          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white mb-6">
            Everything You Need to Go{' '}
            <span className="gradient-text">Viral</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            From AI-powered clip detection to one-click publishing — ShortsAI Studio handles the entire short-form content workflow.
          </p>
        </FadeIn>

        {/* Feature Grid */}
        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <StaggerItem key={feature.title}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className={`glass-card p-6 h-full space-y-4 border ${feature.border} group cursor-default`}
                  style={{ background: `linear-gradient(135deg, ${feature.color.split(' ')[0].replace('from-','rgba(').replace('/20',',0.08)')} 0%, rgba(255,255,255,0.02) 100%)` }}
                >
                  <div className="flex items-start justify-between">
                    <div className={`feature-icon bg-gradient-to-br ${feature.color} border ${feature.border}`}>
                      <Icon className="w-5 h-5 text-white/80" />
                    </div>
                    <span className={`badge text-[10px] ${i % 3 === 0 ? 'badge-red' : i % 3 === 1 ? 'badge-purple' : 'badge-blue'}`}>
                      {feature.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white mb-2 group-hover:text-brand-red/90 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-white/45 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            )
          })}
        </StaggerChildren>
      </div>
    </section>
  )
}
