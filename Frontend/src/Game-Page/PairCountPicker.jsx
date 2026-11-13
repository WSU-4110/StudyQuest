import { useState } from 'react'

// Start-screen control for how many pairs Match Up deals: a number box with
// - / + buttons and an "All" shortcut. Typing is allowed; the value is kept
// within min..max when the box loses focus.
function PairCountPicker({ value, min, max, onChange }) {
  const [draft, setDraft] = useState(null)

  function commit(next) {
    const clamped = Math.min(max, Math.max(min, Math.round(next)))
    setDraft(null)
    onChange(Number.isFinite(clamped) ? clamped : value)
  }

  // An empty box keeps the current value.
  function commitDraft() {
    commit(draft === null || draft === '' ? value : Number(draft))
  }

  function handleInput(event) {
    const text = event.target.value
    setDraft(text)
    const number = Number(text)
    // Update right away while the typed number is already valid.
    if (text !== '' && Number.isInteger(number) && number >= min && number <= max) {
      onChange(number)
    }
  }

  return (
    <div className="pair-picker">
      <label className="pair-picker-label" htmlFor="pair-count">
        How many pairs do you want to match?
      </label>
      <div className="pair-stepper">
        <button
          type="button"
          className="pair-step"
          onClick={() => commit(value - 1)}
          disabled={value <= min}
          aria-label="Fewer pairs"
        >
          −
        </button>
        <input
          id="pair-count"
          className="pair-input"
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={draft ?? value}
          onChange={handleInput}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commitDraft()
          }}
        />
        <button
          type="button"
          className="pair-step"
          onClick={() => commit(value + 1)}
          disabled={value >= max}
          aria-label="More pairs"
        >
          +
        </button>
        <button
          type="button"
          className="pair-all"
          onClick={() => commit(max)}
          disabled={value === max}
        >
          All ({max})
        </button>
      </div>
      <p className="pair-picker-note">
        This set can make {max} pairs. Pick between {min} and {max}.
      </p>
    </div>
  )
}

export default PairCountPicker
