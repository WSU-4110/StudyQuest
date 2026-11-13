const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405, headers })
  }

  try {
    const { missed } = await request.json()

    if (
      !Array.isArray(missed) ||
      missed.length === 0 ||
      missed.length > 10 ||
      missed.some(
        (item) =>
          typeof item?.question !== 'string' ||
          typeof item?.correctAnswer !== 'string' ||
          typeof item?.yourAnswer !== 'string' ||
          item.question.length > 500 ||
          item.correctAnswer.length > 300 ||
          item.yourAnswer.length > 300,
      )
    ) {
      return Response.json(
        { error: 'Send 1–10 missed questions with answers.' },
        { status: 400, headers },
      )
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return Response.json(
        { error: 'Add GEMINI_API_KEY to Supabase Function secrets.' },
        { status: 500, headers },
      )
    }

    const model = 'gemini-3.5-flash-lite'
    const prompt = `Review these missed questions, comparing each question, learner answer, and correct answer. Identify recurring misunderstandings and summarize them as 2 or 3 concise, actionable study tips. Do not write one tip per question. Return only JSON in this format: {"tips":["tip one","tip two"]}.\n${JSON.stringify(missed)}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30_000)
    let gemini: Response
    try {
      gemini = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              maxOutputTokens: 160,
              temperature: 0.2,
            },
          }),
          signal: controller.signal,
        },
      )
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return Response.json(
          { error: 'Gemini request timed out. Please try again.' },
          { status: 504, headers },
        )
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }

    if (!gemini.ok) {
      const responseBody = await gemini.json().catch(() => null)
      const providerMessage = responseBody?.error?.message
      console.error('Gemini request failed:', gemini.status, providerMessage)
      return Response.json(
        {
          error: 'Gemini request failed.',
          details:
            typeof providerMessage === 'string'
              ? providerMessage.slice(0, 400)
              : `Gemini returned HTTP ${gemini.status}.`,
        },
        { status: 502, headers },
      )
    }

    const generated = await gemini.json()
    const text = generated.candidates?.[0]?.content?.parts?.[0]?.text
    const { tips } = JSON.parse(text ?? '{}')

    if (
      !Array.isArray(tips) ||
      tips.length < 2 ||
      tips.length > 3 ||
      tips.some((tip) => typeof tip !== 'string')
    ) {
      throw new Error('Gemini returned an invalid tips response.')
    }

    return Response.json({ tips }, { headers })
  } catch (error) {
    console.error('Study tips failed:', error)
    return Response.json(
      { error: 'Could not generate study tips.' },
      { status: 500, headers },
    )
  }
})
