export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80'

export function normalizeImageUrl(url) {
  const value = typeof url === 'string' ? url.trim() : ''
  return value || FALLBACK_IMAGE
}

export function handleImageError(event) {
  const target = event?.target
  if (!target || target.dataset.fallbackApplied === 'true') return

  target.dataset.fallbackApplied = 'true'
  target.onerror = null
  target.src = FALLBACK_IMAGE
}
