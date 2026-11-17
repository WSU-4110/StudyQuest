# StudyQuest

StudyQuest turns studying into a game. Students build study sets, test themselves with practice quizzes and game modes, and earn XP, levels, and coins as they go.

**Live site:** <https://study-quest-phi.vercel.app/>

## Purpose

Studying the same notes over and over is boring, and bored students forget what they studied. StudyQuest keeps them engaged by turning their own study material into quizzes and games, rewarding them for finishing, and showing how their scores improve over time so they know what to review next.

## Functionality

### Available now

- **Accounts:** sign up, log in, and stay signed in. Each user's data is private to their account (Supabase Auth with row-level security).
- **Study sets:** create, edit, and review sets with short-answer, multiple-choice, and true/false questions. Sets are saved to your account.
- **Practice quizzes:** take a quiz from any study set and get a score when you submit.
- **Quiz Results:** see your past practice quiz and game attempts with the study set, mode, score, number correct, and date.
- **Study tips:** for any saved attempt, generate tips with Google Gemini based on the questions you missed.
- **Game modes** using your study set's questions:
  - **Speed Round:** race through a pixel-art woodland against the clock. Right answers add time, wrong answers trip you up, and power-ups freeze the clock, double your distance, or skip a card.
  - **Survival:** descend a dungeon one right answer at a time. Wrong answers cost hearts, upgrades help you go deeper, and missed cards come back as ghosts.
  - **Boss Battle:** a turn-based fight with the Slime King, where every move needs a right answer to land.
  - **Match Up:** match each question to its answer, and sort true/false statements onto True or False.
- **XP, levels, and coins:** finishing a quiz or game earns XP and coins. Your level, XP bar, and coin count are shown in the navigation bar.
- **Responsive layout** for desktop and mobile.

### In progress
- none

### Planned

- Customize your avatar and spend coins on cosmetics (FR-8)
- Change your username (FR-9)

See the [product backlog](docs/product-backlog.md) for every requirement and its status.

## Built with

- **Frontend:** React 19, Vite 8, React Router 7, Tailwind CSS 4
- **Backend:** Supabase (Postgres, authentication, Edge Functions)
- **AI:** Google Gemini
- **Hosting:** Vercel

## Getting started

See [docs/installation.md](docs/installation.md) for system requirements and the install, build, and deploy steps. The short version, once `Frontend/.env` has your Supabase keys:

```bash
cd Frontend
npm install
npm run dev
```

## Contributors

| Name | GitHub | Main areas |
| --- | --- | --- |
| Jordan Luong | [@luoj244](https://github.com/luoj244) | Study set page, question types, navigation bar, game modes |
| Salvador Sanchez | [@salvadorsanch17](https://github.com/salvadorsanch17) | Sign up and log in, document upload and Gemini question generation |
| Mason Alhakim | [@Masoooni](https://github.com/Masoooni) | Database schema, account storage, quiz results and progress tracking |
| Justin Tran | [@jtran0221](https://github.com/jtran0221) | Supabase client and security, XP, levels, and currency |
| Alan Nguyen | [@AlanNguyen05](https://github.com/AlanNguyen05) | Practice quizzes and scoring, testing and bug reports |
| Zlata Martova | [@ZlataMartova](https://github.com/ZlataMartova) | Home page, site layout and styling, study set search |

## Project documents

All project documents are in [docs/](docs/README.md):

- [Installation](docs/installation.md)
- [Product backlog](docs/product-backlog.md)
- [Sprint planning](docs/sprint-planning.md)
- [Scrum meetings](docs/scrum-meetings.md)
- [Sprint 1 testing report](docs/testing-sprint-1.md) and [retrospective](docs/retrospective-sprint-1.md)
- [Sprint 2 tasks](docs/sprint-2-tasks.md)
