import { supabase } from '../lib/supabaseClient.js'

class StudyQuestFacade {
  constructor(client) {
    this._db = client
  }

  _client() {
    if (!this._db) throw new Error('Supabase is not configured.')
    return this._db
  }

  async createProfile(username) {
    const { data, error } = await this._client().rpc('ensure_app_user', {
      p_username: username,
    })
    if (error) throw error
    return data 
  }

  async submitQuiz(correct, total) {
    const { error } = await this._client().rpc('record_quiz_result', {
      p_correct: correct,
      p_total: total,
    })
    if (error) throw error
  }

  async quizResults() {
    const { data, error } = await this._client()
      .from('user_overview')
      .select('currquiz, prevquiz, currtot, prevtot, currdate, prevdate')
      .maybeSingle()
    if (error) throw error
    return data
  }

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