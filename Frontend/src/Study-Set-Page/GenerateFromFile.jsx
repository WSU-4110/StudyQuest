import { useRef, useState } from 'react'
import { ACCEPT } from '../lib/extractFile.js'
import { generateCardsFromFile } from '../lib/generateQuestions.js'

// Upload panel for the Create page. It only produces cards; the Create page's own
// editor handles review/edit/remove and saving with addStudySet.
function GenerateFromFile({ disabled, onGenerated }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [count, setCount] = useState(10)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  async function handleGenerate() {
    if (!file) return
    setBusy(true)
    setMessage('Reading your file and generating questions…')
    setIsError(false)

    try {
      const result = await generateCardsFromFile(file, count)
      onGenerated(result)
      setMessage(
        `Added ${result.cards.length} questions below. Review, edit or remove them, then click Create.`,
      )
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      setIsError(true)
      setMessage(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="generate-panel" aria-labelledby="generate-heading">
      <h2 id="generate-heading">Generate questions from a file</h2>
      <p className="generate-hint">
        Upload a PDF, Word (.docx) file, or photo of your notes (max 10 MB).
      </p>

      {disabled ? (
        <p className="form-message">Log in to generate questions from a file.</p>
      ) : (
        <div className="generate-controls">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            aria-label="Study material file"
            disabled={busy}
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              setMessage('')
            }}
          />
          <label className="generate-count">
            Questions
            <select
              value={count}
              disabled={busy}
              onChange={(e) => setCount(Number(e.target.value))}
            >
              {[5, 10, 15, 20, 25].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={handleGenerate} disabled={!file || busy}>
            {busy ? 'Generating…' : 'Generate'}
          </button>
        </div>
      )}

      {message ? (
        <p
          className={isError ? 'form-error' : 'form-message'}
          role={isError ? 'alert' : 'status'}
        >
          {message}
        </p>
      ) : null}
    </section>
  )
}

export default GenerateFromFile
