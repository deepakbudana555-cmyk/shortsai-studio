'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wand2, Play, Download, Sparkles, Image as ImageIcon,
  Upload, X, ChevronUp, ChevronDown, Check, Loader2, Film, Type, Clock
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface UploadedImage {
  id: string
  file: File
  url: string
  name: string
  duration: number   // seconds this image stays on screen
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

// ─── Canvas video renderer from images ───────────────────────────────────────
async function renderImagesToVideo(
  images: UploadedImage[],
  title: string,
  style: string,
  onProgress: (pct: number) => void
): Promise<Blob> {
  const W = 1080, H = 1920
  const FPS = 12
  const TRANSITION_FRAMES = 8   // crossfade frames between images

  // Load all images first
  const loaded = await Promise.all(images.map(img => loadImage(img.url)))
  onProgress(10)

  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // MediaRecorder
  const stream = canvas.captureStream(FPS)
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm'
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 })
  const chunks: Blob[] = []
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
  await new Promise<void>(resolve => { recorder.onstart = () => resolve(); recorder.start(100) })

  // Total frames
  const totalFrames = images.reduce((a, img) => a + img.duration * FPS, 0) + TRANSITION_FRAMES * images.length
  let framesDone = 0

  // Style helpers
  const STYLE_COLORS: Record<string, string> = {
    Motivational: '#E5192A', Educational: '#3B82F6',
    Entertainment: '#8B5CF6', News: '#F59E0B', Storytelling: '#10B981', Tutorial: '#EC4899'
  }
  const accentColor = STYLE_COLORS[style] || '#E5192A'

  const drawFrame = (
    img: HTMLImageElement,
    alpha: number,        // 0→1 opacity for crossfade
    kenBurns: number,     // 0→1 zoom factor (Ken Burns effect)
  ) => {
    ctx.clearRect(0, 0, W, H)

    // Dark background
    ctx.fillStyle = '#0A0A0F'
    ctx.fillRect(0, 0, W, H)

    // Draw image with Ken Burns (slow zoom) + center cover
    if (img.naturalWidth > 0) {
      ctx.save()
      ctx.globalAlpha = alpha
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight) * (1 + kenBurns * 0.06)
      const sw = img.naturalWidth * scale
      const sh = img.naturalHeight * scale
      const sx = (W - sw) / 2
      const sy = (H - sh) / 2
      ctx.drawImage(img, sx, sy, sw, sh)
      ctx.restore()
    }

    // Dark overlay for readability
    const ov = ctx.createLinearGradient(0, 0, 0, H)
    ov.addColorStop(0, 'rgba(0,0,0,0.25)')
    ov.addColorStop(0.6, 'rgba(0,0,0,0.05)')
    ov.addColorStop(1, 'rgba(0,0,0,0.85)')
    ctx.fillStyle = ov; ctx.fillRect(0, 0, W, H)

    // ── Caption title at bottom ──────────────────────────────────────────────
    if (title && alpha > 0.3) {
      ctx.save()
      ctx.globalAlpha = Math.min(1, (alpha - 0.3) / 0.5)
      const words = title.toUpperCase().split(' ')
      const mid = Math.ceil(words.length / 2)
      const lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')].filter(Boolean)
      ctx.textAlign = 'center'
      ctx.font = 'bold 88px Impact, Arial Black, sans-serif'
      ctx.lineJoin = 'round'
      lines.forEach((line, i) => {
        const y = H - 220 + i * 105
        ctx.strokeStyle = 'rgba(0,0,0,0.95)'; ctx.lineWidth = 12; ctx.strokeText(line, W/2, y)
        ctx.fillStyle = '#FFFFFF'; ctx.fillText(line, W/2, y)
      })
      ctx.restore()
    }

    // ── Accent color bar (top) ───────────────────────────────────────────────
    ctx.save()
    ctx.fillStyle = accentColor
    ctx.fillRect(0, 0, W, 8)
    ctx.restore()

    // ── Watermark ────────────────────────────────────────────────────────────
    ctx.save()
    ctx.globalAlpha = 0.45
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '26px Arial, sans-serif'
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'
    ctx.fillText('⚡ ShortsAI Studio', 40, 24)
    ctx.restore()
  }

  // Render each image
  for (let imgIdx = 0; imgIdx < loaded.length; imgIdx++) {
    const img = loaded[imgIdx]
    const nextImg = loaded[imgIdx + 1] || null
    const imgDuration = images[imgIdx].duration
    const imgFrames = Math.ceil(imgDuration * FPS)

    // Main frames for this image
    for (let f = 0; f < imgFrames; f++) {
      const kenBurns = f / imgFrames
      drawFrame(img, 1, kenBurns)
      await sleep(1000 / FPS)
      framesDone++
      onProgress(10 + Math.round((framesDone / totalFrames) * 80))
    }

    // Crossfade to next image
    if (nextImg) {
      for (let t = 0; t < TRANSITION_FRAMES; t++) {
        const alpha = t / TRANSITION_FRAMES
        // Draw current fading out
        drawFrame(img, 1 - alpha, 1)
        // Draw next fading in on top
        ctx.save()
        ctx.globalAlpha = alpha
        const scale = Math.max(W / nextImg.naturalWidth, H / nextImg.naturalHeight)
        const sw = nextImg.naturalWidth * scale
        const sh = nextImg.naturalHeight * scale
        ctx.drawImage(nextImg, (W - sw)/2, (H - sh)/2, sw, sh)
        ctx.restore()
        await sleep(1000 / FPS)
        framesDone++
      }
    }
  }

  onProgress(92)

  return new Promise(resolve => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }))
    recorder.stop()
    stream.getTracks().forEach(t => t.stop())
  })
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TextToVideoPage() {
  const [tab, setTab] = useState<'script' | 'images'>('images')

  // Script tab state
  const [script, setScript] = useState('')
  const [voice, setVoice] = useState('AI Male')
  const [language, setLanguage] = useState('English')
  const [duration, setDuration] = useState('45s')
  const [style, setStyle] = useState('Motivational')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  // Images tab state
  const [images, setImages] = useState<UploadedImage[]>([])
  const [videoTitle, setVideoTitle] = useState('')
  const [videoStyle, setVideoStyle] = useState('Motivational')
  const [rendering, setRendering] = useState(false)
  const [renderPct, setRenderPct] = useState(0)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [downloaded, setDownloaded] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Add images ──────────────────────────────────────────────────────────────
  const handleImageFiles = (files: FileList | null) => {
    if (!files) return
    const newImgs: UploadedImage[] = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, 6 - images.length)
      .map(f => ({
        id: Math.random().toString(36).slice(2),
        file: f,
        url: URL.createObjectURL(f),
        name: f.name,
        duration: 4,
      }))
    setImages(prev => [...prev, ...newImgs].slice(0, 6))
  }

  // ── Remove image ────────────────────────────────────────────────────────────
  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id)
      if (img) URL.revokeObjectURL(img.url)
      return prev.filter(i => i.id !== id)
    })
  }

  // ── Move image up/down ──────────────────────────────────────────────────────
  const moveImage = (idx: number, dir: -1 | 1) => {
    setImages(prev => {
      const arr = [...prev]
      const target = idx + dir
      if (target < 0 || target >= arr.length) return arr
      ;[arr[idx], arr[target]] = [arr[target], arr[idx]]
      return arr
    })
  }

  // ── Update duration ─────────────────────────────────────────────────────────
  const updateDuration = (id: string, d: number) => {
    setImages(prev => prev.map(i => i.id === id ? { ...i, duration: d } : i))
  }

  const totalDuration = images.reduce((a, i) => a + i.duration, 0)

  // ── Render video from images ─────────────────────────────────────────────────
  const handleRender = useCallback(async () => {
    if (images.length < 2) return
    setRendering(true)
    setRenderPct(0)
    setVideoBlob(null)
    setVideoUrl(null)
    setDownloaded(false)

    try {
      const blob = await renderImagesToVideo(images, videoTitle, videoStyle, pct => setRenderPct(pct))
      const url = URL.createObjectURL(blob)
      setVideoBlob(blob)
      setVideoUrl(url)
      setRenderPct(100)
    } catch (err: any) {
      console.error(err)
      alert('Rendering failed: ' + (err?.message || 'Unknown error'))
    } finally {
      setRendering(false)
    }
  }, [images, videoTitle, videoStyle])

  // ── Download video ──────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!videoUrl || !videoBlob) return
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = `shortsai_${(videoTitle || 'images_video').replace(/[^a-z0-9]/gi,'_')}.webm`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    setDownloaded(true)
  }

  // ── Script tab generate ──────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!script.trim()) return
    setGenerating(true)
    await sleep(3000)
    setGenerating(false)
    setGenerated(true)
  }

  const GRADIENTS = ['from-brand-red to-orange-500','from-purple-600 to-blue-500','from-green-500 to-teal-400','from-pink-500 to-rose-500']

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="font-display font-black text-2xl text-white">Text to Video</h1>
        <span className="badge-red text-[11px]">NEW</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 glass-card rounded-2xl w-fit">
        {[
          { key: 'images', icon: ImageIcon, label: 'Images → Video' },
          { key: 'script', icon: Type, label: 'Script → Video' },
        ].map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key
                  ? 'bg-brand-red text-white shadow-red-glow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── IMAGES TO VIDEO TAB ────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {tab === 'images' && (
          <motion.div key="images" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">

            {/* Settings row */}
            <div className="glass-card p-5 space-y-4">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Video Settings</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40">Video Title / Caption</label>
                  <input
                    className="input-field w-full text-sm"
                    placeholder="e.g. My Journey to Success…"
                    value={videoTitle}
                    onChange={e => setVideoTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40">Style</label>
                  <select className="input-field w-full text-sm" value={videoStyle} onChange={e => setVideoStyle(e.target.value)}>
                    {['Motivational','Educational','Entertainment','News','Storytelling','Tutorial'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Image upload zone */}
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                  Upload Images ({images.length}/6)
                </p>
                {images.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Clock className="w-3.5 h-3.5" />
                    Total: {totalDuration}s video
                  </div>
                )}
              </div>

              {/* Drop zone */}
              <motion.label
                htmlFor="img-upload"
                whileHover={{ borderColor: 'rgba(229,25,42,0.5)' }}
                className={`block border-2 border-dashed border-glass-border rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-brand-red/5 ${images.length >= 6 ? 'opacity-40 pointer-events-none' : ''}`}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleImageFiles(e.dataTransfer.files) }}
              >
                <input
                  id="img-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={e => handleImageFiles(e.target.files)}
                  disabled={images.length >= 6}
                />
                <div className="w-12 h-12 rounded-2xl bg-brand-red/15 border border-brand-red/30 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-brand-red" />
                </div>
                <p className="text-sm font-semibold text-white mb-1">
                  {images.length >= 6 ? 'Maximum 6 images reached' : 'Drop images here or click to browse'}
                </p>
                <p className="text-xs text-white/35">PNG, JPG, WEBP · Upload 2–6 images · Each image = one scene</p>
              </motion.label>

              {/* Image list */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-white/30">Drag to reorder · Set duration per scene</p>
                  <AnimatePresence>
                    {images.map((img, idx) => (
                      <motion.div
                        key={img.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-3 glass-card p-3 border-glass-border"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-glass-border">
                          <img src={img.url} className="w-full h-full object-cover" alt="" />
                        </div>

                        {/* Scene number + name */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-brand-red w-6">#{idx+1}</span>
                            <span className="text-sm text-white truncate font-medium">{img.name}</span>
                          </div>
                          {/* Duration selector */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-white/35">Duration:</span>
                            <div className="flex gap-1">
                              {[2,3,4,5,6,8].map(d => (
                                <button
                                  key={d}
                                  onClick={() => updateDuration(img.id, d)}
                                  className={`w-7 h-6 rounded-lg text-[10px] font-bold transition-all border ${
                                    img.duration === d
                                      ? 'bg-brand-red/20 border-brand-red/60 text-brand-red'
                                      : 'border-glass-border text-white/30 hover:border-brand-red/30'
                                  }`}
                                >
                                  {d}s
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Move up/down */}
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveImage(idx, -1)} disabled={idx === 0}
                            className="w-7 h-7 rounded-lg glass-card flex items-center justify-center text-white/30 hover:text-white disabled:opacity-20 transition-all">
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => moveImage(idx, 1)} disabled={idx === images.length - 1}
                            className="w-7 h-7 rounded-lg glass-card flex items-center justify-center text-white/30 hover:text-white disabled:opacity-20 transition-all">
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button onClick={() => removeImage(img.id)}
                          className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all flex-shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Generate button */}
            <motion.button
              whileHover={{ scale: images.length >= 2 && !rendering ? 1.02 : 1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRender}
              disabled={images.length < 2 || rendering}
              className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50"
            >
              {rendering
                ? <><Loader2 className="w-5 h-5 animate-spin" />Rendering… {renderPct}%</>
                : <><Film className="w-5 h-5" />Create Video from {images.length} Images ({totalDuration}s)</>
              }
            </motion.button>
            {images.length < 2 && (
              <p className="text-center text-xs text-white/30">Minimum 2 images required to create a video</p>
            )}

            {/* Render progress bar */}
            {rendering && (
              <div className="glass-card p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Rendering with Ken Burns effect + crossfades…</span>
                  <span className="text-brand-red font-bold">{renderPct}%</span>
                </div>
                <div className="progress-bar h-3">
                  <motion.div
                    className="progress-fill h-full rounded-full"
                    animate={{ width: `${renderPct}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-white/25 text-center">
                  ⚡ {images.length} images × avg {Math.round(totalDuration/images.length)}s each · Please wait…
                </p>
              </div>
            )}

            {/* Output video */}
            <AnimatePresence>
              {videoUrl && !rendering && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-5 space-y-4 border-green-500/30"
                >
                  <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                    <Sparkles className="w-4 h-4" />
                    Video ready! {totalDuration}s · {images.length} scenes · WebM format
                  </div>

                  {/* Video preview */}
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full max-h-72 rounded-2xl bg-dark-900 object-contain border border-glass-border"
                    style={{ maxWidth: '300px', margin: '0 auto', display: 'block' }}
                  />

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={handleDownload}
                      className={`btn-primary flex-1 justify-center py-3 ${downloaded ? 'bg-green-500/20 border-green-500/40 text-green-400' : ''}`}
                    >
                      {downloaded
                        ? <><Check className="w-4 h-4" /> Downloaded!</>
                        : <><Download className="w-4 h-4" /> Download Video (.webm)</>
                      }
                    </motion.button>
                    <button onClick={handleRender} className="btn-secondary py-3 px-4">
                      Re-render
                    </button>
                  </div>
                  <p className="text-xs text-white/25 text-center">
                    Upload to YouTube Shorts / Instagram Reels / TikTok directly
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── SCRIPT TO VIDEO TAB ───────────────────────────────────────────── */}
        {tab === 'script' && (
          <motion.div key="script" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="glass-card p-5 space-y-4">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Your Script or Topic</p>
                  <textarea
                    value={script}
                    onChange={e => setScript(e.target.value)}
                    placeholder="Enter your script, topic, or just paste a few key points..."
                    className="input-field w-full h-48 resize-none text-sm leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-xs text-white/25">
                    <span>{script.length} characters</span>
                    <span>Ideal: 150–400 characters for a 60s short</span>
                  </div>
                </div>
                <div className="glass-card p-5 space-y-4">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Settings</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-white/40">Voice</label>
                      <select className="input-field text-sm w-full" value={voice} onChange={e => setVoice(e.target.value)}>
                        {['AI Male','AI Female','Deep Male','Soft Female','Hindi Male','Hindi Female'].map(v => <option key={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-white/40">Language</label>
                      <select className="input-field text-sm w-full" value={language} onChange={e => setLanguage(e.target.value)}>
                        {['English','Hindi','Both (EN + HI)','Hinglish'].map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-white/40">Style</label>
                      <select className="input-field text-sm w-full" value={style} onChange={e => setStyle(e.target.value)}>
                        {['Motivational','Educational','Entertainment','News','Storytelling','Tutorial'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-white/40">Duration</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['30s','45s','60s'].map(d => (
                          <button key={d} onClick={() => setDuration(d)}
                            className={`py-2 rounded-xl text-xs font-semibold border transition-all ${duration===d?'border-brand-red/60 bg-brand-red/15 text-brand-red':'border-glass-border text-white/40'}`}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleGenerate} disabled={!script.trim() || generating}
                  className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50">
                  {generating ? <><div className="spinner w-5 h-5" />Generating…</> : <><Wand2 className="w-5 h-5" />Generate Video Short</>}
                </motion.button>
                {generated && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 border-green-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                      <Sparkles className="w-4 h-4" /> Your short is ready!
                    </div>
                    <div className="h-48 rounded-2xl bg-gradient-to-br from-brand-red to-orange-500 flex items-center justify-center cursor-pointer">
                      <Play className="w-12 h-12 text-white/80 fill-current" />
                    </div>
                    <button className="btn-primary w-full justify-center py-2.5 text-sm">
                      <Download className="w-4 h-4" /> Download Short
                    </button>
                  </motion.div>
                )}
              </div>
              <div className="glass-card p-5 space-y-3 h-fit">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Tips</p>
                {['Start with a powerful hook','Add emotion: secret, truth, mistake','Keep under 300 chars for 45s','Use numbers: "5 ways to…"'].map(tip => (
                  <div key={tip} className="flex items-start gap-2 text-xs text-white/50">
                    <span className="text-brand-red mt-0.5">✦</span>{tip}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
