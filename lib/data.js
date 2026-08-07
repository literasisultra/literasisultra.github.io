import { createClient } from '@supabase/supabase-js'

export function getSupabaseStatic() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export async function getCategories() {
  const supabase = getSupabaseStatic()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, color_code')
    .order('name')
  if (error) return []
  return data || []
}

export async function getPublishedArticles(limit = 50) {
  const supabase = getSupabaseStatic()
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id, title, slug, excerpt, featured_image_url, views_count,
      published_at,
      categories(name, slug, color_code),
      users(name, avatar_url)
    `)
    .eq('is_published', true)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return data || []
}

export async function getPopularArticles(limit = 6) {
  const supabase = getSupabaseStatic()
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id, title, slug, featured_image_url, views_count,
      categories(name, slug)
    `)
    .eq('is_published', true)
    .lte('published_at', new Date().toISOString())
    .order('views_count', { ascending: false })
    .limit(limit)
  if (error) return []
  return data || []
}

export async function getArticleBySlug(slug) {
  const supabase = getSupabaseStatic()
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id, title, slug, content, excerpt, featured_image_url, views_count,
      published_at, meta_title, meta_description, og_image_url,
      categories(name, slug, color_code),
      users(id, name, avatar_url, role)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .lte('published_at', new Date().toISOString())
    .maybeSingle()
  if (error) return null
  return data || null
}

export async function getComments(articleId) {
  const supabase = getSupabaseStatic()
  const { data, error } = await supabase
    .from('comments')
    .select('id, user_name, comment_text, created_at')
    .eq('article_id', articleId)
    .eq('is_approved', true)
    .order('created_at', { ascending: true })
  if (error) return []
  return data || []
}

export async function getArticlesByCategory(slug, limit = 50) {
  const supabase = getSupabaseStatic()
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id, title, slug, excerpt, featured_image_url, views_count, published_at,
      categories(name, slug, color_code),
      users(name)
    `)
    .eq('categories.slug', slug)
    .eq('is_published', true)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return data || []
}
