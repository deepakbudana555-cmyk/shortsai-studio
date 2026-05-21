'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wand2, Download, Type, AlignLeft } from 'lucide-react'

const STYLES = [
  { name: 'Bold Impact', cls: 'font-black text-white', outline: true },
  { name: 'Yellow Gold', cls: 'font-black text-yellow-400', outline: true },
  { name: 'Clean White', cls: 'font-semibold text-white', outline: false },
  { name: 'Red Highlight', cls: 'font-black text-brand-red', outline: false },
]
const SEGMENTS = [
  { time: '0:02', text: "Success doesn't happen overnight…" },
  { time: '0:05', text: "It's the result of consistent daily action." },
  { time: '0:08', text: '…every single morning you choose. 🔥' },
  { time: '0:12', text: 'The most successful people in the world' },
  { time: '0:16', text: "didn't get there by accident." },
]
const SHORTS = [
  'Hook Moment – Opening Line',
  'Key Insight – Growth Secret',
  'Emotional Peak – The Struggle',
  'CTA – Call to Action',
]

export default function CaptionsPage() {
  const [selectedShort, setSelectedShort] = useState(0)
  const [captionStyle, setCaptionStyle] = useState(0)
  const [language, setLanguage] = useState<'EN'|'HI'|'Both'>('EN')
  const [fontSize, setFontSize] = useState(18)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display font-black text-2xl text-white">Caption Studio</h1>
        <p className="text-sm text-white/40 mt-1">Edit and style captions for each of your shorts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Short selector */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Your Shorts</p>
          {SHORTS.map((s, i) => (
            <button key={s} onClick={() => setSelectedShort(i)}
              className={`w-full text-left p-3 rounded-xl transition-all border text-sm ${i===selectedShort?'border-brand-red/60 bg-brand-red/10 text-white font-semibold':'glass-card text-white/60 hover:text-white hover:border-brand-red/30'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Style picker */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Caption Style</p>
              <button className="btn-primary text-xs py-1.5 px-3"><Wand2 className="w-3 h-3" />Re-generate</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STYLES.map((st, i) => (
                <button key={st.name} onClick={() => setCaptionStyle(i)}
                  className={`glass-card p-3 text-center border transition-all ${captionStyle===i?'border-brand-red/60 bg-brand-red/10':'border-glass-border hover:border-brand-red/30'}`}>
                  <div className={`text-sm mb-1 ${st.cls}`} style={st.outline?{textShadow:'1px 1px 0 #000'}:{}}>Aa</div>
                  <div className="text-[10px] text-white/40">{st.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Language + Size */}
          <div className="glass-card p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Language</p>
                <div className="flex gap-2">
                  {(['EN','HI','Both'] as const).map(l => (
                    <button key={l} onClick={() => setLanguage(l)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${language===l?'border-brand-red/60 bg-brand-red/15 text-brand-red':'border-glass-border text-white/40 hover:border-brand-red/30'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Font Size</p>
                  <span className="text-xs text-brand-red font-bold">{fontSize}px</span>
                </div>
                <input type="range" min={12} max={32} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="w-full" />
              </div>
            </div>
          </div>

          {/* Caption Timeline */}
          <div className="glass-card p-5 space-y-3">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Caption Timeline — {SHORTS[selectedShort]}</p>
            {SEGMENTS.map(seg => (
              <div key={seg.time} className="flex items-center gap-3 p-3 rounded-xl bg-dark-700/50 border border-glass-border group hover:border-brand-red/30 transition-all">
                <span className="text-[10px] font-mono text-brand-red w-8 flex-shrink-0">{seg.time}</span>
                <span className={`flex-1 text-sm ${STYLES[captionStyle].cls}`}
                  style={STYLES[captionStyle].outline?{textShadow:'1px 1px 0 rgba(0,0,0,0.5)'}:{}}>{seg.text}</span>
                <button className="text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Type className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Export buttons */}
          <div className="flex gap-3">
            <button className="btn-primary flex-1 justify-center py-3">
              <Download className="w-4 h-4" /> Export SRT
            </button>
            <button className="btn-secondary flex-1 justify-center py-3">
              <Download className="w-4 h-4" /> Export VTT
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
