'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, SkipBack, SkipForward, Scissors, Type, Music, Image as ImageIcon,
  Layers, Wand2, Download, AlignLeft, Hash, Mic, Zap,
  Move, ZoomIn, RotateCcw, Maximize2, ChevronRight, Plus, Trash2,
  Upload, X, Check, RefreshCw, Eye, LayoutGrid,
  Crop, Sun, Contrast
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import ExportProgressModal from '@/components/studio/ExportProgressModal'

// ─── Types ───────────────────────────────────────────────────────────────────
interface SceneImage {
  sceneId: string | number
  imageUrl: string        // object URL or remote URL
  fileName: string
  fitMode: 'cover' | 'contain' | 'fill'
  opacity: number         // 0–100
  position: { x: number; y: number }  // percent offsets
  brightness: number      // 50–150
  contrast: number        // 50–150
  isCustom: boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────
const TABS = ['Timeline', 'Scenes', 'Captions', 'Thumbnails', 'AI Tools', 'Export']

const CAPTION_STYLES = [
  { name: 'Bold Impact', cls: 'font-black text-white', outline: true },
  { name: 'Yellow Gold', cls: 'font-black text-yellow-400', outline: true },
  { name: 'Clean White', cls: 'font-semibold text-white', outline: false },
  { name: 'Red Highlight', cls: 'font-black text-brand-red', outline: false },
]

const FIT_MODES: Array<{ value: SceneImage['fitMode']; label: string }> = [
  { value: 'cover', label: 'Cover (Fill)' },
  { value: 'contain', label: 'Contain (Fit)' },
  { value: 'fill', label: 'Stretch' },
]

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudioPage() {
  const [activeTab, setActiveTab] = useState('Timeline')
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(32)
  const [selectedClip, setSelectedClip] = useState<string | number>(1)
  const [captionStyle, setCaptionStyle] = useState(0)
  const [viralScore] = useState(91)
  const [project, setProject] = useState<any>(null)
  const [shorts, setShorts] = useState<any[]>([])

  // Scene images map: sceneId -> SceneImage
  const [sceneImages, setSceneImages] = useState<Record<string | number, SceneImage>>({})
  const [previewImageId, setPreviewImageId] = useState<string | number | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportPlatforms, setExportPlatforms] = useState({ youtube: true, instagram: true, tiktok: true, facebook: false })

  // ── Load project from localStorage store ─────────────────────────────────
  useEffect(() => {
    // Dynamically import to avoid SSR issues
    import('@/lib/projectStore').then(({ getProjects, createDemoProjectIfEmpty }) => {
      createDemoProjectIfEmpty()
      const all = getProjects()
      if (!all.length) return

      // Use active_project_id if set, else most recent
      const activeId = localStorage.getItem('active_project_id')
      const proj = activeId ? (all.find(p => p.id === activeId) || all[0]) : all[0]

      setProject(proj)
      const clipShorts = proj.shorts || []
      setShorts(clipShorts)
      if (clipShorts.length) {
        setSelectedClip(clipShorts[0].id)
        // Restore any previously saved scene images
        const restored: Record<string | number, SceneImage> = {}
        clipShorts.forEach(s => {
          if (s.sceneImage?.isCustom) {
            restored[s.id] = s.sceneImage as SceneImage
          }
        })
        if (Object.keys(restored).length) setSceneImages(restored)
      }
    })
  }, [])

  // ── Auto-save scene images whenever they change ───────────────────────────
  useEffect(() => {
    if (!project?.id) return
    import('@/lib/projectStore').then(({ saveSceneImages }) => {
      saveSceneImages(project.id, sceneImages)
    })
  }, [sceneImages, project?.id])


  const currentShort = shorts.find(s => s.id === selectedClip)
  const currentSceneImage = sceneImages[selectedClip]

  const updateSceneImage = (id: string | number, patch: Partial<SceneImage>) => {
    setSceneImages(prev => ({
      ...prev,
      [id]: { ...prev[id], ...patch } as SceneImage,
    }))
  }

  const removeSceneImage = (id: string | number) => {
    setSceneImages(prev => {
      const next = { ...prev }
      if (next[id]?.imageUrl?.startsWith('blob:')) URL.revokeObjectURL(next[id].imageUrl)
      delete next[id]
      return next
    })
    if (previewImageId === id) setPreviewImageId(null)
  }

  return (
    <>
    <div className="flex flex-col h-[calc(100vh-64px)] -m-6">
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-glass-border bg-dark-800/60 backdrop-blur-xl flex-shrink-0">
        <div>
          <h1 className="font-display font-bold text-sm text-white">{project?.title || 'Loading…'}</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-xs text-white/35">{shorts.length} shorts · Auto-saving…</p>
            {Object.keys(sceneImages).length > 0 && (
              <span className="badge-green text-[10px]">
                {Object.keys(sceneImages).length} custom scene{Object.keys(sceneImages).length > 1 ? 's' : ''} added
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-xl">
            <Zap className="w-3.5 h-3.5 text-brand-red" />
            <span className="text-xs font-bold text-white">Viral Score: {project?.viral_score || viralScore}%</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab('Scenes')}
            className="btn-secondary text-sm py-2"
          >
            <ImageIcon className="w-4 h-4 text-brand-red" />
            Edit Scenes
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setExportOpen(true)}
            className="btn-primary text-sm py-2"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Preview + Clips ───────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-dark-900 border-r border-glass-border overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-6 gap-8 overflow-auto">

            {/* 9:16 Preview */}
            <div className="relative flex-shrink-0" style={{ width: 200, height: 355 }}>
              <div className="absolute inset-0 bg-brand-red/10 blur-2xl rounded-3xl scale-90 pointer-events-none" />
              <div className="relative w-full h-full glass-card rounded-3xl overflow-hidden border-dark-300/50 flex flex-col items-center justify-center bg-gradient-to-b from-dark-700 to-dark-900">

                {/* Custom scene image layer */}
                {currentSceneImage && (
                  <motion.img
                    key={currentSceneImage.imageUrl}
                    initial={{ opacity: 0 }} animate={{ opacity: currentSceneImage.opacity / 100 }}
                    src={currentSceneImage.imageUrl}
                    alt="Scene image"
                    className="absolute inset-0 w-full h-full pointer-events-none z-10 rounded-3xl"
                    style={{
                      objectFit: currentSceneImage.fitMode,
                      objectPosition: `${currentSceneImage.position.x}% ${currentSceneImage.position.y}%`,
                      filter: `brightness(${currentSceneImage.brightness}%) contrast(${currentSceneImage.contrast}%)`,
                    }}
                  />
                )}

                {/* Default content when no scene image */}
                {!currentSceneImage && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-3">
                      <span className="text-2xl font-black">R</span>
                    </div>
                  </>
                )}

                {/* Caption overlay */}
                <div className={`absolute bottom-12 left-0 right-0 px-3 z-20 ${currentSceneImage ? '' : ''}`}>
                  <p
                    className={`${CAPTION_STYLES[captionStyle].cls} text-sm leading-tight text-center`}
                    style={CAPTION_STYLES[captionStyle].outline ? { textShadow: '1px 1px 0 #000,-1px 1px 0 #000,1px -1px 0 #000,-1px -1px 0 #000' } : {}}
                  >
                    "Success doesn't happen{' '}
                    <span className="text-brand-red">overnight</span> — it's{' '}
                    <span className="text-yellow-300">consistent daily action.</span>"
                  </p>
                </div>

                {/* 9:16 badge */}
                <div className="absolute top-3 right-3 badge-red text-[9px] z-30">9:16 HD</div>

                {/* Reframe border */}
                <div className="absolute inset-0 border-2 border-brand-red/30 rounded-3xl pointer-events-none z-30" />

                {/* Custom image indicator */}
                {currentSceneImage && (
                  <div className="absolute top-3 left-3 badge-green text-[9px] z-30">Custom Image</div>
                )}

                {/* Replace image quick button on preview */}
                <SceneImageQuickUpload
                  sceneId={selectedClip}
                  sceneImages={sceneImages}
                  onAdd={(id, img) => setSceneImages(prev => ({ ...prev, [id]: img }))}
                  onRemove={removeSceneImage}
                />

                {/* Waveform */}
                <div className="absolute bottom-3 left-3 right-3 flex items-end gap-0.5 h-6 opacity-40 z-20">
                  {[3,5,8,12,7,10,5,3,9,12,6,4,8,10,5,7,11,6,3,8].map((h, i) => (
                    <div key={i} className="flex-1 bg-brand-red/70 rounded-sm" style={{ height: `${h}px` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Clip list */}
            <div className="space-y-3 max-w-xs w-full">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">AI-Detected Shorts</p>
                <button
                  onClick={() => setActiveTab('Scenes')}
                  className="text-[10px] text-brand-red hover:text-brand-red-light font-semibold flex items-center gap-1"
                >
                  <ImageIcon className="w-3 h-3" /> Manage Scenes
                </button>
              </div>

              {shorts.map((clip) => {
                const hasCustomImage = !!sceneImages[clip.id]
                return (
                  <motion.div
                    key={clip.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setSelectedClip(clip.id)}
                    className={`glass-card p-4 cursor-pointer transition-all border ${
                      selectedClip === clip.id ? 'border-brand-red/50 bg-brand-red/5' : 'border-glass-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-semibold text-white truncate max-w-[130px]">{clip.title}</span>
                        {hasCustomImage && (
                          <span className="badge-green text-[9px] flex-shrink-0">Custom</span>
                        )}
                      </div>
                      <span className={`text-sm font-black flex-shrink-0 ${clip.viral_score >= 90 ? 'text-brand-red' : 'text-amber-400'}`}>
                        {clip.viral_score}%
                      </span>
                    </div>
                    <div className="progress-bar mb-2">
                      <div className="progress-fill" style={{ width: `${clip.viral_score}%` }} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/35">
                      <span>{clip.duration}s</span>
                      {/* Edit image inline button */}
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedClip(clip.id); setActiveTab('Scenes') }}
                        className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-red/10 border border-brand-red/30 text-brand-red hover:bg-brand-red/20 text-[10px] font-semibold transition-all"
                      >
                        <ImageIcon className="w-2.5 h-2.5" />
                        {hasCustomImage ? 'Replace Image' : 'Add Image'}
                      </button>
                    </div>
                  </motion.div>
                )
              })}

              <button className="btn-secondary w-full justify-center text-xs py-2.5">
                <Plus className="w-3.5 h-3.5" />
                Add Custom Clip
              </button>
            </div>
          </div>

          {/* Playback controls */}
          <div className="px-6 pb-4 flex-shrink-0 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/35 w-8">{Math.floor(progress * 0.5)}s</span>
              <div className="flex-1 relative h-1.5 bg-dark-400 rounded-full cursor-pointer group">
                <div className="progress-fill rounded-full" style={{ width: `${progress}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${progress}% - 8px)` }} />
              </div>
              <span className="text-xs text-white/35 w-12">1:24:30</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button className="btn-ghost p-2"><SkipBack className="w-4 h-4" /></button>
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setPlaying(!playing)}
                className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center shadow-red-glow-sm"
              >
                {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white fill-current ml-0.5" />}
              </motion.button>
              <button className="btn-ghost p-2"><SkipForward className="w-4 h-4" /></button>
              <div className="ml-4 flex items-center gap-2">
                <span className="text-xs text-white/30">Speed</span>
                <select className="input-field py-1 px-2 text-xs w-16">
                  {['0.5x','1x','1.5x','2x'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel ─────────────────────────────────────────────────── */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-dark-800/60 overflow-hidden">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-glass-border px-2 pt-2 gap-1 flex-shrink-0">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all whitespace-nowrap flex-shrink-0 relative ${
                  activeTab === tab
                    ? 'bg-brand-red/20 text-brand-red border-b-2 border-brand-red'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {tab}
                {tab === 'Scenes' && Object.keys(sceneImages).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-red text-white text-[9px] flex items-center justify-center font-black">
                    {Object.keys(sceneImages).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              {activeTab === 'Timeline' && (
                <TimelineTab key="timeline" clips={shorts} selectedClip={selectedClip} />
              )}
              {activeTab === 'Scenes' && (
                <ScenesTab
                  key="scenes"
                  clips={shorts}
                  selectedClip={selectedClip}
                  sceneImages={sceneImages}
                  onSelectClip={setSelectedClip}
                  onAddImage={(id, img) => setSceneImages(prev => ({ ...prev, [id]: img }))}
                  onUpdateImage={updateSceneImage}
                  onRemoveImage={removeSceneImage}
                />
              )}
              {activeTab === 'Captions' && (
                <CaptionsTab key="captions" captionStyle={captionStyle} setCaptionStyle={setCaptionStyle} />
              )}
              {activeTab === 'Thumbnails' && (
                <ThumbnailsTab key="thumbnails" shorts={shorts} />
              )}
              {activeTab === 'AI Tools' && <AIToolsTab key="aitools" />}
              {activeTab === 'Export' && (
                <ExportTab
                  key="export"
                  shorts={shorts}
                  sceneImages={sceneImages}
                  platforms={exportPlatforms}
                  onPlatformsChange={setExportPlatforms}
                  onStartExport={() => setExportOpen(true)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
    <ExportProgressModal
      isOpen={exportOpen}
      onClose={() => setExportOpen(false)}
      shorts={shorts}
      sceneImages={sceneImages}
      platforms={exportPlatforms}
    />
    </>
  )
}

// ─── Scene Image Quick Upload (floating button on preview) ────────────────────
function SceneImageQuickUpload({
  sceneId, sceneImages, onAdd, onRemove,
}: {
  sceneId: string | number
  sceneImages: Record<string | number, SceneImage>
  onAdd: (id: string | number, img: SceneImage) => void
  onRemove: (id: string | number) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const hasImage = !!sceneImages[sceneId]

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file)
    onAdd(sceneId, {
      sceneId, imageUrl: url, fileName: file.name,
      fitMode: 'cover', opacity: 100,
      position: { x: 50, y: 40 },
      brightness: 100, contrast: 100,
      isCustom: true,
    })
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      <div className="absolute bottom-14 right-2 z-30 flex flex-col gap-1.5">
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => fileRef.current?.click()}
          title={hasImage ? 'Replace scene image' : 'Add scene image'}
          className="w-8 h-8 rounded-full bg-brand-red shadow-red-glow-sm flex items-center justify-center"
        >
          {hasImage ? <RefreshCw className="w-3.5 h-3.5 text-white" /> : <Upload className="w-3.5 h-3.5 text-white" />}
        </motion.button>
        {hasImage && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => onRemove(sceneId)}
            title="Remove scene image"
            className="w-8 h-8 rounded-full bg-dark-400 border border-glass-border flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5 text-white/60" />
          </motion.button>
        )}
      </div>
    </>
  )
}

// ─── Scenes Tab ───────────────────────────────────────────────────────────────
function ScenesTab({
  clips, selectedClip, sceneImages, onSelectClip, onAddImage, onUpdateImage, onRemoveImage,
}: {
  clips: any[]
  selectedClip: string | number
  sceneImages: Record<string | number, SceneImage>
  onSelectClip: (id: string | number) => void
  onAddImage: (id: string | number, img: SceneImage) => void
  onUpdateImage: (id: string | number, patch: Partial<SceneImage>) => void
  onRemoveImage: (id: string | number) => void
}) {
  const [editingId, setEditingId] = useState<string | number | null>(selectedClip)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => { setEditingId(selectedClip) }, [selectedClip])

  const activeImage = editingId !== null ? sceneImages[editingId] : null

  const handleFileSelect = useCallback((file: File, id: string | number) => {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    onAddImage(id, {
      sceneId: id, imageUrl: url, fileName: file.name,
      fitMode: 'cover', opacity: 100,
      position: { x: 50, y: 40 },
      brightness: 100, contrast: 100,
      isCustom: true,
    })
  }, [onAddImage])

  const handleDrop = useCallback((e: React.DragEvent, id: string | number) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file, id)
  }, [handleFileSelect])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Scene Image Manager</p>
        <p className="text-[11px] text-white/35 leading-snug">
          Upload custom images for each scene/cut. They'll sync automatically with that segment in the timeline.
        </p>
      </div>

      {/* Scene selector */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Select Scene</p>
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {clips.map(clip => {
            const hasImg = !!sceneImages[clip.id]
            return (
              <button
                key={clip.id}
                onClick={() => { onSelectClip(clip.id); setEditingId(clip.id) }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left border ${
                  editingId === clip.id
                    ? 'border-brand-red/60 bg-brand-red/10'
                    : 'border-glass-border hover:border-brand-red/30 hover:bg-glass'
                }`}
              >
                {/* Tiny image preview or placeholder */}
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-dark-600 border border-glass-border flex items-center justify-center">
                  {hasImg ? (
                    <img src={sceneImages[clip.id].imageUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-white/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{clip.title}</p>
                  <p className="text-[10px] text-white/35">{clip.duration}s · {clip.viral_score}% viral</p>
                </div>
                {hasImg
                  ? <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  : <Plus className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                }
              </button>
            )
          })}
        </div>
      </div>

      <div className="divider" />

      {/* Upload zone for selected scene */}
      {editingId !== null && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
              {activeImage ? 'Replace' : 'Upload'} Image for Scene
            </p>
            {activeImage && (
              <button
                onClick={() => onRemoveImage(editingId)}
                className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f, editingId) }}
          />

          {/* Drop zone */}
          <div
            ref={dropRef}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => handleDrop(e, editingId)}
            onClick={() => fileInputRef.current?.click()}
            className={`upload-zone p-6 transition-all cursor-pointer ${
              isDragging ? 'border-brand-red/70 bg-brand-red/5' : ''
            }`}
          >
            {activeImage ? (
              <div className="space-y-2 w-full">
                {/* Current image preview */}
                <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '9/16', maxHeight: 140 }}>
                  <img
                    src={activeImage.imageUrl}
                    className="w-full h-full"
                    style={{
                      objectFit: activeImage.fitMode,
                      objectPosition: `${activeImage.position.x}% ${activeImage.position.y}%`,
                      filter: `brightness(${activeImage.brightness}%) contrast(${activeImage.contrast}%)`,
                      opacity: activeImage.opacity / 100,
                    }}
                    alt="Scene preview"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-xl">
                    <div className="flex flex-col items-center gap-1 text-white">
                      <RefreshCw className="w-5 h-5" />
                      <span className="text-xs font-semibold">Click to replace</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-white/40 text-center truncate">{activeImage.fileName}</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-brand-red/15 border border-brand-red/30 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-brand-red" />
                </div>
                <p className="text-sm font-semibold text-white mb-1">Drop image here</p>
                <p className="text-xs text-white/35 mb-3">PNG, JPG, WEBP · Max 20MB</p>
                <span className="badge-red text-[10px]">or click to browse</span>
              </>
            )}
          </div>

          {/* Image adjustments (only if image is set) */}
          {activeImage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Fit mode */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                  <Crop className="w-3 h-3" /> Fit Mode
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {FIT_MODES.map(fm => (
                    <button
                      key={fm.value}
                      onClick={() => onUpdateImage(editingId, { fitMode: fm.value })}
                      className={`py-1.5 rounded-lg text-[10px] font-semibold transition-all border ${
                        activeImage.fitMode === fm.value
                          ? 'border-brand-red/60 bg-brand-red/15 text-brand-red'
                          : 'border-glass-border text-white/40 hover:border-brand-red/30'
                      }`}
                    >
                      {fm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                    <Eye className="w-3 h-3" /> Opacity
                  </p>
                  <span className="text-[10px] text-brand-red font-bold">{activeImage.opacity}%</span>
                </div>
                <input
                  type="range" min={10} max={100} value={activeImage.opacity}
                  onChange={e => onUpdateImage(editingId, { opacity: +e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Brightness */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                    <Sun className="w-3 h-3" /> Brightness
                  </p>
                  <span className="text-[10px] text-brand-red font-bold">{activeImage.brightness}%</span>
                </div>
                <input
                  type="range" min={50} max={150} value={activeImage.brightness}
                  onChange={e => onUpdateImage(editingId, { brightness: +e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                    <Contrast className="w-3 h-3" /> Contrast
                  </p>
                  <span className="text-[10px] text-brand-red font-bold">{activeImage.contrast}%</span>
                </div>
                <input
                  type="range" min={50} max={150} value={activeImage.contrast}
                  onChange={e => onUpdateImage(editingId, { contrast: +e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Position X/Y */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                  <Move className="w-3 h-3" /> Position
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-[9px] text-white/30">Horizontal</p>
                    <input
                      type="range" min={0} max={100} value={activeImage.position.x}
                      onChange={e => onUpdateImage(editingId, { position: { ...activeImage.position, x: +e.target.value } })}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-white/30">Vertical</p>
                    <input
                      type="range" min={0} max={100} value={activeImage.position.y}
                      onChange={e => onUpdateImage(editingId, { position: { ...activeImage.position, y: +e.target.value } })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Reset button */}
              <button
                onClick={() => onUpdateImage(editingId, { fitMode: 'cover', opacity: 100, brightness: 100, contrast: 100, position: { x: 50, y: 40 } })}
                className="btn-ghost w-full justify-center text-xs py-2 border border-glass-border rounded-xl"
              >
                <RotateCcw className="w-3 h-3" /> Reset Adjustments
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* All scenes summary */}
      {Object.keys(sceneImages).length > 0 && (
        <>
          <div className="divider" />
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest flex items-center gap-1.5">
              <LayoutGrid className="w-3 h-3" /> All Custom Scenes ({Object.keys(sceneImages).length})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(sceneImages).map(img => (
                <div key={img.sceneId} className="relative rounded-lg overflow-hidden group" style={{ aspectRatio: '9/16' }}>
                  <img src={img.imageUrl} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                    <button
                      onClick={() => { onSelectClip(img.sceneId); setEditingId(img.sceneId) }}
                      className="text-[9px] text-white font-semibold bg-brand-red/80 px-2 py-1 rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onRemoveImage(img.sceneId)}
                      className="text-[9px] text-white/70 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}

// ─── Timeline Tab ─────────────────────────────────────────────────────────────
function TimelineTab({ clips, selectedClip }: { clips: any[]; selectedClip: string | number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Timeline Editor</p>
      <div className="timeline-track relative">
        <div className="timeline-playhead" style={{ left: '32%' }} />
        {clips.map((clip, i) => (
          <div
            key={clip.id}
            className={`timeline-segment bg-brand-red/70 ${selectedClip === clip.id ? 'ring-1 ring-white/40' : ''}`}
            style={{ left: `${(i * 18) % 78}%`, width: '18%' }}
            title={clip.title}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] text-white/25">
        <span>0:00</span><span>0:30</span><span>1:00</span><span>1:24:30</span>
      </div>
      <div className="divider" />
      <div className="grid grid-cols-3 gap-2">
        {[
          [Scissors,'Trim'],[Type,'Text'],[Music,'Music'],
          [ZoomIn,'Zoom'],[Move,'Pan'],[RotateCcw,'Undo'],
          [Layers,'Layers'],[Maximize2,'Fullscreen'],[Trash2,'Delete'],
        ].map(([Icon, label]) => (
          <button key={label as string} className="glass-card p-3 flex flex-col items-center gap-1.5 hover:border-brand-red/40 transition-all">
            <Icon className="w-4 h-4 text-white/60" />
            <span className="text-[10px] text-white/40">{label as string}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Captions Tab ─────────────────────────────────────────────────────────────
function CaptionsTab({ captionStyle, setCaptionStyle }: { captionStyle: number; setCaptionStyle: (i: number) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Caption Styles</p>
        <button className="btn-primary text-xs py-1.5 px-3"><Wand2 className="w-3 h-3" />Re-generate</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {CAPTION_STYLES.map((style, i) => (
          <button
            key={style.name}
            onClick={() => setCaptionStyle(i)}
            className={`glass-card p-3 text-center border transition-all ${captionStyle === i ? 'border-brand-red/60 bg-brand-red/10' : 'border-glass-border hover:border-brand-red/30'}`}
          >
            <div className={`text-sm mb-1 ${style.cls}`} style={style.outline ? { textShadow: '1px 1px 0 #000' } : {}}>Aa</div>
            <div className="text-[10px] text-white/40">{style.name}</div>
          </button>
        ))}
      </div>
      <div className="divider" />
      <div className="space-y-2">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Language</p>
        <div className="grid grid-cols-2 gap-2">
          {['English','Hindi','Both','Custom'].map(lang => (
            <button key={lang} className={`glass-card p-2.5 text-xs text-center transition-all hover:border-brand-red/40 ${lang==='Both'?'border-brand-red/50 bg-brand-red/10 text-brand-red font-semibold':'text-white/50'}`}>
              {lang}
            </button>
          ))}
        </div>
      </div>
      <div className="divider" />
      <div className="space-y-2">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Caption Timeline</p>
        {[['0:02',"Success doesn't happen overnight…"],['0:05',"it's the result of consistent…"],['0:08','…daily action. 🔥']].map(([time,text]) => (
          <div key={time} className="glass-card p-3 flex gap-3 items-start">
            <span className="text-[10px] font-mono text-brand-red flex-shrink-0 mt-0.5">{time}</span>
            <span className="text-xs text-white/60 flex-1">{text}</span>
            <button className="text-white/20 hover:text-white/60"><Type className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Thumbnails Tab ───────────────────────────────────────────────────────────
function ThumbnailsTab({ shorts }: { shorts: any[] }) {
  const THUMBS = [
    { bg: 'from-purple-600 to-blue-600', text: 'MINDSET SHIFT!', score: '94%' },
    { bg: 'from-brand-red to-orange-500', text: 'THIS CHANGED MY LIFE', score: '91%' },
    { bg: 'from-green-600 to-teal-600', text: 'GROWTH SECRET 🚀', score: '88%' },
  ]
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">AI Thumbnails</p>
        <button className="btn-primary text-xs py-1.5 px-3"><Wand2 className="w-3 h-3" />Generate</button>
      </div>
      {THUMBS.map((thumb, i) => (
        <div key={i} className="relative rounded-2xl overflow-hidden cursor-pointer transition-all hover:ring-2 ring-brand-red/50" style={{ aspectRatio: '16/9' }}>
          <div className={`absolute inset-0 bg-gradient-to-br ${thumb.bg}`} />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 border-4 border-white/40">
              <span className="font-black text-xl">R</span>
            </div>
            <div className="font-display font-black text-center text-xs leading-tight" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.8)', color: '#fff' }}>{thumb.text}</div>
          </div>
          <div className="absolute top-2 right-2 badge-green text-[9px]">CTR {thumb.score}</div>
        </div>
      ))}
    </motion.div>
  )
}

// ─── AI Tools Tab ─────────────────────────────────────────────────────────────
function AIToolsTab() {
  const [loading, setLoading] = useState<string|null>(null)
  const run = (tool: string) => { setLoading(tool); setTimeout(() => setLoading(null), 2000) }
  const TOOLS = [
    { icon: Hash, label: 'Generate Hashtags' },
    { icon: AlignLeft, label: 'AI Title Generator' },
    { icon: Wand2, label: 'Viral Hook Suggestions' },
    { icon: Mic, label: 'Voice Enhancement' },
    { icon: Zap, label: 'SEO Description' },
    { icon: Music, label: 'Auto Music Sync' },
  ]
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">AI Power Tools</p>
      {TOOLS.map(tool => {
        const Icon = tool.icon
        return (
          <motion.button
            key={tool.label} whileHover={{ x: 4 }}
            onClick={() => run(tool.label)}
            className="w-full glass-card-hover p-3.5 flex items-center gap-3 text-left"
          >
            <div className="feature-icon w-8 h-8 rounded-xl flex-shrink-0"><Icon className="w-4 h-4 text-white/70" /></div>
            <span className="text-sm text-white/80 font-medium flex-1">{tool.label}</span>
            {loading === tool.label ? <div className="spinner w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />}
          </motion.button>
        )
      })}
    </motion.div>
  )
}

// ─── Export Tab ───────────────────────────────────────────────────────────────
function ExportTab({
  shorts, sceneImages, platforms, onPlatformsChange, onStartExport,
}: {
  shorts: any[]
  sceneImages: Record<string|number, SceneImage>
  platforms: Record<string, boolean>
  onPlatformsChange: (p: Record<string, boolean>) => void
  onStartExport: () => void
}) {
  const customSceneCount = Object.keys(sceneImages).length

  const PLATFORMS = [
    { key: 'youtube',   name: 'YouTube Shorts',   icon: '▶',  spec: '1080×1920 · MP4 · <60s'   },
    { key: 'instagram', name: 'Instagram Reels',  icon: '📸', spec: '1080×1920 · MP4 · <90s'   },
    { key: 'tiktok',   name: 'TikTok',            icon: '🎵', spec: '1080×1920 · MP4 · <10min'  },
    { key: 'facebook', name: 'Facebook Reels',    icon: 'f',  spec: '1080×1920 · MP4 · <60s'   },
  ] as const

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Export Destinations</p>

      {customSceneCount > 0 && (
        <div className="glass-card border-green-500/30 p-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
          <p className="text-xs text-green-400">
            <span className="font-bold">{customSceneCount} custom scene image{customSceneCount > 1 ? 's' : ''}</span> will be embedded.
          </p>
        </div>
      )}

      {PLATFORMS.map(p => (
        <div key={p.key} className="glass-card p-4 flex items-center gap-3">
          <span className="text-lg">{p.icon}</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">{p.name}</div>
            <div className="text-[10px] text-white/35">{p.spec}</div>
          </div>
          <button
            onClick={() => onPlatformsChange({ ...platforms, [p.key]: !platforms[p.key] })}
            className={`w-10 h-5 rounded-full transition-all ${platforms[p.key] ? 'bg-brand-red' : 'bg-dark-400'}`}
          >
            <div className="w-4 h-4 rounded-full bg-white mt-0.5 shadow transition-all"
              style={{ marginLeft: platforms[p.key] ? 22 : 2 }} />
          </button>
        </div>
      ))}

      <div className="divider" />
      <div className="space-y-2">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Quality</p>
        <select className="input-field text-sm">
          <option>1080×1920 Full HD</option>
          <option>720p HD</option>
          <option>480p Standard</option>
        </select>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={onStartExport}
        disabled={shorts.length === 0}
        className="btn-primary w-full justify-center py-3.5 disabled:opacity-60"
      >
        <Download className="w-4 h-4" />
        Export All {shorts.length} Shorts
      </motion.button>
      <p className="text-center text-xs text-white/25">GPU-accelerated · Est. ~{Math.ceil(shorts.length * 12)}s</p>
    </motion.div>
  )
}
