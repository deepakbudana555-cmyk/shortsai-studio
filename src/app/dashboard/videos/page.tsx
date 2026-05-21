'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Edit3, Download, Trash2, Search, Clock, Zap, ChevronRight, Filter, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { getProjects, deleteProject, createDemoProjectIfEmpty, type Project } from '@/lib/projectStore'

const FILTERS = ['All', 'Ready', 'Processing', 'Failed']

export default function VideosPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const refresh = () => {
    createDemoProjectIfEmpty()
    setProjects(getProjects())
  }

  useEffect(() => {
    refresh()
    window.addEventListener('projects_updated', refresh)
    return () => window.removeEventListener('projects_updated', refresh)
  }, [])

  const filtered = projects.filter(p => {
    const matchFilter = filter === 'All' || p.status === filter.toLowerCase()
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.original_filename || '').toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const totalShorts = projects.reduce((a, p) => a + (p.shorts?.length || 0), 0)
  const customImages = projects.reduce((a, p) => a + (p.shorts?.filter(s => s.sceneImage?.isCustom).length || 0), 0)

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteProject(id); setDeleteConfirm(null); refresh()
    } else {
      setDeleteConfirm(id); setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const GRADIENTS = [
    'from-brand-red to-orange-500',
    'from-purple-600 to-blue-500',
    'from-green-500 to-teal-400',
    'from-pink-500 to-rose-500',
    'from-amber-500 to-yellow-400',
    'from-indigo-500 to-violet-600',
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-white">My Videos</h1>
          <p className="text-sm text-white/40 mt-1">{projects.length} projects · {totalShorts} shorts created</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Projects', value: projects.length, color: 'text-brand-red' },
          { label: 'Total Shorts', value: totalShorts, color: 'text-blue-400' },
          { label: 'Custom Scenes', value: customImages, color: 'text-green-400' },
          { label: 'Avg Viral Score', value: projects.length ? `${Math.round(projects.reduce((a,p)=>a+(p.viral_score||0),0)/projects.length)}%` : '--', color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <div className={`font-display font-black text-2xl ${s.color}`}>{s.value}</div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            className="input-field pl-9 py-2.5 text-sm w-full"
            placeholder="Search by title or filename…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === f ? 'bg-brand-red text-white' : 'glass-card text-white/50 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Projects grid */}
      {filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-4xl mb-4">🎬</div>
          <p className="text-white font-semibold mb-2">{search ? 'No projects found' : 'No videos yet'}</p>
          <p className="text-white/40 text-sm">Upload a video from the dashboard to get started.</p>
          <Link href="/dashboard"><button className="btn-primary mt-4 mx-auto">Go to Dashboard</button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project, i) => {
            const customCount = project.shorts?.filter(s => s.sceneImage?.isCustom).length || 0
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden hover:border-brand-red/30 transition-all group"
              >
                {/* Thumbnail */}
                <div className={`relative h-36 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center`}>
                  {project.thumbnail_url
                    ? <img src={project.thumbnail_url} className="w-full h-full object-cover absolute inset-0" alt="" />
                    : <Play className="w-10 h-10 text-white/60 fill-current" />
                  }
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      project.status === 'ready' ? 'bg-green-500/80 text-white' :
                      project.status === 'processing' ? 'bg-blue-500/80 text-white' :
                      'bg-red-500/80 text-white'
                    }`}>
                      {project.status === 'ready' ? '✓ Ready' : project.status === 'processing' ? '⟳ Processing' : '✕ Failed'}
                    </span>
                  </div>
                  {customCount > 0 && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <ImageIcon className="w-3 h-3 text-green-400" />
                      <span className="text-[10px] text-green-400 font-semibold">{customCount} custom</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm truncate">{project.title}</h3>
                    {project.original_filename && (
                      <p className="text-[11px] text-white/30 truncate mt-0.5">{project.original_filename}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {project.duration ? `${Math.floor(project.duration/60)}m` : '?'}
                    </span>
                    <span>{project.shorts?.length || 0} shorts</span>
                    <span className="ml-auto font-bold text-brand-red">{project.viral_score || '--'}%</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Link href="/dashboard/studio" className="flex-1" onClick={() => localStorage.setItem('active_project_id', project.id)}>
                      <button className="btn-primary w-full justify-center text-xs py-2">
                        <Edit3 className="w-3.5 h-3.5" /> Edit Studio
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                        deleteConfirm === project.id
                          ? 'bg-red-500/30 border border-red-500/60 text-red-400'
                          : 'glass-card text-white/30 hover:text-red-400'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
