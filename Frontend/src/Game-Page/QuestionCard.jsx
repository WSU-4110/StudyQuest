import { useState } from 'react'
import { formatCorrectAnswer } from './gameEngine.js'

function optionClass(index, { picked, correctIndexes, feedback, selected }) {
  const classes = ['answer-option']
  if (!feedback) {
    if (selected?.includes(index)) classes.push('selected')
    return classes.join(' ')
  }
  if (correctIndexes.includes(index)) classes.push('correct')
  else if (picked.includes(index)) classes.push('wrong')
  return classes.join(' ')
}

function MultipleChoice({ question, feedback, onSubmit }) {
  const [selected, setSelected] = useState([])
  const multiSelect = question.correctIndexes.length > 1

  function handleClick(index) {
    if (!multiSelect) {
      onSubmit([index])
      return
    }
    setSelected((prev) =>
      prev.includes(index)
        ? prev.filter((value) => value !== index)
        : [...prev, index],
    )
  }

  return (
    <>
      {multiSelect ? (
        <p className="answer-hint">Select all that apply</p>
      ) : null}
      <div className="answer-options">
        {question.options.map((option, index) => (
          <button
            key={`${option}-${index}`}
            type="button"
            className={optionClass(index, {
              picked: feedback?.response ?? [],
              correctIndexes: question.correctIndexes,
              feedback,
              selected,
            })}
            disabled={Boolean(feedback)}
            onClick={() => handleClick(index)}
          >
            {option}
          </button>
        ))}
      </div>
      {multiSelect ? (
        <button
          type="button"
          className="answer-submit"
          disabled={Boolean(feedback) || selected.length === 0}
          onClick={() => onSubmit(selected)}
        >
          Submit
        </button>
      ) : null}
    </>
  )
}

function TrueFalse({ question, feedback, onSubmit }) {
  const choices = [
    { label: 'True', value: true },
    { label: 'False', value: false },
  ]

  return (
    <div className="answer-options two-up">
      {choices.map((choice) => {
        const classes = ['answer-option']
        if (feedback) {
          if (choice.value === question.answer) classes.push('correct')
          else if (choice.value === feedback.response) classes.push('wrong')
        }
        return (
          <button
            key={choice.label}
            type="button"
            className={classes.join(' ')}
            disabled={Boolean(feedback)}
            onClick={() => onSubmit(choice.value)}
          >
            {choice.label}
          </button>
        )
      })}
    </div>
  )
}

function ShortAnswer({ feedback, onSubmit }) {
  const [value, setValue] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (value.trim()) onSubmit(value)
  }

  const inputClass = feedback
    ? `answer-input ${feedback.correct ? 'correct' : 'wrong'}`
    : 'answer-input'

  return (
    <form className="short-answer-form" onSubmit={handleSubmit}>
      <input
        className={inputClass}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        readOnly={Boolean(feedback)}
        placeholder="Type your answer"
        aria-label="Your answer"
        autoFocus
      />
      <button
        type="submit"
        className="answer-submit"
        disabled={Boolean(feedback) || !value.trim()}
      >
        Submit
      </button>
    </form>
  )
}

function QuestionCard({ question, feedback, onSubmit }) {
  let cardClass = 'question-card'
  if (feedback) cardClass += feedback.correct ? ' is-correct' : ' is-wrong'

  return (
    <div className={cardClass}>
      <h2 className="question-prompt">{question.prompt}</h2>

      {question.type === 'multiple_choice' ? (
        <MultipleChoice
          question={question}
          feedback={feedback}
          onSubmit={onSubmit}
        />
      ) : null}
      {question.type === 'true_false' ? (
        <TrueFalse
          question={question}
          feedback={feedback}
          onSubmit={onSubmit}
        />
      ) : null}
      {question.type === 'short_answer' ? (
        <ShortAnswer feedback={feedback} onSubmit={onSubmit} />
      ) : null}

      {feedback && !feedback.correct && question.type === 'short_answer' ? (
        <p className="feedback-answer">
          Answer: <strong>{formatCorrectAnswer(question)}</strong>
        </p>
      ) : null}
    </div>
  )
}

export default QuestionCard
