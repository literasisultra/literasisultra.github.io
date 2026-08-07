'use client'

import { useEffect, useState } from 'react'

const KENDARI = { lat: -3.9985, lon: 122.5129 }

function fetchJson(url, ms = 8000) {
  return new Promise((resolve, reject) => {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), ms)
    fetch(url, { signal: ctrl.signal })
      .then(async (r) => (r.ok ? resolve(await r.json()) : reject(new Error('HTTP ' + r.status))))
      .catch(reject)
      .finally(() => clearTimeout(t))
  })
}

export default function SidebarWidgets() {
  const [weather, setWeather] = useState(null)
  const [weatherErr, setWeatherErr] = useState(false)
  const [stock, setStock] = useState(null)
  const [stockErr, setStockErr] = useState(false)

  useEffect(() => {
    fetchJson(`https://api.open-meteo.com/v1/forecast?latitude=${KENDARI.lat}&longitude=${KENDARI.lon}&current_weather=true&timezone=Asia/Makassar`)
      .then((d) => setWeather(d.current_weather))
      .catch(() => setWeatherErr(true))

    fetchJson('https://query1.finance.yahoo.com/v8/finance/chart/%5EJKSE?interval=1d&range=5d')
      .then((d) => {
        const r = d.chart?.result?.[0]
        if (!r) throw new Error('no data')
        const meta = r.meta
        const closes = r.indicators?.quote?.[0]?.close || []
        const last = closes.filter((v) => v != null).pop()
        const prev = closes.filter((v) => v != null).slice(-2, -1)[0]
        const change = prev ? ((last - prev) / prev) * 100 : 0
        setStock({ price: meta.regularMarketPrice ?? last, change, name: meta.longName || 'IHSG' })
      })
      .catch(() => setStockErr(true))
  }, [])

  return (
    <>
      <div className="sidebar-card">
        <h3 className="sidebar-title">Cuaca Kendari</h3>
        {weatherErr ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>Cuaca tidak tersedia.</p>
        ) : weather ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '2.4rem', lineHeight: 1 }}>{weatherCodeIcon(weather.weathercode)}</span>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.1 }}>
                {Math.round(weather.temperature)}°C
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                {weatherCodeLabel(weather.weathercode)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                Angin {Math.round(weather.windspeed)} km/jam
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>Memuat cuaca...</div>
        )}
      </div>

      <div className="sidebar-card">
        <h3 className="sidebar-title">IHSG</h3>
        {stockErr ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>Data saham tidak tersedia.</p>
        ) : stock ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{fmtNumber(stock.price)}</span>
              <span
                className="tag"
                style={{
                  background: stock.change >= 0 ? '#D1FAE5' : '#FEE2E2',
                  color: stock.change >= 0 ? '#065F46' : '#991B1B'
                }}
              >
                {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)}%
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 4 }}>
              {stock.name} (^JKSE)
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>Memuat IHSG...</div>
        )}
      </div>
    </>
  )
}

function fmtNumber(n) {
  if (n == null || isNaN(n)) return '-'
  return n.toLocaleString('id-ID', { maximumFractionDigits: 2, minimumFractionDigits: 0 })
}

function weatherCodeIcon(code) {
  if (code === 0) return '☀️'
  if (code === 1 || code === 2) return '🌤️'
  if (code === 3) return '☁️'
  if (code >= 45 && code <= 48) return '🌫️'
  if (code >= 51 && code <= 67) return '🌧️'
  if (code >= 71 && code <= 77) return '🌨️'
  if (code >= 80 && code <= 82) return '🌦️'
  if (code >= 95) return '⛈️'
  return '🌡️'
}

function weatherCodeLabel(code) {
  if (code === 0) return 'Cerah'
  if (code === 1) return 'Cerah berawan'
  if (code === 2) return 'Berawan sebagian'
  if (code === 3) return 'Mendung'
  if (code >= 45 && code <= 48) return 'Kabut'
  if (code >= 51 && code <= 57) return 'Gerimis'
  if (code >= 61 && code <= 67) return 'Hujan'
  if (code >= 71 && code <= 77) return 'Salju'
  if (code >= 80 && code <= 82) return 'Hujan ringan'
  if (code >= 95) return 'Badai petir'
  return 'Beragam'
}
