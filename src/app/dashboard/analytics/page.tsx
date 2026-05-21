'use client'
import { motion } from 'framer-motion'
import { TrendingUp, Eye, Zap, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { getProjects, getStats } from '@/lib/projectStore'
import { useEffect, useState } from 'react'

const PLATFORMS = [
  { name: 'YouTube Shorts', icon: '▶', views: '42.3K', pct: 78, color: 'bg-red-500' },
  { name: 'Instagram Reels', icon: '📸', views: '28.1K', pct: 58, color: 'bg-pink-500' },
  { name: 'TikTok', icon: '🎵', views: '61.7K', pct: 92, color: 'bg-white' },
  { name: 'Facebook Reels', icon: 'f', views: '9.4K', pct: 31, color: 'bg-blue-500' },
]

const BARS = [65,80,45,90,70,55,88,62,75,85,50,78,92,68,83,45,70,88,60,95]

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ total: 0, totalShorts: 0, avgViral: 0, customImages: 0 })

  useEffect(() => {
    const { getStats, createDemoProjectIfEmpty } = require('@/lib/projectStore')
    createDemoProjectIfEmpty()
    setStats(getStats())
  }, [])

  const STAT_CARDS = [
    { label: 'Total Views', value: '141.5K', change: '+23% this week', up: true, icon: Eye, color: 'text-blue-400' },
    { label: 'Shorts Published', value: stats.totalShorts.toString() || '4', change: `${stats.total} projects`, up: true, icon: Zap, color: 'text-brand-red' },
    { label: 'Avg Viral Score', value: stats.avgViral ? `${stats.avgViral}%` : '88%', change: '+5% vs last month', up: true, icon: TrendingUp, color: 'text-amber-400' },
    { label: 'Engagement Rate', value: '6.4%', change: '-0.3% this week', up: false, icon: Users, color: 'text-green-400' },
  ]

  const TOP_SHORTS = [
    { title: 'Hook Moment – Opening Line', views: '38.2K', score: 94, platform: 'TikTok' },
    { title: 'Key Insight – Growth Secret', views: '27.4K', score: 87, platform: 'YouTube' },
    { title: 'Emotional Peak – The Struggle', views: '21.9K', score: 91, platform: 'Instagram' },
    { title: 'CTA – Call to Action', views: '18.3K', score: 83, platform: 'YouTube' },
    { title: 'Morning Routine Hack', views: '14.7K', score: 79, platform: 'TikTok' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-white">Analytics</h1>
          <p className="text-sm text-white/40 mt-1">Performance overview across all platforms</p>
        </div>
        <select className="input-field text-sm py-2">
          {['Last 7 days','Last 30 days','Last 90 days','All time'].map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">{s.label}</span>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className={`font-display font-black text-2xl ${s.color}`}>{s.value}</div>
              <div className={`flex items-center gap-1 text-xs ${s.up ? 'text-green-400' : 'text-red-400'}`}>
                {s.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {s.change}
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      <div className="glass-card p-6 space-y-4">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Daily Views — Last 20 Days</p>
        <div className="flex items-end gap-1.5 h-40">
          {BARS.map((h, i) => (
            <motion.div key={i}
              initial={{ height: 0 }} animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.03, duration: 0.5, ease: 'easeOut' }}
              className="flex-1 bg-gradient-to-t from-brand-red/80 to-brand-red/30 rounded-t-sm min-w-0"
              title={`Day ${i+1}: ${Math.round(h * 14.15 / 10) * 10} views`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-white/25">
          <span>20 days ago</span><span>Today</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform breakdown */}
        <div className="glass-card p-5 space-y-4">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Platform Breakdown</p>
          {PLATFORMS.map(p => (
            <div key={p.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{p.icon}</span>
                  <span className="text-white/70">{p.name}</span>
                </div>
                <span className="text-white font-semibold">{p.views}</span>
              </div>
              <div className="progress-bar h-2">
                <motion.div className={`${p.color} h-full rounded-full`}
                  initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Top shorts */}
        <div className="glass-card p-5 space-y-3">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Top Performing Shorts</p>
          {TOP_SHORTS.map((s, i) => (
            <div key={s.title} className="flex items-center gap-3 py-2 border-b border-glass-border last:border-0">
              <span className="text-sm font-black text-white/20 w-5 text-center">{i+1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{s.title}</p>
                <div className="flex items-center gap-2 text-[10px] text-white/35 mt-0.5">
                  <span>{s.views} views</span>
                  <span className="badge-red text-[9px]">{s.platform}</span>
                </div>
              </div>
              <span className="text-sm font-black text-brand-red">{s.score}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
