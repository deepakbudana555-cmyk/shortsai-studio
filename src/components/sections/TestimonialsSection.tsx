'use client'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/animations'

const TESTIMONIALS = [
  {
    name: 'Rahul Sharma',
    handle: '@rahulcreates',
    role: 'YouTuber · 2.1M subscribers',
    avatar: 'RS',
    avatarBg: 'from-brand-red to-orange-500',
    rating: 5,
    text: 'ShortsAI Studio changed my entire workflow. I upload one 2-hour podcast and get 15 viral-ready Shorts in minutes. My channel went from 500K to 2.1M subs in 6 months. Absolutely insane ROI.',
    platform: 'YouTube',
    growth: '+320% views',
  },
  {
    name: 'Priya Kapoor',
    handle: '@priyalifestyle',
    role: 'Instagram Creator · 890K followers',
    avatar: 'PK',
    avatarBg: 'from-pink-500 to-purple-500',
    rating: 5,
    text: 'The Hindi caption feature is a game-changer for Indian creators. Auto-reframing is perfect every time, and the viral score really does predict which clips will blow up. 10/10.',
    platform: 'Instagram',
    growth: '+180% reach',
  },
  {
    name: 'Amit Verma',
    handle: '@amitbusiness',
    role: 'Business Coach · TikTok Creator',
    avatar: 'AV',
    avatarBg: 'from-blue-500 to-cyan-500',
    rating: 5,
    text: 'I was spending 3 hours a day editing Shorts manually. Now it takes 15 minutes total. The AI detects the best moments from my interviews better than I could manually.',
    platform: 'TikTok',
    growth: '+2.5M views/mo',
  },
  {
    name: 'Sarah Mitchell',
    handle: '@sarahfitness',
    role: 'Fitness Influencer · 1.4M followers',
    avatar: 'SM',
    avatarBg: 'from-green-500 to-teal-500',
    rating: 5,
    text: 'The thumbnail generator alone is worth the subscription. Every thumbnail it creates outperforms my old manually-made ones by at least 40% CTR. My revenue doubled in 3 months.',
    platform: 'YouTube',
    growth: '+40% CTR',
  },
  {
    name: 'Vikram Singh',
    handle: '@vikramnews',
    role: 'News Creator · 3.8M subscribers',
    avatar: 'VS',
    avatarBg: 'from-amber-500 to-orange-500',
    rating: 5,
    text: 'We process 8+ hours of news footage daily. ShortsAI handles it all — clipping, captions, thumbnails, and publishing. Our team of 2 now does the work of 10 editors.',
    platform: 'Multi-platform',
    growth: '10x output',
  },
  {
    name: 'Ananya Gupta',
    handle: '@ananyacooks',
    role: 'Food Creator · 620K followers',
    avatar: 'AG',
    avatarBg: 'from-violet-500 to-purple-500',
    rating: 5,
    text: 'My cooking long-form videos are now repurposed into 10 recipe Shorts automatically. The AI even detects the most satisfying moments like plating and cutting. So smart!',
    platform: 'Instagram + TikTok',
    growth: '+95% engagement',
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-15 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <div className="section-tag mb-6 mx-auto">
            <Star className="w-3.5 h-3.5" />
            Creator Stories
          </div>
          <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">
            Loved by{' '}
            <span className="gradient-text">180,000+</span>{' '}
            Creators
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            From solo YouTubers to media agencies — see how ShortsAI Studio is transforming content creation.
          </p>
        </FadeIn>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <StaggerItem key={t.name}>
              <motion.div
                whileHover={{ y: -4 }}
                className="glass-card-hover p-7 h-full flex flex-col gap-5"
              >
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-brand-red/40 flex-shrink-0" />

                {/* Text */}
                <p className="text-sm text-white/65 leading-relaxed flex-1">"{t.text}"</p>

                {/* Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, si) => (
                    <Star key={si} className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  ))}
                </div>

                <div className="divider" />

                {/* Author */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.avatarBg} flex items-center justify-center text-sm font-black text-white flex-shrink-0`}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-white/40">{t.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="badge-green text-[10px]">{t.growth}</div>
                    <div className="text-[10px] text-white/30 mt-1">{t.platform}</div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* Trust bar */}
        <FadeIn delay={0.3}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-16">
            {[
              { value: '4.9★', label: 'App Store Rating' },
              { value: '180K+', label: 'Active Creators' },
              { value: '4.2M+', label: 'Shorts Generated' },
              { value: '99.9%', label: 'Uptime SLA' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display font-black text-2xl text-white">{s.value}</div>
                <div className="text-xs text-white/35 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
