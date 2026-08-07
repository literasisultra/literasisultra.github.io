export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function readingTime(content) {
  if (!content) return '1 menit'
  const words = content.trim().split(/\s+/).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} menit baca`
}

export function formatViews(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + ' jt'
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + ' rb'
  return String(n)
}

export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
