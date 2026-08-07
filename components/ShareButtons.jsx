'use client'

export default function ShareButtons({ title, url }) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  function copyLink() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
    }
    alert('Link berhasil disalin!')
  }

  return (
    <div className="share-box">
      <span>Bagikan:</span>
      <a
        className="share-btn share-wa"
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
      </a>
      <a
        className="share-btn share-fb"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Facebook
      </a>
      <a
        className="share-btn share-tw"
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Twitter / X
      </a>
      <button className="share-btn share-copy" onClick={copyLink}>Salin Link</button>
    </div>
  )
}
