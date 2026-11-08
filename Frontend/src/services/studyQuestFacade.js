// Facade pattern: the one place that knows how StudyQuest talks to the database.
import { supabase } from '../lib/supabaseClient.js'

class StudyQuestFacade {
  constructor(client) {
    this._db = client
  }

  _client() {
    if (!this._db) throw new Error('Supabase is not configured.')
    return this._db
  }

  // wraps ensure_app_user: builds all five rows, or returns the existing ones
  async createProfile(username) {
    const { data, error } = await this._client().rpc('ensure_app_user', {
      p_username: username,
    })
    if (error) throw error
    return data // studysets_id
  }

  // wraps record_quiz_result: moves curr to prev, saves the new score
  async submitQuiz(correct, total) {
    const { error } = await this._client().rpc('record_quiz_result', {
      p_correct: correct,
      p_total: total,
    })
    if (error) throw error
  }

  // just the quiz columns, for the results page
  async quizResults() {
    const { data, error } = await this._client()
      .from('user_overview')
      .select('currquiz, prevquiz, currtot, prevtot, currdate, prevdate')
      .maybeSingle()
    if (error) throw error
    return data // null if the user has no profile row
  }

  // everything about the signed-in user
  async dashboard() {
    const { data, error } = await this._client()
      .from('user_overview')
      .select('*')
      .maybeSingle()
    if (error) throw error
    return data
  }
}

export const studyQuest = new StudyQuestFacade(supabase)