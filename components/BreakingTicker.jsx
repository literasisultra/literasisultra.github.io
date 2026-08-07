'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '../lib/supabase/client'

export default function BreakingTicker() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const supabase = getSupabase()
    let active = true

    async function load() {
      const { data, error } = await supabase
        .from('articles')
        .select('title, slug')
        .eq('is_published', true)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(8)
      if (!error && active && data) setItems(data)
    }

    load()
    const channel = supabase
      .channel('ticker-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'articles', filter: 'is_published=eq.true' },
        () => load()
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  if (!items.length) return null

  const doubled = [...items, ...items]

  return (
    <div className="ticker">
      <div className="ticker-label">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        BREAKING NEWS
      </div>
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <a key={item.slug + i} href={`/artikel/${item.slug}/`}>
            <span>{item.title}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
