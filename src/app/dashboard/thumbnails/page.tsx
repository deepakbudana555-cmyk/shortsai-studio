'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wand2, Download, RefreshCw, Check, Image as ImageIcon, Upload, X } from 'lucide-react'

// ── Thumbnail config ──────────────────────────────────────────────────────────
const W = 1280
const H = 720

interface ThumbConfig {
  id: number
  text: string
  subText: string
  emoji: string
  gradient: [string, string]
  textColor: string
  bgPattern: 'diagonal' | 'dots' | 'radial' | 'solid' | 'split' | 'dark'
  ctr: string
}

// ── Real canvas thumbnail renderer ───────────────────────────────────────────
async function renderThumbnail(
  cfg: ThumbConfig,
  title: string,
  style: string,
  faceImg: HTMLImageElement | null
): Promise<{ canvas: HTMLCanvasElement; blob: Blob }> {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // ── Background gradient ────────────────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, cfg.gradient[0])
  grad.addColorStop(1, cfg.gradient[1])
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // ── Pattern overlay ────────────────────────────────────────────────────────
  ctx.save()
  if (cfg.bgPattern === 'diagonal') {
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 2
    for (let x = -H; x < W + H; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke()
    }
  } else if (cfg.bgPattern === 'dots') {
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    for (let x = 0; x < W; x += 50)
      for (let y = 0; y < H; y += 50) {
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill()
      }
  } else if (cfg.bgPattern === 'radial') {
    const r = ctx.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.7, H * 0.3, H)
    r.addColorStop(0, 'rgba(255,255,255,0.15)')
    r.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = r; ctx.fillRect(0, 0, W, H)
  } else if (cfg.bgPattern === 'dark') {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, W, H)
  }
  ctx.restore()

  // ── Face photo (right side) ────────────────────────────────────────────────
  if (faceImg && faceImg.naturalWidth > 0) {
    ctx.save()
    const fh = H
    const fw = (faceImg.naturalWidth / faceImg.naturalHeight) * fh
    ctx.drawImage(faceImg, W - fw + 20, 0, fw, fh)
    // Dark gradient over face area for text readability
    const fGrad = ctx.createLinearGradient(W * 0.35, 0, W * 0.65, 0)
    fGrad.addColorStop(0, cfg.gradient[0] + 'FF')
    fGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = fGrad; ctx.fillRect(0, 0, W, H)
    ctx.restore()
  }

  // ── Left accent bar ────────────────────────────────────────────────────────
  if (style === 'Bold' || style === 'Dramatic') {
    ctx.save()
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillRect(30, H * 0.12, 8, H * 0.76)
    ctx.restore()
  }

  // ── Emoji (big) ───────────────────────────────────────────────────────────
  if (cfg.emoji && style !== 'Minimal') {
    ctx.save()
    ctx.font = '96px serif'
    ctx.textAlign = 'left'
    ctx.fillText(cfg.emoji, 55, 90)
    ctx.restore()
  }

  // ── Style tag pill ────────────────────────────────────────────────────────
  if (style === 'Dramatic' || style === 'Bold') {
    ctx.save()
    const tag = 'VIRAL'
    ctx.font = 'bold 22px Arial, sans-serif'
    const tw = ctx.measureText(tag).width
    const px = 55, py = 115, ph = 36
    ctx.fillStyle = 'rgba(229,25,42,0.9)'
    ctx.beginPath(); ctx.roundRect(px, py, tw + 24, ph, 8); ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(tag, px + 12, py + ph / 2)
    ctx.restore()
  }

  // ── Main title text ───────────────────────────────────────────────────────
  const displayText = (title || cfg.text).toUpperCase()
  const words = displayText.split(' ')
  const maxWidth = faceImg ? W * 0.52 : W * 0.82

  ctx.save()
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  let fontSize = style === 'Minimal' ? 64 : style === 'Cinematic' ? 72 : 86
  ctx.font = `900 ${fontSize}px Impact, Arial Black, sans-serif`

  // Word-wrap
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur); cur = w
    } else { cur = test }
  }
  if (cur) lines.push(cur)
  if (lines.length > 3) { lines.length = 3; lines[2] += '…' }

  const lh = fontSize * 1.1
  const startY = H * 0.28
  const startX = 55

  lines.forEach((line, i) => {
    const y = startY + i * lh
    // Stroke (outline)
    ctx.font = `900 ${fontSize}px Impact, Arial Black, sans-serif`
    ctx.strokeStyle = 'rgba(0,0,0,0.9)'
    ctx.lineWidth = 10
    ctx.lineJoin = 'round'
    ctx.strokeText(line, startX, y)
    // Fill
    ctx.fillStyle = cfg.textColor
    ctx.fillText(line, startX, y)
  })
  ctx.restore()

  // ── Sub text ──────────────────────────────────────────────────────────────
  if (cfg.subText && style !== 'Minimal') {
    const subY = H * 0.28 + lines.length * lh + 20
    ctx.save()
    ctx.font = 'bold 32px Arial, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(cfg.subText, 55, subY)
    ctx.restore()
  }

  // ── CTR badge (top right) ─────────────────────────────────────────────────
  ctx.save()
  const badge = `🔥 ${cfg.ctr} CTR`
  ctx.font = 'bold 20px Arial, sans-serif'
  const bw = ctx.measureText(badge).width + 28
  ctx.fillStyle = 'rgba(0,0,0,0.65)'
  ctx.beginPath(); ctx.roundRect(W - bw - 16, 16, bw, 36, 18); ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText(badge, W - 16 - 6, 16 + 18)
  ctx.restore()

  // ── ShortsAI watermark ────────────────────────────────────────────────────
  ctx.save()
  ctx.globalAlpha = 0.35
  ctx.font = '18px Arial, sans-serif'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillText('ShortsAI Studio', 20, H - 12)
  ctx.restore()

  // Export blob
  const blob = await new Promise<Blob>(resolve =>
    canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.95)
  )
  return { canvas, blob }
}

// ── Thumbnail presets ─────────────────────────────────────────────────────────
const PRESETS: ThumbConfig[] = [
  { id: 1, text: 'MINDSET SHIFT!', subText: 'Watch till the end 👇', emoji: '🧠', gradient: ['#E5192A','#FF6B00'], textColor: '#FFFFFF', bgPattern: 'diagonal', ctr: '9.4%' },
  { id: 2, text: 'THIS CHANGED MY LIFE', subText: 'Real Story Inside', emoji: '✨', gradient: ['#4F0599','#1A4FCC'], textColor: '#FFFFFF', bgPattern: 'radial', ctr: '8.7%' },
  { id: 3, text: 'GROWTH SECRET', subText: 'Nobody tells you this', emoji: '🚀', gradient: ['#064E3B','#0F766E'], textColor: '#34D399', bgPattern: 'dots', ctr: '8.1%' },
  { id: 4, text: 'SHOCKING TRUTH', subText: 'Must Watch', emoji: '⚡', gradient: ['#831843','#BE185D'], textColor: '#FDE68A', bgPattern: 'solid', ctr: '7.9%' },
  { id: 5, text: '#1 MISTAKE YOU MAKE', subText: 'Fix this NOW', emoji: '❌', gradient: ['#78350F','#B45309'], textColor: '#FEF3C7', bgPattern: 'diagonal', ctr: '7.4%' },
  { id: 6, text: 'SUCCESS FORMULA', subText: 'Step-by-step guide', emoji: '🏆', gradient: ['#1E1B4B','#4338CA'], textColor: '#C7D2FE', bgPattern: 'radial', ctr: '7.1%' },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function ThumbnailsPage() {
  const [title, setTitle] = useState('')
  const [style, setStyle] = useState('Dramatic')
  const [generating, setGenerating] = useState(false)
  const [thumbnails, setThumbnails] = useState<{ cfg: ThumbConfig; dataUrl: string; blob: Blob }[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [downloading, setDownloading] = useState<number | null>(null)
  const [faceImg, setFaceImg] = useState<HTMLImageElement | null>(null)
  const [facePreview, setFacePreview] = useState<string | null>(null)
  const faceInputRef = useRef<HTMLInputElement>(null)

  // Load face photo
  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setFacePreview(url)
    const img = new Image()
    img.onload = () => setFaceImg(img)
    img.src = url
  }

  // Generate all 6 thumbnails on canvas
  const handleGenerate = useCallback(async () => {
    if (!title.trim() && !PRESETS[0].text) return
    setGenerating(true)
    setThumbnails([])
    setSelected(null)

    const results: { cfg: ThumbConfig; dataUrl: string; blob: Blob }[] = []
    for (const cfg of PRESETS) {
      const { canvas, blob } = await renderThumbnail(cfg, title, style, faceImg)
      results.push({ cfg, dataUrl: canvas.toDataURL('image/jpeg', 0.95), blob })
      setThumbnails([...results]) // show as they render
    }
    setGenerating(false)
    setSelected(0)
  }, [title, style, faceImg])

  // Download single thumbnail
  const handleDownload = useCallback((idx: number) => {
    const t = thumbnails[idx]
    if (!t) return
    setDownloading(idx)
    const url = URL.createObjectURL(t.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `thumbnail_${idx + 1}_${(title || 'shortsai').replace(/[^a-z0-9]/gi, '_')}_HD.jpg`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setTimeout(() => setDownloading(null), 1500)
  }, [thumbnails, title])

  // Download all
  const handleDownloadAll = useCallback(async () => {
    for (let i = 0; i < thumbnails.length; i++) {
      handleDownload(i)
      await new Promise(r => setTimeout(r, 400))
    }
  }, [thumbnails, handleDownload])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl text-white">Thumbnail Generator</h1>
        <p className="text-sm text-white/40 mt-1">Real HD thumbnails rendered on your device — 1280×720 JPEG, ready to upload</p>
      </div>

      {/* Generator panel */}
      <div className="glass-card p-5 space-y-5">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Generate New Thumbnails</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Title input */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs text-white/40">Video Title / Topic <span className="text-brand-red">*</span></label>
            <input
              className="input-field w-full text-sm"
              placeholder="e.g. 5 Habits That Changed My Life…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          {/* Style */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/40">Style</label>
            <select className="input-field w-full text-sm" value={style} onChange={e => setStyle(e.target.value)}>
              {['Dramatic', 'Bold', 'Clean', 'Minimal', 'Cinematic', 'Neon'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Face photo upload */}
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <label className="text-xs text-white/40">Your Face Photo <span className="text-white/25">(optional — adds you to thumbnails)</span></label>
            <div className="flex items-center gap-3">
              {facePreview ? (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-brand-red/50 flex-shrink-0">
                  <img src={facePreview} className="w-full h-full object-cover" alt="face" />
                  <button onClick={() => { setFaceImg(null); setFacePreview(null) }}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-brand-red flex items-center justify-center">
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ) : (
                <button onClick={() => faceInputRef.current?.click()}
                  className="w-14 h-14 rounded-xl border-2 border-dashed border-glass-border flex items-center justify-center text-white/30 hover:border-brand-red/50 hover:text-brand-red transition-all flex-shrink-0">
                  <Upload className="w-5 h-5" />
                </button>
              )}
              <input ref={faceInputRef} type="file" accept="image/*" className="hidden" onChange={handleFaceUpload} />
              <p className="text-xs text-white/30">Upload PNG/JPG · Face will appear on right side of thumbnail</p>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleGenerate}
          disabled={!title.trim() || generating}
          className="btn-primary py-3.5 px-8 text-base disabled:opacity-50"
        >
          {generating ? <div className="spinner w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
          {generating ? `Rendering thumbnails… (${thumbnails.length}/6)` : 'Generate 6 HD Thumbnails'}
        </motion.button>
        {!title.trim() && <p className="text-xs text-white/30">↑ Enter a title first to generate</p>}
      </div>

      {/* Empty state */}
      {thumbnails.length === 0 && !generating && (
        <div className="glass-card p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center mx-auto">
            <ImageIcon className="w-8 h-8 text-brand-red/50" />
          </div>
          <div>
            <p className="text-white font-semibold">No thumbnails yet</p>
            <p className="text-white/40 text-sm mt-1">Enter your video title above and click Generate — 6 HD thumbnails will be created instantly on your device.</p>
          </div>
        </div>
      )}

      {/* Thumbnail grid — shows as they render */}
      {thumbnails.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
              {generating ? `Rendering… ${thumbnails.length}/6` : `${thumbnails.length} Thumbnails Ready — Click to Select`}
            </p>
            {!generating && (
              <button onClick={handleDownloadAll} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Download All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {thumbnails.map((t, i) => (
                <motion.div
                  key={t.cfg.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelected(i)}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all group ${selected === i ? 'ring-3 ring-brand-red shadow-red-glow-sm' : 'hover:ring-2 hover:ring-white/20'}`}
                  style={{ aspectRatio: '16/9' }}
                >
                  <img src={t.dataUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />

                  {/* Selected check */}
                  {selected === i && (
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-brand-red flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  {/* CTR badge */}
                  <div className="absolute top-2 right-2 bg-black/70 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {t.cfg.ctr} CTR
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={e => { e.stopPropagation(); handleDownload(i) }}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl ${downloading === i ? 'bg-green-500 text-white' : 'bg-brand-red text-white'}`}
                    >
                      {downloading === i ? <><Check className="w-3.5 h-3.5" />Saved!</> : <><Download className="w-3.5 h-3.5" />Download HD</>}
                    </motion.button>
                    <button
                      onClick={e => { e.stopPropagation(); handleGenerate() }}
                      className="w-8 h-8 bg-dark-600/90 text-white rounded-xl flex items-center justify-center hover:bg-dark-500"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Skeleton placeholders while generating */}
            {generating && Array.from({ length: 6 - thumbnails.length }).map((_, i) => (
              <div key={`sk_${i}`} className="rounded-2xl bg-dark-700 animate-pulse border border-glass-border" style={{ aspectRatio: '16/9' }} />
            ))}
          </div>

          {/* Selected thumbnail action bar */}
          {selected !== null && thumbnails[selected] && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={thumbnails[selected].dataUrl} className="w-24 h-14 rounded-xl object-cover border border-glass-border" alt="" />
                <div>
                  <p className="text-sm font-semibold text-white">Thumbnail {selected + 1} selected</p>
                  <p className="text-xs text-white/40">1280×720 HD · JPEG · Predicted CTR: {thumbnails[selected].cfg.ctr}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleDownload(selected)}
                  className={`btn-primary text-sm py-2.5 px-5 ${downloading === selected ? 'bg-green-500/20 border-green-500/40 text-green-400' : ''}`}>
                  {downloading === selected ? <><Check className="w-4 h-4" />Downloaded!</> : <><Download className="w-4 h-4" />Download HD</>}
                </motion.button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}
