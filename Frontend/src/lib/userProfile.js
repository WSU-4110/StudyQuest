import { supabase } from './supabaseClient.js'

function suggestedUsername(session) {
  const displayName = session.user.user_metadata?.display_name
  if (typeof displayName === 'string' && displayName.trim()) {
    return displayName.trim().slice(0, 18)
  }

  const email = session.user.email
  if (typeof email === 'string' && email.includes('@')) {
    return email.split('@')[0].slice(0, 18)
  }

  return 'user'
}

/**
 * Ensures a public.users row exists for the auth session and returns studysets_id.
 */
export async function ensureUserProfile(session) {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  if (!session?.user?.id) {
    throw new Error('You must be signed in to sync study sets.')
  }

  const { data: studysetsId, error: rpcError } = await supabase.rpc(
    'ensure_app_user',
    { p_username: suggestedUsername(session) },
  )

  if (rpcError) {
    throw new Error(rpcError.message)
  }

  if (typeof studysetsId === 'number') {
    return studysetsId
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('studysets_id')
    .eq('auth_user_id', session.user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(profileError.message)
  }

  if (!profile?.studysets_id) {
    throw new Error('Could not load your study set profile.')
  }

  return profile.studysets_id
}

export async function loadStudySets(studysetsId) {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const { data, error } = await supabase
    .from('studysets')
    .select('sets')
    .eq('studysets_id', studysetsId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return Array.isArray(data?.sets) ? data.sets : []
}

export async function saveStudySets(studysetsId, sets) {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const { error } = await supabase
    .from('studysets')
    .update({ sets })
    .eq('studysets_id', studysetsId)

  if (error) {
    throw new Error(error.message)
  }
}
