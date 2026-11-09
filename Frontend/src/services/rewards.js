import { supabase } from '../lib/supabaseClient.js'

// Default rewards. Confirm amounts with the team.
export const REWARD_AMOUNTS = {
  quiz: { xp: 20, currency: 10 },
  game: { xp: 30, currency: 15 },
}

/**
 * Award XP and currency for a completed activity.
 *
 * completionId must identify the actual completed activity.
 * Reuse the same ID when retrying a failed request.
 */
export async function awardRewards(activity, earned = {}, completionId) {
  const defaults = REWARD_AMOUNTS[activity]

  if (!defaults) {
    throw new Error(`Unknown activity: ${activity}`)
  }

  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  if (!completionId) {
    throw new Error('A completion ID is required')
  }

  const reward = {
    xp: earned.xp ?? defaults.xp,
    currency: earned.currency ?? defaults.currency,
  }

  if (
    !Number.isInteger(reward.xp) ||
    !Number.isInteger(reward.currency) ||
    reward.xp < 0 ||
    reward.currency < 0 ||
    reward.xp > 500 ||
    reward.currency > 100
  ) {
    throw new Error('Invalid reward amounts')
  }

  const { data, error } = await supabase.rpc(
    'award_activity_rewards',
    {
      p_completion_id: completionId,
      p_activity_type: activity,
      p_xp: reward.xp,
      p_currency: reward.currency,
    }
  )

  if (error) {
    throw new Error(error.message)
  }

  const totals = Array.isArray(data) ? data[0] : data

  if (!totals) {
    throw new Error('Could not award rewards')
  }

  return totals
}

/**
 * Load the signed-in user's current XP, level, and currency.
 */
export async function getPlayerRewards() {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const { data: authData, error: authError } =
    await supabase.auth.getUser()

  if (authError) {
    throw new Error(authError.message)
  }

  if (!authData.user) {
    return null
  }

  const { data, error } = await supabase
    .from('users')
    .select('currencycosmetics(xp, level, currency)')
    .eq('auth_user_id', authData.user.id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (!data?.currencycosmetics) {
    throw new Error('Player rewards profile not found')
  }

  return data.currencycosmetics
}