// Utility function to convert relative image URLs to absolute URLs
export function getAbsoluteImageUrl(url) {
  if (!url) return url

  // If already absolute URL (starts with http), return as is
  if (url.startsWith('http')) return url

  // If it's a data URL (base64 encoded image), return as is
  if (url.startsWith('data:')) return url

  // If it starts with /auction/, convert to absolute URL
  if (url.startsWith('/auction/')) {
    return window.location.origin + url
  }

  // Otherwise return as is
  return url
}

// Helper function for time remaining calculation
export function timeLeft(endTime) {
  const diff = new Date(endTime) - new Date()
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return h > 24 ? `${Math.floor(h / 24)} 天` : `${h}h ${m}m`
}