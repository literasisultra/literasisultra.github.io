export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ marginBottom: 16 }}>
              <span className="logo-mark">L</span>
              Literasi<span style={{ color: 'var(--red)' }}>Sultra</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
              Platform berita digital profesional yang menyajikan informasi, berita, dan artikel
              edukatif untuk masyarakat Sulawesi Tenggara. Cepat, akurat, dan terpercaya.
            </p>
          </div>
          <div>
            <h4>Navigasi</h4>
            <ul>
              <li><a href="/">Beranda</a></li>
              <li><a href="/kategori/politik/">Politik</a></li>
              <li><a href="/kategori/sultra/">Sultra</a></li>
              <li><a href="/kategori/edukasi/">Edukasi</a></li>
            </ul>
          </div>
          <div>
            <h4>Kontak</h4>
            <ul>
              <li>Kendari, Sulawesi Tenggara</li>
              <li>redaksi@literasisultra.id</li>
              <li>+62 8XX XXXX XXXX</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Literasisultra. Seluruh hak cipta dilindungi.</span>
          <span>Platform Berita Digital Profesional</span>
        </div>
      </div>
    </footer>
  )
}
