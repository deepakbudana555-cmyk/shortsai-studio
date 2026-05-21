/**
 * projectStore.ts
 * Central localStorage-backed store for all user projects and edits.
 * Works completely offline — no Supabase required.
 */

export interface SceneImageData {
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

export interface ShortClip {
  id: string | number
  title: string
  duration: number
  viral_score: number
  thumbnail_url: string | null
  platform?: string
  sceneImage?: SceneImageData   // custom image attached to this clip
  captionStyle?: string
  status?: string
}

export interface Project {
  id: string
  title: string
  status: 'uploading' | 'processing' | 'ready' | 'failed'
  duration: number
  viral_score: number
  shorts_count: number
  shorts: ShortClip[]
  created_at: string
  updated_at: string
  original_filename?: string
  file_size?: number
  thumbnail_url?: string | null
}

const KEY = 'mock_projects'

// ── Read ─────────────────────────────────────────────────────────────────────
export function getProjects(): Project[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as Project[]
  } catch {
    return []
  }
}

export function getProject(id: string): Project | undefined {
  return getProjects().find(p => p.id === id)
}

// ── Write ─────────────────────────────────────────────────────────────────────
export function saveProjects(projects: Project[]) {
  localStorage.setItem(KEY, JSON.stringify(projects))
  window.dispatchEvent(new Event('projects_updated'))
}

export function upsertProject(project: Project) {
  const all = getProjects()
  const idx = all.findIndex(p => p.id === project.id)
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...project, updated_at: new Date().toISOString() }
  } else {
    all.unshift(project)
  }
  saveProjects(all)
}

export function deleteProject(id: string) {
  saveProjects(getProjects().filter(p => p.id !== id))
}

// ── Scene images ─────────────────────────────────────────────────────────────
/**
 * Persist scene image metadata for a project's clip.
 * Note: imageUrl is a blob:// URL which is session-only.
 * We store fileName so users know what was applied even after reload.
 */
export function saveSceneImages(
  projectId: string,
  sceneImages: Record<string | number, SceneImageData>
) {
  const all = getProjects()
  const idx = all.findIndex(p => p.id === projectId)
  if (idx < 0) return

  // Merge scene images into each short
  all[idx].shorts = all[idx].shorts.map(s => {
    const img = sceneImages[s.id]
    if (img) {
      return { ...s, sceneImage: img }
    }
    return { ...s, sceneImage: undefined }
  })
  all[idx].updated_at = new Date().toISOString()
  saveProjects(all)
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export function getStats() {
  const projects = getProjects()
  const totalShorts = projects.reduce((a, p) => a + (p.shorts?.length || 0), 0)
  const avgViral = projects.length
    ? Math.round(projects.reduce((a, p) => a + (p.viral_score || 0), 0) / projects.length)
    : 0
  const customImages = projects.reduce(
    (a, p) => a + (p.shorts?.filter(s => s.sceneImage?.isCustom).length || 0), 0
  )
  return { total: projects.length, totalShorts, avgViral, customImages }
}

// ── Create demo project (for first-time users) ────────────────────────────────
export function createDemoProjectIfEmpty() {
  const existing = getProjects()
  if (existing.length > 0) return

  const demo: Project = {
    id: 'demo_001',
    title: 'Sample Podcast — Growth Mindset',
    status: 'ready',
    duration: 5070,
    viral_score: 91,
    shorts_count: 4,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    original_filename: 'podcast_ep47.mp4',
    thumbnail_url: null,
    shorts: [
      { id: 'demo_s1', title: 'Hook Moment – Opening Line', duration: 45, viral_score: 94, thumbnail_url: null, platform: 'youtube_shorts' },
      { id: 'demo_s2', title: 'Key Insight – Growth Secret', duration: 52, viral_score: 87, thumbnail_url: null, platform: 'instagram_reels' },
      { id: 'demo_s3', title: 'Emotional Peak – The Struggle', duration: 38, viral_score: 91, thumbnail_url: null, platform: 'tiktok' },
      { id: 'demo_s4', title: 'CTA – Call to Action', duration: 30, viral_score: 83, thumbnail_url: null, platform: 'youtube_shorts' },
    ],
  }
  saveProjects([demo])
}
