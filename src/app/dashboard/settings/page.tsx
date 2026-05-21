'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Download, Key, Crown, Save, Eye, EyeOff, Check } from 'lucide-react'

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState('')
  const [geminiKey, setGeminiKey] = useState('')
  const [showOAI, setShowOAI] = useState(false)
  const [showGem, setShowGem] = useState(false)
  const [saved, setSaved] = useState(false)
  const [notifs, setNotifs] = useState({ email: true, push: false, export: true, viral: true })
  const [watermark, setWatermark] = useState(false)
  const [quality, setQuality] = useState('1080×1920 Full HD')

  const handleSave = () => {
    if (openaiKey) localStorage.setItem('openai_key', openaiKey)
    if (geminiKey) localStorage.setItem('gemini_key', geminiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const SECTIONS = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'export', icon: Download, label: 'Export Defaults' },
    { id: 'api', icon: Key, label: 'API Keys' },
    { id: 'billing', icon: Crown, label: 'Billing' },
  ]
  const [active, setActive] = useState('profile')

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl">
      <h1 className="font-display font-black text-2xl text-white">Settings</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0 space-y-1">
          {SECTIONS.map(s => {
            const Icon = s.icon
            return (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${active===s.id?'bg-brand-red/15 border border-brand-red/40 text-brand-red font-semibold':'text-white/50 hover:text-white hover:bg-glass'}`}>
                <Icon className="w-4 h-4" />{s.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 glass-card p-6 space-y-5">
          {active === 'profile' && (
            <>
              <p className="text-sm font-bold text-white">Profile Settings</p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-red to-orange-500 flex items-center justify-center text-xl font-black cursor-pointer hover:ring-2 ring-brand-red/50 transition-all">R</div>
                <button className="btn-secondary text-xs py-2">Change Avatar</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><label className="text-xs text-white/40">Full Name</label><input className="input-field w-full text-sm" defaultValue="Creator" /></div>
                <div className="space-y-1.5"><label className="text-xs text-white/40">Email</label><input className="input-field w-full text-sm" defaultValue="creator@shortsai.studio" /></div>
                <div className="space-y-1.5"><label className="text-xs text-white/40">Username</label><input className="input-field w-full text-sm" defaultValue="@shortsai_creator" /></div>
                <div className="space-y-1.5"><label className="text-xs text-white/40">Channel / Niche</label><input className="input-field w-full text-sm" placeholder="e.g. Motivational, Finance..." /></div>
              </div>
            </>
          )}

          {active === 'notifications' && (
            <>
              <p className="text-sm font-bold text-white">Notification Preferences</p>
              {([['email','Email Notifications','Get notified via email'],['push','Push Notifications','Browser push alerts'],['export','Export Complete','Alert when your video is ready'],['viral','Viral Detection','Alert when AI finds viral moments']] as const).map(([key, label, desc]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-glass-border last:border-0">
                  <div><p className="text-sm text-white font-medium">{label}</p><p className="text-xs text-white/35 mt-0.5">{desc}</p></div>
                  <button onClick={() => setNotifs(p => ({ ...p, [key]: !p[key] }))}
                    className={`w-11 h-6 rounded-full transition-all ${notifs[key]?'bg-brand-red':'bg-dark-400'}`}>
                    <div className="w-4 h-4 rounded-full bg-white mt-1 shadow-sm transition-all" style={{ marginLeft: notifs[key] ? 26 : 4 }} />
                  </button>
                </div>
              ))}
            </>
          )}

          {active === 'export' && (
            <>
              <p className="text-sm font-bold text-white">Export Defaults</p>
              <div className="space-y-1.5"><label className="text-xs text-white/40">Default Quality</label>
                <select className="input-field text-sm w-full" value={quality} onChange={e => setQuality(e.target.value)}>
                  {['1080×1920 Full HD','720p HD','480p Standard'].map(q => <option key={q}>{q}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-white/40">Default Platforms</p>
                {['YouTube Shorts','Instagram Reels','TikTok','Facebook Reels'].map(p => (
                  <label key={p} className="flex items-center gap-3 cursor-pointer py-1">
                    <input type="checkbox" defaultChecked={p !== 'Facebook Reels'} className="w-4 h-4 accent-brand-red" />
                    <span className="text-sm text-white/70">{p}</span>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between py-3 border-t border-glass-border">
                <div><p className="text-sm text-white">ShortsAI Watermark</p><p className="text-xs text-white/35">Show watermark on free plan exports</p></div>
                <button onClick={() => setWatermark(!watermark)} className={`w-11 h-6 rounded-full transition-all ${watermark?'bg-brand-red':'bg-dark-400'}`}>
                  <div className="w-4 h-4 rounded-full bg-white mt-1 shadow-sm transition-all" style={{ marginLeft: watermark ? 26 : 4 }} />
                </button>
              </div>
            </>
          )}

          {active === 'api' && (
            <>
              <p className="text-sm font-bold text-white">API Keys</p>
              <p className="text-xs text-white/40 leading-relaxed">Add your own API keys for unlimited AI processing. Keys are stored locally in your browser only.</p>
              {[['OpenAI API Key (GPT-4 + Whisper)', openaiKey, setOpenaiKey, showOAI, setShowOAI, 'sk-...'],
                ['Google Gemini API Key', geminiKey, setGeminiKey, showGem, setShowGem, 'AIza...']].map(([label, val, setter, show, setShow, placeholder]: any) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-xs text-white/40">{label}</label>
                  <div className="relative">
                    <input type={show ? 'text' : 'password'} value={val} onChange={e => setter(e.target.value)}
                      placeholder={placeholder} className="input-field w-full text-sm pr-10" />
                    <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {active === 'billing' && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-white">Billing & Plan</p>
              <div className="glass-card border-glass-border p-5 flex items-center justify-between">
                <div><p className="font-bold text-white">Free Plan</p><p className="text-xs text-white/40 mt-1">5 videos/month · 720p export · Watermark</p></div>
                <span className="badge-blue">Current</span>
              </div>
              <div className="glass-card border-brand-red/30 bg-brand-red/5 p-5 flex items-center justify-between">
                <div><div className="flex items-center gap-2 mb-1"><Crown className="w-4 h-4 text-brand-red" /><p className="font-bold text-white">Creator Plan</p></div><p className="text-xs text-white/40">Unlimited videos · 1080p HD · No watermark · Priority AI</p></div>
                <div className="text-right"><p className="text-xl font-black text-brand-red">₹999<span className="text-sm font-normal text-white/40">/mo</span></p><button className="btn-primary text-xs py-1.5 px-3 mt-2">Upgrade Now</button></div>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-glass-border flex justify-end">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSave}
              className={`flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl font-semibold transition-all ${saved?'bg-green-500/20 border border-green-500/40 text-green-400':'btn-primary'}`}>
              {saved ? <><Check className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save Changes</>}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
