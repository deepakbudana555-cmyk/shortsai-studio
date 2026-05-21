'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Download, Check, Loader2, AlertCircle, ExternalLink,
  FileVideo, Zap, Image as ImageIcon, Film
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────
interface SceneImageData {
  sceneId: string | number
  imageUrl: string
  fileName: string
  fitMode: 'cover' | 'contain' | 'fill'
  opacity: number
  position: { x: number; y: number }
  brightness: number
  contrast: number
  isCustom: boolean
}

interface ExportProgressModalProps {
  isOpen: boolean
  onClose: () => void
  shorts: any[]
  sceneImages: Record<string | number, SceneImageData>
  platforms: Record<string, boolean>
}

interface ExportedFile {
  id: string | number
  title: string
  blob: Blob
  filename: string
  url: string
  viral_score: number
  duration: number
  hasCustomImage: boolean
  size: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}


// ── Background music generator (Web Audio API) ────────────────────────────────
function createMotivationalMusic(
  audioCtx: AudioContext,
  dest: MediaStreamAudioDestinationNode,
  durationSec: number
) {
  const now = audioCtx.currentTime
  const BPM = 120
  const beat = 60 / BPM          // 0.5s per beat
  const totalBeats = Math.ceil(durationSec / beat)

  // ── Master gain ──────────────────────────────────────────────────────────────
  const master = audioCtx.createGain()
  master.gain.setValueAtTime(0.45, now)
  master.connect(dest)

  // ── Compressor (keeps levels clean) ─────────────────────────────────────────
  const comp = audioCtx.createDynamicsCompressor()
  comp.threshold.value = -18; comp.ratio.value = 4
  comp.connect(master)

  // ── Reverb (convolver → gain) ────────────────────────────────────────────────
  const reverb = audioCtx.createGain()
  reverb.gain.value = 0.18
  reverb.connect(comp)

  // Helper: play a note
  const playNote = (
    freq: number, startTime: number, duration: number,
    type: OscillatorType = 'sine', vol = 0.3, detune = 0
  ) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, startTime)
    osc.detune.setValueAtTime(detune, startTime)
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
    osc.connect(gain); gain.connect(comp)
    osc.start(startTime); osc.stop(startTime + duration + 0.05)
  }

  // ── Bass line (every beat) ───────────────────────────────────────────────────
  const bassNotes = [55, 55, 65.41, 65.41, 49, 49, 55, 55]   // A1, A1, C2, C2…
  for (let b = 0; b < totalBeats; b++) {
    const t = now + b * beat
    playNote(bassNotes[b % bassNotes.length], t, beat * 0.7, 'triangle', 0.38)
  }

  // ── Kick drum (every beat) ───────────────────────────────────────────────────
  for (let b = 0; b < totalBeats; b++) {
    const t = now + b * beat
    const kick = audioCtx.createOscillator()
    const kickGain = audioCtx.createGain()
    kick.frequency.setValueAtTime(150, t)
    kick.frequency.exponentialRampToValueAtTime(40, t + 0.1)
    kickGain.gain.setValueAtTime(0.9, t)
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
    kick.connect(kickGain); kickGain.connect(comp)
    kick.start(t); kick.stop(t + 0.35)
  }

  // ── Snare (every 2nd beat) ───────────────────────────────────────────────────
  for (let b = 1; b < totalBeats; b += 2) {
    const t = now + b * beat
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.15, audioCtx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    const snare = audioCtx.createBufferSource()
    const snareGain = audioCtx.createGain()
    snare.buffer = buf
    snareGain.gain.setValueAtTime(0.55, t)
    snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
    snare.connect(snareGain); snareGain.connect(comp)
    snare.start(t)
  }

  // ── Hi-hat (every half beat) ──────────────────────────────────────────────────
  for (let b = 0; b < totalBeats * 2; b++) {
    const t = now + b * (beat / 2)
    const hiBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.05, audioCtx.sampleRate)
    const hiData = hiBuf.getChannelData(0)
    for (let i = 0; i < hiData.length; i++) hiData[i] = (Math.random() * 2 - 1) * (1 - i / hiData.length)
    const hiSrc = audioCtx.createBufferSource()
    const hiFilter = audioCtx.createBiquadFilter()
    const hiGain = audioCtx.createGain()
    hiSrc.buffer = hiBuf
    hiFilter.type = 'highpass'; hiFilter.frequency.value = 8000
    hiGain.gain.setValueAtTime(0.18, t)
    hiGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
    hiSrc.connect(hiFilter); hiFilter.connect(hiGain); hiGain.connect(comp)
    hiSrc.start(t)
  }

  // ── Melody (motivational chord arpeggio) ──────────────────────────────────────
  const melodyNotes = [
    // A minor pentatonic - uplifting arpeggio
    220, 261.63, 329.63, 392, 440,
    392, 329.63, 261.63, 329.63, 392,
    440, 523.25, 587.33, 523.25, 440,
    392, 329.63, 261.63, 220, 261.63,
  ]
  for (let b = 0; b < totalBeats; b++) {
    const t = now + b * beat
    const note = melodyNotes[b % melodyNotes.length]
    playNote(note, t, beat * 0.45, 'sine', 0.12)
    playNote(note, t + 0.01, beat * 0.45, 'square', 0.03, 5) // slight detune for richness
  }

  // ── Pad (sustained chords, soft) ─────────────────────────────────────────────
  const chords = [[220, 261.63, 329.63], [196, 246.94, 293.66], [174.61, 220, 261.63]]
  for (let measure = 0; measure < Math.ceil(totalBeats / 4); measure++) {
    const t = now + measure * beat * 4
    const chord = chords[measure % chords.length]
    chord.forEach((freq, i) => {
      playNote(freq, t, beat * 4 * 0.95, 'sine', 0.07, i * 3)
    })
  }
}

// ── Core: Draw one frame + record audio ──────────────────────────────────────
async function compositeShortToBlob(
  short: any,
  sceneImage: SceneImageData | undefined,
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const W = 1080, H = 1920
  const FPS = 8
  const DURATION_S = 15   // output video length

  // ── Canvas ───────────────────────────────────────────────────────────────────
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  if (onProgress) onProgress(5)

  // ── Load image ───────────────────────────────────────────────────────────────
  let img: HTMLImageElement | null = null
  if (sceneImage?.imageUrl) {
    img = await new Promise<HTMLImageElement>(resolve => {
      const i = new Image()
      i.crossOrigin = 'anonymous'
      i.onload  = () => resolve(i)
      i.onerror = () => resolve(new Image())
      i.src = sceneImage.imageUrl
    })
  }

  if (onProgress) onProgress(15)

  // ── Draw ONCE (instant) ───────────────────────────────────────────────────────
  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#0D0D14'); grad.addColorStop(1, '#0A0A0F')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)

  // Red glow
  const glow = ctx.createRadialGradient(W/2, H*0.4, 0, W/2, H*0.4, W)
  glow.addColorStop(0, 'rgba(229,25,42,0.18)'); glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H)

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 1
  for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
  for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }

  // Custom image
  if (img && img.naturalWidth > 0 && sceneImage) {
    ctx.save()
    ctx.globalAlpha = sceneImage.opacity / 100
    ctx.filter = `brightness(${sceneImage.brightness}%) contrast(${sceneImage.contrast}%)`
    const iw = img.naturalWidth, ih = img.naturalHeight
    let dx = 0, dy = 0, dw = W, dh = H
    if (sceneImage.fitMode === 'cover') {
      const scale = Math.max(W / iw, H / ih)
      dw = iw * scale; dh = ih * scale
      dx = (W - dw) * ((sceneImage.position?.x ?? 50) / 100)
      dy = (H - dh) * ((sceneImage.position?.y ?? 50) / 100)
    } else if (sceneImage.fitMode === 'contain') {
      const scale = Math.min(W / iw, H / ih)
      dw = iw * scale; dh = ih * scale
      dx = (W - dw) / 2; dy = (H - dh) / 2
    }
    ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh)
    ctx.filter = 'none'; ctx.restore()
  } else {
    // Glowing circles
    [[W*0.2,H*0.3,200],[W*0.8,H*0.5,160],[W*0.5,H*0.2,240],[W*0.3,H*0.7,180]].forEach(([cx,cy,r]) => {
      const g2 = ctx.createRadialGradient(cx,cy,0,cx,cy,r)
      g2.addColorStop(0,'rgba(229,25,42,0.15)'); g2.addColorStop(1,'rgba(0,0,0,0)')
      ctx.fillStyle=g2; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill()
    })
  }

  // Bottom gradient bar
  const barGrad = ctx.createLinearGradient(0, H*0.6, 0, H)
  barGrad.addColorStop(0,'rgba(0,0,0,0)'); barGrad.addColorStop(0.3,'rgba(0,0,0,0.85)'); barGrad.addColorStop(1,'rgba(0,0,0,0.97)')
  ctx.fillStyle = barGrad; ctx.fillRect(0, H*0.6, W, H*0.4)

  // Caption
  const caption = (short.title || 'Short Video').toUpperCase()
  const words = caption.split(' ')
  const mid = Math.ceil(words.length / 2)
  const lines = [words.slice(0,mid).join(' '), words.slice(mid).join(' ')].filter(Boolean)
  ctx.textAlign = 'center'; ctx.font = 'bold 80px Impact, Arial Black, sans-serif'; ctx.lineJoin = 'round'
  lines.forEach((line, i) => {
    const y = H - 200 + i * 95
    ctx.strokeStyle='rgba(0,0,0,0.95)'; ctx.lineWidth=10; ctx.strokeText(line,W/2,y)
    ctx.fillStyle='#FFFFFF'; ctx.fillText(line,W/2,y)
  })

  // Music note icon
  ctx.globalAlpha=0.7; ctx.font='52px serif'; ctx.textAlign='left'; ctx.textBaseline='bottom'
  ctx.fillText('🎵', 44, H-48); ctx.globalAlpha=1

  // Viral badge
  const badgeText = `🔥 ${short.viral_score||85}% Viral`
  ctx.font='bold 28px Arial,sans-serif'
  const bw=ctx.measureText(badgeText).width+32, bh=56, bx=W-bw-36, by=50
  ctx.fillStyle='rgba(229,25,42,0.92)'; ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,28); ctx.fill()
  ctx.fillStyle='#FFF'; ctx.textAlign='center'; ctx.textBaseline='middle'
  ctx.fillText(badgeText, bx+bw/2, by+bh/2)

  // Watermark
  ctx.globalAlpha=0.35; ctx.fillStyle='#FFF'; ctx.font='22px Arial,sans-serif'
  ctx.textAlign='left'; ctx.textBaseline='top'; ctx.fillText('⚡ ShortsAI Studio', 40, 42)
  ctx.globalAlpha=1

  if (onProgress) onProgress(30)

  // ── Audio + MediaRecorder ─────────────────────────────────────────────────────
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  const audioDest = audioCtx.createMediaStreamDestination()
  createMotivationalMusic(audioCtx, audioDest, DURATION_S + 0.5)

  const videoStream = canvas.captureStream(FPS)
  audioDest.stream.getAudioTracks().forEach(t => videoStream.addTrack(t))

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
    ? 'video/webm;codecs=vp8,opus'
    : 'video/webm'

  const recorder = new MediaRecorder(videoStream, { mimeType, videoBitsPerSecond: 3_000_000 })
  const chunks: Blob[] = []
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }

  // Start recording
  await new Promise<void>(r => { recorder.onstart = () => r(); recorder.start(500) })

  if (onProgress) onProgress(35)

  // ── Just WAIT for the duration — canvas holds last frame automatically ────────
  // Progress ticks every second
  for (let s = 0; s < DURATION_S; s++) {
    await sleep(1000)
    if (onProgress) onProgress(35 + Math.round((s / DURATION_S) * 60))
  }

  if (onProgress) onProgress(97)

  return new Promise(resolve => {
    recorder.onstop = () => { audioCtx.close(); resolve(new Blob(chunks, { type: mimeType })) }
    recorder.stop()
    videoStream.getTracks().forEach(t => t.stop())
  })
}


// ── Main Modal ────────────────────────────────────────────────────────────────
export default function ExportProgressModal({
  isOpen, onClose, shorts, sceneImages, platforms,
}: ExportProgressModalProps) {
  const [phase, setPhase] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [currentShortIdx, setCurrentShortIdx] = useState(0)
  const [currentShortPct, setCurrentShortPct] = useState(0)
  const [exportedFiles, setExportedFiles] = useState<ExportedFile[]>([])
  const [downloading, setDownloading] = useState<Set<string | number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const customCount = Object.keys(sceneImages).length
  const platformList = Object.keys(platforms).filter(k => platforms[k])
  const totalPct = shorts.length
    ? Math.round(((currentShortIdx + currentShortPct / 100) / shorts.length) * 100)
    : 0

  // ── Run export when modal opens ───────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !shorts.length) return
    setPhase('processing')
    setCurrentShortIdx(0)
    setCurrentShortPct(0)
    setExportedFiles([])
    setError(null)

    const run = async () => {
      const files: ExportedFile[] = []
      try {
        for (let i = 0; i < shorts.length; i++) {
          setCurrentShortIdx(i)
          setCurrentShortPct(0)
          const short = shorts[i]
          const sceneImg = sceneImages[short.id]

          const blob = await compositeShortToBlob(short, sceneImg, pct => setCurrentShortPct(pct))

          const ext = blob.type.includes('webm') ? 'webm' : 'mp4'
          const filename = `shortsai_${(short.title || `short_${i + 1}`).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.${ext}`
          const url = URL.createObjectURL(blob)

          files.push({
            id: short.id,
            title: short.title || `Short ${i + 1}`,
            blob,
            filename,
            url,
            viral_score: short.viral_score || 85,
            duration: short.duration || 45,
            hasCustomImage: !!sceneImg,
            size: formatBytes(blob.size),
          })
          setExportedFiles([...files])
        }
        setPhase('done')
      } catch (err: any) {
        console.error('[EXPORT]', err)
        setError(err?.message || 'Export failed. Your browser may not support MediaRecorder.')
        setPhase('error')
      }
    }

    run()
    // Cleanup object URLs on close
    return () => { exportedFiles.forEach(f => URL.revokeObjectURL(f.url)) }
  }, [isOpen])

  // ── Download single file ──────────────────────────────────────────────────
  const downloadFile = useCallback((file: ExportedFile) => {
    setDownloading(prev => new Set(prev).add(file.id))
    const a = document.createElement('a')
    a.href = file.url
    a.download = file.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => setDownloading(prev => { const s = new Set(prev); s.delete(file.id); return s }), 1000)
  }, [])

  // ── Download all ──────────────────────────────────────────────────────────
  const downloadAll = useCallback(async () => {
    for (const file of exportedFiles) {
      downloadFile(file)
      await sleep(500)
    }
  }, [exportedFiles, downloadFile])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={phase === 'done' || phase === 'error' ? onClose : undefined} />

          <motion.div
            className="relative w-full max-w-lg glass-card overflow-hidden z-10 rounded-3xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-brand-red to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-glass-border">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  phase === 'done' ? 'bg-green-500/20 border border-green-500/40' :
                  phase === 'error' ? 'bg-red-500/20 border border-red-500/40' :
                  'bg-brand-red/20 border border-brand-red/30'
                }`}>
                  {phase === 'done' ? <Check className="w-5 h-5 text-green-400" /> :
                   phase === 'error' ? <AlertCircle className="w-5 h-5 text-red-400" /> :
                   <Zap className="w-5 h-5 text-brand-red animate-pulse" />}
                </div>
                <div>
                  <h2 className="font-display font-bold text-base text-white">
                    {phase === 'done' ? '✅ Export Complete — Ready to Download!' :
                     phase === 'error' ? 'Export Failed' :
                     `Rendering Short ${currentShortIdx + 1} of ${shorts.length}…`}
                  </h2>
                  <p className="text-xs text-white/40">
                    {customCount > 0 ? `${customCount} custom images embedded · ` : ''}
                    {platformList.join(', ')}
                  </p>
                </div>
              </div>
              {(phase === 'done' || phase === 'error') && (
                <button onClick={onClose} className="btn-ghost p-2 rounded-xl"><X className="w-4 h-4" /></button>
              )}
            </div>

            {/* ── Processing ── */}
            {phase === 'processing' && (
              <div className="p-6 space-y-5">
                {/* Overall progress */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-white/50">Overall Progress</span>
                    <span className="text-xs font-bold text-brand-red">{totalPct}%</span>
                  </div>
                  <div className="progress-bar h-3">
                    <motion.div
                      className="progress-fill h-full rounded-full"
                      animate={{ width: `${totalPct}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Current short progress */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-white/40">
                      {shorts[currentShortIdx]?.title || `Short ${currentShortIdx + 1}`}
                    </span>
                    <span className="text-xs text-white/40">{currentShortPct}%</span>
                  </div>
                  <div className="progress-bar h-1.5">
                    <motion.div
                      className="h-full rounded-full bg-white/40"
                      animate={{ width: `${currentShortPct}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </div>

                {/* What's happening */}
                <div className="glass-card p-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Loader2 className="w-4 h-4 text-brand-red animate-spin flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        🎵 Rendering video + music — ~{Math.ceil((shorts.length - exportedFiles.length) * 10)}s remaining
                      </p>
                      <p className="text-xs text-white/35 mt-0.5">
                        {sceneImages[shorts[currentShortIdx]?.id]
                          ? '🖼️ Custom image + motivational beat composited in real-time'
                          : '🎼 120 BPM beat · bass · melody · drums — all baked into WebM'}
                      </p>
                    </div>
                  </div>
                  {/* Music visualizer bars */}
                  <div className="flex items-end gap-0.5 h-6">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className="wave-bar flex-1"
                        style={{ animationDelay: `${i * 0.07}s` }} />
                    ))}
                  </div>
                  <p className="text-[10px] text-white/20 text-center">
                    🎵 Background music baking into your video file…
                  </p>
                </div>

                {/* Already done */}
                {exportedFiles.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Completed</p>
                    {exportedFiles.map(f => (
                      <div key={f.id} className="flex items-center gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        <span className="text-white/60 truncate flex-1">{f.title}</span>
                        <span className="text-white/30">{f.size}</span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-center text-[11px] text-white/25">
                  ⚡ Client-side rendering — no upload needed · Please keep this window open
                </p>
              </div>
            )}

            {/* ── Error ── */}
            {phase === 'error' && (
              <div className="p-8 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                <div>
                  <p className="text-sm text-white/70 mb-1">{error}</p>
                  <p className="text-xs text-white/35">Try using Chrome or Edge for best compatibility.</p>
                </div>
                <button onClick={onClose} className="btn-primary mx-auto">Close</button>
              </div>
            )}

            {/* ── Done — real download list ── */}
            {phase === 'done' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-4">
                {/* Summary */}
                <div className="flex flex-wrap gap-2">
                  <span className="badge-green">{exportedFiles.length} shorts rendered</span>
                  {customCount > 0 && <span className="badge-blue">{customCount} custom images</span>}
                  <span className="badge-red">WebM · HD Quality</span>
                </div>

                {/* Download cards */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {exportedFiles.map((file, i) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-3.5 flex items-center gap-3"
                    >
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                        file.hasCustomImage ? 'bg-green-500/10 border-green-500/30' : 'bg-brand-red/10 border-brand-red/20'
                      }`}>
                        {file.hasCustomImage
                          ? <ImageIcon className="w-5 h-5 text-green-400" />
                          : <Film className="w-5 h-5 text-brand-red" />}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{file.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-white/35 mt-0.5 flex-wrap">
                          <span>{file.duration}s</span>
                          <span>·</span>
                          <span className="text-brand-red font-bold">{file.viral_score}% viral</span>
                          <span>·</span>
                          <span className="text-white/50">{file.size}</span>
                          {file.hasCustomImage && (
                            <span className="text-green-400 font-semibold">✓ Custom image</span>
                          )}
                        </div>
                      </div>

                      {/* Download button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => downloadFile(file)}
                        disabled={downloading.has(file.id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all flex-shrink-0 ${
                          downloading.has(file.id)
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-brand-red/20 border border-brand-red/40 text-brand-red hover:bg-brand-red/30'
                        }`}
                      >
                        {downloading.has(file.id)
                          ? <><Check className="w-3.5 h-3.5" /> Saved!</>
                          : <><Download className="w-3.5 h-3.5" /> Download</>}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>

                {/* Download all */}
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={downloadAll}
                  className="btn-primary w-full justify-center py-3.5 text-base"
                >
                  <Download className="w-5 h-5" />
                  Download All {exportedFiles.length} Shorts
                </motion.button>

                {/* Upload to platform links */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'YouTube', icon: '▶', href: 'https://studio.youtube.com/channel/upload' },
                    { label: 'Instagram', icon: '📸', href: 'https://www.instagram.com/' },
                    { label: 'TikTok', icon: '🎵', href: 'https://www.tiktok.com/upload' },
                  ].map(p => (
                    <a key={p.label} href={p.href} target="_blank" rel="noopener noreferrer"
                      className="glass-card p-2.5 flex flex-col items-center gap-1 hover:border-white/20 transition-all cursor-pointer text-center">
                      <span className="text-base">{p.icon}</span>
                      <span className="text-[10px] font-semibold text-white/60">{p.label}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-white/20" />
                    </a>
                  ))}
                </div>

                <p className="text-center text-[10px] text-white/20">
                  Videos rendered locally on your device · No data sent to server
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
