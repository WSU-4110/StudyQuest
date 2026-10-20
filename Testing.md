# StudyQuest - Sprint 1 Testing Report

**Tester:** <Alan Nguyen>
**Date tested:** <10/18/26>
**Build tested:** <testing-report / commit hash /[ website URL](https://study-quest-phi.vercel.app/)>

## 1. Summary


| Feature | Owner | Status |
| --- | --- | --- |
| Database tables | Mason | Pass |
| Supabase client connection | Justin | Pass |
| Dashboard / home page | Zlata | Pass |
| Sign up / log in pages | Salvador | Pass |
| Study set page | Jordan | Pass |

Status values: Pass / Pass with issues / Fail / Not tested

## 2. Test cases

### Sign up / log in
| # | Test | Steps | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| A1 | Valid sign up | Enter valid username, email, password; submit | Account created, user lands on dashboard | Confirmation email is sent to me where I confirm my identity and sign up | Pass |
| A2 | Invalid email | Enter "abc" as email; submit | Clear error, no account created | Shows invalid message telling user that '@' needs to be included | Pass |
| A3 | Weak password | Enter a very short password; submit | Clear error | Shows error message saying password needs 8 characters or more | Pass |
| A4 | Duplicate email | Sign up with an email already used | "Email in use" style error | Not tested: blocked by BUG-001 | |
| A5 | Valid log in | Log in with correct credentials | Dashboard loads | Not tested: blocked by BUG-001 | |
| A6 | Wrong password | Log in with a wrong password | Clear error, stays logged out | Not tested: blocked by BUG-001 | |
| A7 | Log out | Click log out | Returns to login, protected pages inaccessible | Not tested: blocked by BUG-001 | |
| A8 | Protected route | While logged out, open the dashboard URL directly | Redirected to login | Not tested: blocked by BUG-001 | |

### Dashboard
| # | Test | Steps | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| B1 | Loads | Log in, open dashboard | Page renders with no console errors | Not tested: blocked by BUG-001 | |
| B2 | Empty state | Log in as a brand-new user | Friendly empty message, no crash | Not tested: blocked by BUG-001 | |
| B3 | Correct user data | Log in as two different users | Each sees only their own data | Not tested: blocked by BUG-001 | |
| B4 | Navigation | Click every link/button | Each goes to the right place | Not tested: blocked by BUG-001 | |

### Study set page
| # | Test | Steps | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| C1 | Questions display | Open a set with several questions | Questions and answers show correctly | When opening a study set, it shows every question and their respective answer | Pass |
| C2 | Navigate cards | Move next / previous | Works, including first and last card | There's no option to move to the next or previous flashcard. It shows all your questions/answers all on one page | Pass with issues |
| C3 | Set with 0 questions | Open an empty set | Handled gracefully | When trying to make a Study Set with no questions, an error message pops up: "Add at least one complete card. Multiple choice needs a question, two filled options, and at least one correct choice." | Fail |
| C4 | Set with 1 question | Open a one-question set | No broken navigation | I am able to create a Study set with just one question | Pass |
| C5 | Long / special text | Question with very long text, emoji, symbols | Displays without breaking layout | Created question the size of a basic paragraph and it displays without breaking layout | Pass |
| C6 | Refresh | Refresh the page mid-session | Data still loads | When I try to refresh in the middle of creating a study set I get an error message saying this page does not exist | Fail |

### Database / Supabase connection
| # | Test | Steps | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| D1 | Data saves | Create data in the UI | Row appears in the Supabase table editor | | |
| D2 | Data loads | Reload after saving | Same data shown | | |
| D3 | Column names | Compare schema to what the frontend reads | No mismatches | | |

### General
| # | Test | Steps | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| E1 | Responsive | Resize to phone width | Layout usable | | |
| E2 | Second browser | Repeat core flow in another browser | Same behavior | | |
| E3 | Console / network | Open dev tools during core flow | No red errors, no failed requests | | |

## 3. Bugs found

### BUG-001: Unable to create an account
- **Severity:** BLOCKER / Major / Minor
- **Feature / owner:** Supabase client connection / Justin
- **Steps to reproduce:**
  1. Open https://study-quest-phi.vercel.app/
  2. Go to the Sign up tab
  3. Enter display name, email and password
  4. Click "Create my account"
- **Expected:** Account is created and the user continues into the app
- **Actual:** Red error banner: "Supabase is not configured. Copy Frontend/.env.example to Frontend/.env and add your keys."
- **Screenshot / error message:** <img width="941" height="489" alt="image" src="https://github.com/user-attachments/assets/74a4a46a-31a5-407f-8efb-bad21a2a5527" />

- **Status:** Open

### BUG-002: Refreshing any page other than home shows 404 NOT_FOUND
- **Severity:** Major
- **Feature / owner:** Deployment/routing (Vercel config) / whoever owns Vercel
- **Steps to reproduce:**
  1. Open https://study-quest-phi.vercel.app/
  2. Navigate (by clicking) to the Create page, Library page, or Login page
  3. Refresh the browser (F5), or paste that page's URL into a new tab
- **Expected:** The same page reloads
- **Actual:** Vercel shows "This page doesn't exist" with the code `404 NOT_FOUND`. Same result on /create, /library and /login. Any unsaved work in the page, such as a study set being created, is lost.
- **Screenshot / error message:** <img width="952" height="500" alt="image" src="https://github.com/user-attachments/assets/8b74be54-a2c2-4509-978a-8c9d1a5c7791" />
- **Status:** Open


## 4. Suggested improvements (UX / design)

- <e.g. add a loading spinner on the dashboard>
- <e.g. error messages should say which field is wrong>

## 5. Missing features / carry over to Sprint 2

- <item>

## 6. Retest log

| Bug | Fixed by | Retested on | Result |
| --- | --- | --- | --- |
| BUG-001 | | | |
