# Sprint 2 Tasks

## Salvador — Document Upload & AI Question Generation

### Functional Requirements
- **FR-2:** Upload documents/images to generate questions.
- **FR-15:** Send uploaded material to Gemini API to generate practice questions.

### Tasks
- Implement document uploading for PDF, Word, and image files.
- Read text from PDF and Word files. Send images, and scanned PDFs, to Gemini as pictures.
- Call Gemini from a Supabase Edge Function so the API key stays off the React app.
- Generate study questions in the existing card shape: short answer, multiple choice, and true/false.
- Display generated questions for user review.
- Allow users to edit or remove generated questions before saving.
- Save the reviewed questions into a study set with `addStudySet`.

**Expected Deliverable:** Users can upload a PDF, Word file, or image, generate questions with Gemini, review them, and save them to a study set.

## Alan — Practice Quiz & Scoring

### Functional Requirements
- **FR-7:** Take practice quizzes from study sets.
- **FR-13:** Calculate quiz scores after submission.

### Tasks
- Create the practice quiz page.
- Generate practice quizzes using questions from existing study sets.
- Support short-answer, multiple-choice, and true/false questions.
- Score multiple choice and true/false from the stored correct answer.
- Score short answers automatically by an exact match after trimming spaces and ignoring cases.
- Display the final quiz score.
- On submit, save the attempt fields for the results page and call `awardRewards` for the rewards system.

**Expected Deliverable:** Users can take a practice quiz based on their study sets and receive a calculated score after submission.

## Mason — Quiz Results & Progress Tracking

### Functional Requirements
- **FR-4:** Record results and display users' previous quiz results.
- **FR-5:** Show how users can improve from previous results.

### Tasks
- Store completed quiz attempts and scores in a `quiz_attempts` table in Supabase.
- Create a quiz history/results page.
- Allow users to view previous quiz scores, including the study set, score, total, and date.
- Compare the current score with the previous attempt on the same study set.
- Display progress and improvement over time.
- Integrate results with the practice quiz system so a submitted quiz shows up in the history.

**Expected Deliverable:** Users can view their quiz history, review previous scores, and track improvement over time.

## Justin — XP, Rewards & Virtual Currency

### Functional Requirements
- **FR-10:** Earn XP and rewards after completing study activities.
- **FR-11:** Track users' XP.

### Tasks
- Add an `xp` column beside the existing currency and level columns.
- Implement `awardRewards(activity)` so a finished quiz or game grants XP and virtual currency in one place.
- Award XP for completing practice quizzes and for completing a gamified study activity.
- Track and store each user's XP in Supabase.
- Implement level progression.
- Award virtual currency for those same activities and update each user's currency balance.
- Display the user's XP, level, and virtual currency.
- Publish `awardRewards` early so the quiz and the game call it instead of updating balances on their own.

**Expected Deliverable:** Users earn XP and virtual currency by completing study activities. Their XP, level, and currency balance are saved and displayed correctly.

**Future Sprint:** Implement purchasing cosmetics, equipping avatar items, and spending virtual currency.

## Jordan — Gamified Study Modes

### Functional Requirement
- **FR-3:** Gamify study sets.

### Tasks
- Develop a gamified study activity using existing study-set questions.
- Implement a matching game or a speed-round activity, including rules, scoring, and completion.
- Display the result when the game is completed.
- Call `awardRewards` when the game is completed so the user earns XP and currency.
- Test the game with different study sets.

**Expected Deliverable:** Users can select a study set and complete at least one interactive gamified study activity.

**Stretch Goal:** Implement the other gamified mode if time permits.

## Zlata — Study Set Search, CSS Customization & Integration

### Functional Requirement
- **FR-19 (Newly added):** Search users' study sets.

### Non-Functional Requirements
- **NR2:** Responsive design for desktop and mobile devices.
- **NR3:** Simplistic UI for users to navigate.
- **NR5:** Consistent navigation and design throughout all pages.

### Tasks
- Add a search bar to the study-set library.
- Allow users to search and filter study sets by title.
- Improve the overall CSS styling of StudyQuest.
- Standardize buttons, typography, colors, and spacing, including the new quiz, results, and game pages.
- Ensure consistency between pages.
- Improve responsiveness across desktop and mobile devices.
- Test navigation between the library, quiz, results, rewards, and game.
- Assist with frontend integration and UI issues.

**Expected Deliverable:** Users can search their study sets, and the application has improved styling, responsive layouts, and consistent navigation.
