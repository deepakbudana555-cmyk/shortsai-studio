'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, ChevronUp, Mail, Play, BookOpen, Upload, Download, Type, Key, CreditCard } from 'lucide-react'

const FAQS = [
  { q: 'How do I upload a video?', a: 'Go to Dashboard and click "Upload New Video" or drag and drop your video file into the upload zone. We support MP4, MOV, AVI, MKV up to any file size.' },
  { q: 'How long does AI processing take?', a: 'Processing typically takes 2–10 minutes depending on your video length. A 1-hour video usually takes about 5 minutes to fully analyze and generate shorts.' },
  { q: 'Can I add my own images to the shorts?', a: 'Yes! Open the Studio editor, click the "Scenes" tab in the right panel. Select any detected short and upload a custom image. You can adjust opacity, brightness, contrast, fit mode, and position.' },
  { q: 'What video formats are supported?', a: 'We support MP4, MOV, AVI, MKV, and WebM formats. For best results, upload in MP4 H.264 format. Maximum resolution: 4K. No time limit.' },
  { q: 'How do I export to YouTube/TikTok/Instagram?', a: 'In the Studio editor, click "Export" in the top bar or go to the Export tab. Select your platforms, set quality, and click Export. After rendering, download each short and upload manually to the platforms.' },
]

const GUIDES = [
  { icon: Upload, title: 'Upload Guide', desc: 'How to upload and prepare your video', color: 'from-brand-red to-orange-500' },
  { icon: BookOpen, title: 'Getting Started', desc: 'Complete beginner walkthrough', color: 'from-purple-600 to-blue-500' },
  { icon: Download, title: 'Export Guide', desc: 'Export to all platforms explained', color: 'from-green-500 to-teal-400' },
  { icon: Type, title: 'Caption Guide', desc: 'Styling and editing captions', color: 'from-pink-500 to-rose-500' },
  { icon: Key, title: 'API Setup', desc: 'Connect OpenAI and Gemini keys', color: 'from-amber-500 to-yellow-400' },
  { icon: CreditCard, title: 'Billing FAQ', desc: 'Plans, payments and upgrades', color: 'from-indigo-500 to-violet-600' },
]

const TUTORIALS = [
  { title: 'Quick Start — First Video in 5 Minutes', duration: '5:12', color: 'from-brand-red to-orange-500' },
  { title: 'Scene Image Replace Feature Tutorial', duration: '3:45', color: 'from-purple-600 to-blue-500' },
  { title: 'Caption Styling Masterclass', duration: '7:30', color: 'from-green-500 to-teal-400' },
  { title: 'Export & Publish to All Platforms', duration: '4:20', color: 'from-pink-500 to-rose-500' },
]

export default function HelpPage() {
  const [search, setSearch] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const filteredFaqs = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display font-black text-2xl text-white">Help & Support</h1>
        <p className="text-sm text-white/40 mt-1">Find answers, guides, and tutorials</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input className="input-field pl-12 py-3.5 text-sm w-full text-base" placeholder="Search help articles…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Quick links */}
      <div>
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Quick Guides</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {GUIDES.map(g => {
            const Icon = g.icon
            return (
              <motion.div key={g.title} whileHover={{ y: -2 }}
                className="glass-card-hover p-4 flex items-start gap-3 cursor-pointer">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{g.title}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{g.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
          Frequently Asked Questions {search && `— "${search}"`}
        </p>
        <div className="space-y-2">
          {filteredFaqs.length === 0 && (
            <p className="text-white/40 text-sm py-4">No results found. Try different keywords.</p>
          )}
          {filteredFaqs.map((faq, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-glass transition-all"
              >
                <span className="text-sm font-semibold text-white pr-4">{faq.q}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4 text-brand-red flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />}
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-glass-border">
                    <p className="p-4 text-sm text-white/60 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Video tutorials */}
      <div>
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Video Tutorials</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TUTORIALS.map(t => (
            <motion.div key={t.title} whileHover={{ scale: 1.02 }}
              className="relative rounded-2xl overflow-hidden cursor-pointer group" style={{ aspectRatio: '16/9' }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${t.color}`} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                </div>
                <p className="text-white font-bold text-center text-xs leading-snug" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.6)' }}>{t.title}</p>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-lg">{t.duration}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-white">Still need help?</p>
          <p className="text-sm text-white/40 mt-1">Our support team typically responds within 2 hours.</p>
        </div>
        <a href="mailto:support@shortsai.studio">
          <button className="btn-primary py-3 px-6 flex-shrink-0">
            <Mail className="w-4 h-4" /> Email Support
          </button>
        </a>
      </div>
    </motion.div>
  )
}
