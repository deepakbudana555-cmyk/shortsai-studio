'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Crown, Rocket, ArrowRight } from 'lucide-react'
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/animations'
import AuthModal from '@/components/ui/AuthModal'

const PLANS = [
  {
    name: 'Starter',
    icon: Zap,
    monthly: 0,
    yearly: 0,
    color: 'border-glass-border',
    badge: null,
    description: 'Perfect for trying out ShortsAI Studio.',
    features: [
      '5 videos/month',
      '10 minute max video length',
      '3 shorts per video',
      'Basic captions (English only)',
      'Standard export quality (720p)',
      '1GB cloud storage',
      'Community support',
    ],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Creator',
    icon: Crown,
    monthly: 29,
    yearly: 19,
    color: 'border-brand-red/50',
    badge: 'Most Popular',
    description: 'For serious content creators scaling their channel.',
    features: [
      '50 videos/month',
      'Up to 2 hours video length',
      'Unlimited shorts per video',
      'Hindi + English captions',
      '1080p Full HD export',
      'AI thumbnail generator',
      'Viral score predictor',
      'SEO tools & hashtags',
      '50GB cloud storage',
      'Priority support',
    ],
    cta: 'Start Creator Plan',
    highlight: true,
  },
  {
    name: 'Studio',
    icon: Rocket,
    monthly: 79,
    yearly: 59,
    color: 'border-purple-500/40',
    badge: 'Best Value',
    description: 'For agencies and power creators managing multiple brands.',
    features: [
      'Unlimited videos',
      'Up to 4 hours video length',
      'Unlimited shorts per video',
      'All languages supported',
      '4K export quality',
      'AI voice cloning',
      'Team collaboration (5 seats)',
      'Direct publish to all platforms',
      'White-label exports',
      'GPU-accelerated processing',
      '500GB cloud storage',
      'Dedicated account manager',
    ],
    cta: 'Start Studio Plan',
    highlight: false,
  },
]

export default function PricingSection() {
  const [yearly, setYearly] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <>
      <section id="pricing" className="py-28 relative">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <FadeIn className="text-center mb-16">
            <div className="section-tag mb-6 mx-auto">
              <Crown className="w-3.5 h-3.5" />
              Pricing Plans
            </div>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">
              Simple,{' '}
              <span className="gradient-text">Transparent</span>{' '}
              Pricing
            </h2>
            <p className="text-lg text-white/50 max-w-xl mx-auto mb-10">
              Start free. Scale as you grow. No hidden fees, cancel anytime.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-4 glass-card px-4 py-2.5 rounded-2xl">
              <span className={`text-sm font-semibold transition-colors ${!yearly ? 'text-white' : 'text-white/40'}`}>Monthly</span>
              <button
                onClick={() => setYearly(!yearly)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${yearly ? 'bg-brand-red' : 'bg-dark-400'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${yearly ? 'left-7' : 'left-1'}`} />
              </button>
              <span className={`text-sm font-semibold transition-colors ${yearly ? 'text-white' : 'text-white/40'}`}>
                Yearly
                <span className="ml-2 badge-green text-[10px]">Save 35%</span>
              </span>
            </div>
          </FadeIn>

          {/* Cards */}
          <StaggerChildren className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan, i) => {
              const Icon = plan.icon
              const price = yearly ? plan.yearly : plan.monthly
              return (
                <StaggerItem key={plan.name}>
                  <motion.div
                    whileHover={{ y: plan.highlight ? -4 : -2 }}
                    className={`glass-card p-8 border ${plan.color} relative ${plan.highlight ? 'shadow-premium' : ''}`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-brand-red to-transparent" />
                    )}
                    {plan.badge && (
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${plan.highlight ? 'badge-red' : 'badge-purple'} text-xs px-4 py-1`}>
                        {plan.badge}
                      </div>
                    )}

                    {/* Plan header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.highlight ? 'bg-brand-red shadow-red-glow-sm' : 'bg-dark-400 border border-glass-border'}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg text-white">{plan.name}</h3>
                        <p className="text-xs text-white/40">{plan.description}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-white/50 text-lg font-semibold">$</span>
                      <motion.span
                        key={price}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-display font-black text-5xl text-white"
                      >
                        {price}
                      </motion.span>
                      {price > 0 && <span className="text-white/40 text-sm mb-1.5">/mo</span>}
                    </div>
                    {yearly && price > 0 && (
                      <p className="text-xs text-green-400 mb-6">Billed annually · Save ${(plan.monthly - price) * 12}/yr</p>
                    )}
                    {price === 0 && <p className="text-xs text-white/30 mb-6">No credit card required</p>}

                    <div className="divider mb-6" />

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? 'bg-brand-red/20 border border-brand-red/40' : 'bg-dark-400 border border-glass-border'}`}>
                            <Check className={`w-2.5 h-2.5 ${plan.highlight ? 'text-brand-red' : 'text-white/50'}`} />
                          </div>
                          <span className="text-sm text-white/65">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => setAuthOpen(true)}
                      className={`w-full justify-center text-sm py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                        plan.highlight ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                </StaggerItem>
              )
            })}
          </StaggerChildren>

          {/* Enterprise note */}
          <FadeIn delay={0.3}>
            <div className="text-center mt-12 text-sm text-white/35">
              Need a custom plan?{' '}
              <span className="text-brand-red cursor-pointer hover:text-brand-red-light transition-colors">Contact us for Enterprise pricing →</span>
            </div>
          </FadeIn>
        </div>
      </section>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab="signup" />
    </>
  )
}
