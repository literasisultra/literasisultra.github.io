import { getSupabaseStatic } from '../../../../lib/supabase/static'
import EditArticleClient from './EditArticleClient'

export async function generateStaticParams() {
  const supabase = getSupabaseStatic()
  const { data } = await supabase
    .from('articles')
    .select('id')
    .limit(200)
  const ids = (data || []).map((a) => ({ id: a.id }))
  return ids.length ? ids : [{ id: 'placeholder' }]
}

export default function AdminArtikelEdit({ params }) {
  return <EditArticleClient id={params.id} />
}
