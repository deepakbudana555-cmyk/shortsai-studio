'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload as UploadIcon, CheckCircle2, AlertCircle, Cpu } from 'lucide-react'

export function UploadZone() {
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Uploading Video...')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setProgress(0)
    setError(null)
    setSuccess(false)
    setStatusText('Uploading Video...')

    try {
      // ── Step 1: Upload the raw file ──────────────────────────────────────
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/upload', true)

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        }

        xhr.onload = () => {
          try {
            const res = JSON.parse(xhr.responseText)
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(res)
            } else {
              reject(new Error(res.error || `HTTP ${xhr.status}`))
            }
          } catch {
            reject(new Error(`HTTP ${xhr.status}`))
          }
        }

        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.send(formData)
      })

      // ── Step 2: Process with FFmpeg ──────────────────────────────────────
      setIsUploading(false)
      setIsProcessing(true)
      setStatusText('AI is cutting your video into viral shorts...')
      setProgress(0)

      // Fake progress animation while FFmpeg runs
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 2, 90))
      }, 800)

      const processRes = await fetch('/api/process-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputPath: uploadRes.inputPath,
          projectId: uploadRes.projectId,
          safeFileName: uploadRes.safeFileName,
          quality: '1080x1920',
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!processRes.ok) {
        const errData = await processRes.json()
        throw new Error(errData.error || 'Processing failed')
      }

      const processData = await processRes.json()

      // ── Step 3: Save result & redirect ──────────────────────────────────
      const existing = JSON.parse(localStorage.getItem('mock_projects') || '[]')
      existing.unshift(processData.project)
      localStorage.setItem('mock_projects', JSON.stringify(existing))

      window.dispatchEvent(new Event('project_uploaded'))
      setIsProcessing(false)
      setSuccess(true)

      setTimeout(() => {
        window.location.href = '/dashboard/studio'
      }, 1500)

    } catch (err: any) {
      setIsUploading(false)
      setIsProcessing(false)
      setError(err.message || 'An unexpected error occurred.')
    }
  }

  const busy = isUploading || isProcessing

  return (
    <motion.label
      htmlFor="quick-upload"
      whileHover={busy ? {} : { borderColor: 'rgba(229,25,42,0.5)', backgroundColor: 'rgba(229,25,42,0.04)' }}
      className="upload-zone p-10 cursor-pointer block relative overflow-hidden"
    >
      <input
        id="quick-upload"
        type="file"
        accept="video/*"
        className="hidden"
        onChange={onFileChange}
        disabled={busy}
      />

      <AnimatePresence mode="wait">
        {!busy && !success && !error && (
          <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="w-14 h-14 rounded-2xl bg-brand-red/15 border border-brand-red/30 flex items-center justify-center mx-auto mb-4">
              <UploadIcon className="w-7 h-7 text-brand-red" />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2 text-center">Drop Your Video Here</h3>
            <p className="text-sm text-white/40 mb-1 text-center">MP4, MOV, AVI, MKV · <span className="text-brand-red font-semibold">No time limit</span> · Any size</p>
            <p className="text-xs text-white/25 mb-4 text-center">5 min podcast or 4 hour recording — all supported</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="badge-red">Auto Viral Detection</span>
              <span className="badge-blue">9:16 Reframing</span>
              <span className="badge-green">HD Export</span>
            </div>
          </motion.div>
        )}

        {busy && (
          <motion.div key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-4">
            {isProcessing
              ? <Cpu className="w-12 h-12 text-brand-red animate-pulse" />
              : <div className="w-16 h-16 rounded-full border-4 border-brand-red/20 border-t-brand-red animate-spin" />
            }
            <h3 className="font-display font-bold text-lg text-white text-center">{statusText}</h3>
            <div className="w-full max-w-md bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-brand-red h-3 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className="text-sm text-white/50 text-center">
              {isProcessing ? 'FFmpeg is cropping to 9:16 & splitting clips…' : `${progress}% Uploaded`}
            </p>
          </motion.div>
        )}

        {success && (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="font-display font-bold text-lg text-white text-center">Shorts Ready! Redirecting…</h3>
          </motion.div>
        )}

        {error && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="font-display font-bold text-lg text-white text-center">Upload Failed</h3>
            <p className="text-sm text-red-400 text-center max-w-xs">{error}</p>
            <button
              onClick={(ev) => { ev.preventDefault(); setError(null) }}
              className="btn-secondary text-xs"
            >Try Again</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.label>
  )
}
