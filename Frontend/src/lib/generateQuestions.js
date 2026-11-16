import { supabase } from './supabaseClient.js'
import { extractFromFile } from './extractFile.js'

// Uploads → text/images → Supabase Edge Function (which calls Gemini with the secret key).
// Resolves to { title, cards } where cards already match the app's study set card shape.
export async function generateCardsFromFile(file, count = 10) {
  if (!supabase) {
    throw new Error('Supabase is not configured, so questions cannot be generated.')
  }

  const extracted = await extractFromFile(file)
  const body =
    extracted.kind === 'text'
      ? { text: extracted.text, count }
      : { images: extracted.images, count }

  const { data, error } = await supabase.functions.invoke('generate-questions', {
    body,
  })

  if (error) {
    // FunctionsHttpError carries the function's JSON error body in error.context
    let message = 'Question generation failed. Please try again.'
    try {
      const details = await error.context?.json?.()
      if (details?.error) message = details.error
    } catch {
      /* keep default message */
    }
    throw new Error(message)
  }

  return { title: data.title ?? '', cards: data.cards ?? [] }
}
