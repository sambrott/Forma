import { createServerSupabaseClient } from './supabase/server'

const AI_FREE_LIMIT = 3

export async function checkAILimit(
  userId: string,
  toolSlug: string
): Promise<{ allowed: boolean; used: number; limit: number }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { allowed: true, used: 0, limit: AI_FREE_LIMIT }
  }

  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()

  if (profile?.plan === 'pro') {
    return { allowed: true, used: 0, limit: Infinity }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('used_at', today.toISOString())

  const used = count ?? 0
  if (used >= AI_FREE_LIMIT) {
    return { allowed: false, used, limit: AI_FREE_LIMIT }
  }

  await supabase.from('ai_usage').insert({ user_id: userId, tool_slug: toolSlug })
  return { allowed: true, used: used + 1, limit: AI_FREE_LIMIT }
}
