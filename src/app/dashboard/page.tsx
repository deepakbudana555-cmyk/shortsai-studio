'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, Video, Zap, Clock, Play, MoreVertical, Upload,
  ArrowUpRight, Flame, Star, ChevronRight, Eye, Download, Scissors,
  Image as ImageIcon, Plus, FolderOpen, Trash2, Edit3
} from 'lucide-react'
import Link from 'next/link'
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/animations'
import { UploadZone } from '@/components/ui/UploadZone'
import {
  getProjects, getStats, deleteProject, createDemoProjectIfEmpty,
  type Project
} from '@/lib/projectStore'

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState({ total: 0, totalShorts: 0, avgViral: 0, customImages: 0 })
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const refresh = () => {
    createDemoProjectIfEmpty()
    const all = getProjects()
    setProjects(all)
    setStats(getStats())
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    window.addEventListener('projects_updated', refresh)
    window.addEventListener('project_uploaded', refresh)
    return () => {
      window.removeEventListener('projects_updated', refresh)
      window.removeEventListener('project_uploaded', refresh)
    }
  }, [])

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteProject(id)
      setDeleteConfirm(null)
      refresh()
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const STAT_CARDS = [
    {
      label: 'Total Shorts Created', value: stats.totalShorts.toString(),
      change: `from ${stats.total} project${stats.total !== 1 ? 's' : ''}`,
      icon: Scissors, color: 'text-brand-red', bg: 'bg-brand-red/10 border-brand-red/20'
    },
    {
      label: 'Projects Uploaded', value: stats.total.toString(),
      change: 'in your library',
      icon: Video, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      label: 'Avg. Viral Score', value: stats.avgViral ? `${stats.avgViral}%` : '--',
      change: 'across all shorts',
      icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      label: 'Custom Scene Images', value: stats.customImages.toString(),
      change: 'manually edited',
      icon: ImageIcon, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20'
    },
  ]

  return (
    <div className="space-y-8 max-w-7xl">

      {/* Welcome */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-2xl text-white">Your Dashboard 👋</h1>
            <p className="text-sm text-white/45 mt-1">
              {projects.length === 0
                ? 'Upload your first video to get started!'
                : `${projects.filter(p => p.status === 'ready').length} project${projects.filter(p => p.status === 'ready').length !== 1 ? 's' : ''} ready · ${stats.totalShorts} shorts created`
              }
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="btn-primary"
            onClick={() => document.getElementById('quick-upload')?.click()}
          >
            <Upload className="w-4 h-4" />
            Upload New Video
          </motion.button>
        </div>
      </FadeIn>

      {/* Stats — real numbers from localStorage */}
      <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map(stat => {
          const Icon = stat.icon
          return (
            <StaggerItem key={stat.label}>
              <div className={`glass-card p-5 border ${stat.bg} space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 font-medium">{stat.label}</span>
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${stat.bg}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="font-display font-black text-3xl text-white">{stat.value}</div>
                <div className="flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs text-white/40">{stat.change}</span>
                </div>
              </div>
            </StaggerItem>
          )
        })}
      </StaggerChildren>

      {/* Upload Zone */}
      <FadeIn>
        <UploadZone />
      </FadeIn>

      {/* Projects — your actual uploaded videos */}
      <FadeIn>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-brand-red" />
              Your Projects
              {projects.length > 0 && (
                <span className="text-sm font-normal text-white/30">({projects.length})</span>
              )}
            </h2>
            <Link href="/dashboard/videos">
              <button className="btn-ghost text-xs flex items-center gap-1">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card p-4 h-20 animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-brand-red/50" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">No projects yet</p>
                <p className="text-white/40 text-sm">Upload your first video above and AI will automatically create viral shorts for you.</p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 6).map((project, i) => {
                const customImagesCount = project.shorts?.filter(s => s.sceneImage?.isCustom).length || 0
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card-hover p-4 flex items-center gap-4"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-10 rounded-lg bg-gradient-to-br from-brand-red/80 to-orange-500/80 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {project.thumbnail_url
                        ? <img src={project.thumbnail_url} className="w-full h-full object-cover" alt="" />
                        : <Play className="w-4 h-4 text-white/80 fill-current" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-white truncate">{project.title}</span>
                        {project.status === 'processing' && <span className="badge-blue text-[10px] flex-shrink-0">Processing</span>}
                        {project.status === 'ready' && <span className="badge-green text-[10px] flex-shrink-0">Ready</span>}
                        {project.status === 'failed' && <span className="badge-red text-[10px] flex-shrink-0">Failed</span>}
                        {customImagesCount > 0 && (
                          <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            {customImagesCount} custom image{customImagesCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {project.duration ? `${Math.floor(project.duration / 60)}m ${Math.floor(project.duration % 60)}s` : 'Unknown'}
                        </span>
                        <span>{project.shorts?.length || project.shorts_count} shorts</span>
                        <span>{new Date(project.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {project.original_filename && (
                          <span className="text-white/20 truncate max-w-[120px]">{project.original_filename}</span>
                        )}
                      </div>
                    </div>

                    {/* Viral score */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-white/40 mb-1">Viral Score</div>
                      <div className={`font-display font-black text-lg ${
                        project.viral_score >= 90 ? 'text-brand-red' :
                        project.viral_score >= 80 ? 'text-amber-400' : 'text-white/60'
                      }`}>
                        {project.viral_score || '--'}%
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Link href={`/dashboard/studio`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            // Mark this project as active
                            localStorage.setItem('active_project_id', project.id)
                          }}
                          title="Edit in Studio"
                          className="w-8 h-8 rounded-lg bg-brand-red/15 border border-brand-red/30 flex items-center justify-center text-brand-red hover:bg-brand-red/25 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </motion.button>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(project.id)}
                        title={deleteConfirm === project.id ? 'Click again to confirm delete' : 'Delete project'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          deleteConfirm === project.id
                            ? 'bg-red-500/30 border border-red-500/60 text-red-400'
                            : 'bg-dark-500/50 border border-glass-border text-white/30 hover:text-red-400 hover:border-red-500/30'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}

              {projects.length > 6 && (
                <Link href="/dashboard/videos">
                  <button className="btn-secondary w-full justify-center text-sm py-3">
                    View All {projects.length} Projects <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              )}
            </div>
          )}
        </div>
      </FadeIn>

      {/* AI Tips */}
      <FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Flame, title: 'Trending Hooks Today', desc: 'AI detected 5 trending hook patterns from your niche this week.', badge: 'badge-red', action: 'View Hooks' },
            { icon: Star, title: 'Thumbnail Tip', desc: 'Generate thumbnails for your shorts to boost CTR by up to 40%.', badge: 'badge-blue', action: 'Generate Now', link: '/dashboard/thumbnails' },
            { icon: TrendingUp, title: 'Best Posting Time', desc: 'Post your Shorts between 7–9 PM IST for maximum reach this week.', badge: 'badge-green', action: 'Analytics →', link: '/dashboard/analytics' },
          ].map(tip => {
            const Icon = tip.icon
            return (
              <motion.div key={tip.title} whileHover={{ y: -2 }} className="glass-card p-5 space-y-3 border border-glass-border">
                <div className="flex items-center gap-2">
                  <div className="feature-icon"><Icon className="w-4 h-4 text-white/70" /></div>
                  <span className={`${tip.badge} text-[10px]`}>AI Tip</span>
                </div>
                <h3 className="font-semibold text-sm text-white">{tip.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{tip.desc}</p>
                {tip.link ? (
                  <Link href={tip.link}>
                    <button className="text-xs text-brand-red hover:text-brand-red-light transition-colors font-semibold">{tip.action}</button>
                  </Link>
                ) : (
                  <button className="text-xs text-brand-red hover:text-brand-red-light transition-colors font-semibold">{tip.action}</button>
                )}
              </motion.div>
            )
          })}
        </div>
      </FadeIn>
    </div>
  )
}
