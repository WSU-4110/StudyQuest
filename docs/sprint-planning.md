# Sprint Planning Summary

## Sprint 1

**Planning meeting:** September 28, 2026, with task assignments finalized on October 1, 2026

### Sprint goal

Set up the project's foundation: the repository, frontend and backend structure, user accounts, and study sets.

### What we planned

- Set up the GitHub repository and project structure.
- Plan the frontend and backend structure.
- Create the initial UI wireframe.
- Plan user authentication and data storage.
- Decide how study sets, game logic, and user results will work.
- Assign tasks among team members based on availability.

### Assignments

| Team member | Task |
| --- | --- |
| Mason | Create the database tables for profiles, study sets, and questions |
| Justin | Set up the Supabase client in the React project and connect the frontend to the database once the pages are ready |
| Zlata | Build the website UI, including the dashboard/home page and overall layout |
| Jordan | Create the study set page where users can add and view questions and answers |
| Salvador | Build the sign up/log in page |
| Alan | Testing and documentation |

### Requirements in this sprint

FR-1, FR-6, FR-12, FR-14, FR-16, FR-17, FR-18, NFR-4, NFR-6. All were completed. See the [product backlog](product-backlog.md).

## Sprint 2

**Planning meeting:** October 22, 2026

**Attendees:** Jordan Luong, Justin Tran, Mason Alhakim, Alan Nguyen, Zlata Martova, Salvador Sanchez

### Sprint goal

Make studying active and rewarding: practice quizzes with scoring and history, gamified study modes, XP and virtual currency, AI-generated questions from uploaded material, and a consistent, responsive design.

### What we decided

- Assigned Sprint 2 development tasks among all six team members.
- Assigned the functional user stories for Assignment 3, Parts 2 and 3. Each story went to the team member who originally worked on its functional requirement.
- Justin publishes `awardRewards` early, so the practice quiz and the games call it instead of updating balances on their own.
- Gemini is called from a Supabase Edge Function, so the API key stays out of the React app.
- Progress is tracked through GitHub issues and pull requests.

### Assignments

| Team member | Focus | Requirements |
| --- | --- | --- |
| Salvador | Document upload and AI question generation | FR-2, FR-15 |
| Alan | Practice quiz and scoring | FR-7, FR-13 |
| Mason | Quiz results and progress tracking | FR-4, FR-5 |
| Justin | XP, rewards, and virtual currency | FR-10, FR-11 |
| Jordan | Gamified study modes | FR-3 |
| Zlata | Study set search, CSS, and integration | FR-19, NFR-2, NFR-3, NFR-5 |

The full task list and expected deliverable for each person are in [Sprint 2 tasks](sprint-2-tasks.md).
